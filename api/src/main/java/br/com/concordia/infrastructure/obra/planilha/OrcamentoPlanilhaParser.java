package br.com.concordia.infrastructure.obra.planilha;

import br.com.concordia.domain.obra.importacao.ErroImportacao;
import br.com.concordia.domain.obra.importacao.ItemPlanilha;
import br.com.concordia.domain.obra.importacao.PlanilhaOrcamento;
import br.com.concordia.domain.obra.importacao.SecaoPlanilha;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.util.CellReference;
import org.springframework.stereotype.Component;

/**
 * Lê planilhas orçamentárias Excel ({@code .xlsx}/{@code .xls}) e extrai a EAP com valores.
 *
 * <p>Dois layouts são reconhecidos:
 *
 * <ul>
 *   <li><b>Analítica</b> (exportação de orçamentos SINAPI): cada item de serviço é um bloco iniciado pelo cabeçalho
 *       "código EAP | Código | Banco | Descrição…", seguido da linha "Composição" e encerrado pela linha de
 *       totais "Quant. =&gt; … Preço Total =&gt;".
 *   <li><b>Sintética</b>: uma linha de cabeçalho com colunas reconhecidas por sinônimos (ex.: "Val. Unit.",
 *       "Valor Unitário", "Preço Unitário") e uma linha por item; linhas sem unidade e quantidade são agrupamentos.
 * </ul>
 *
 * <p>Problemas de leitura não interrompem o parsing: são acumulados em {@link PlanilhaOrcamento#erros()} para
 * compor o relatório apresentado ao usuário.
 */
@Component
public class OrcamentoPlanilhaParser {
    static final String FORMATO_ANALITICO = "Planilha analítica (composições SINAPI)";
    static final String FORMATO_SINTETICO = "Planilha sintética";

    private static final Pattern CODIGO_EAP = Pattern.compile("\\d+(?:\\.\\d+)*");
    private static final int LINHAS_BUSCA_CABECALHO = 30;

    private enum Coluna {
        ITEM("Item"),
        CODIGO("Código"),
        BANCO("Banco"),
        DESCRICAO("Descrição"),
        TIPO("Tipo"),
        UNIDADE("Unidade"),
        QUANTIDADE("Quantidade"),
        VALOR_UNITARIO("Valor unitário"),
        VALOR_UNITARIO_BDI("Valor unitário com BDI"),
        TOTAL("Total");

        private final String rotulo;

        Coluna(String rotulo) {
            this.rotulo = rotulo;
        }
    }

    /** Sinônimos de cabeçalho já normalizados (sem acento, minúsculos, pontuação vira espaço). */
    private static final Map<Coluna, Set<String>> SINONIMOS = new EnumMap<>(Map.of(
            Coluna.ITEM, Set.of("item", "eap", "codigo eap", "cod eap", "n", "no", "numero"),
            Coluna.CODIGO, Set.of("codigo", "cod", "codigo sinapi", "cod sinapi", "codigo composicao", "ref"),
            Coluna.BANCO, Set.of("banco", "fonte", "base", "base de preco", "referencia"),
            Coluna.DESCRICAO, Set.of("descricao", "descricao do servico", "discriminacao", "servico", "especificacao"),
            Coluna.TIPO, Set.of("tipo", "classe"),
            Coluna.UNIDADE, Set.of("und", "un", "unid", "unidade"),
            Coluna.QUANTIDADE, Set.of("quant", "quantidade", "qtd", "qtde"),
            Coluna.VALOR_UNITARIO,
                    Set.of(
                            "valor unit",
                            "val unit",
                            "valor unitario",
                            "preco unitario",
                            "preco unit",
                            "custo unitario",
                            "valor unit sem bdi",
                            "valor unitario sem bdi",
                            "valor s bdi",
                            "valor sem bdi"),
            Coluna.VALOR_UNITARIO_BDI,
                    Set.of(
                            "valor c bdi",
                            "valor com bdi",
                            "valor unit c bdi",
                            "valor unit com bdi",
                            "valor unitario c bdi",
                            "valor unitario com bdi",
                            "preco unitario c bdi",
                            "preco unitario com bdi",
                            "preco c bdi",
                            "preco com bdi"),
            Coluna.TOTAL,
                    Set.of(
                            "total",
                            "valor total",
                            "preco total",
                            "custo total",
                            "total c bdi",
                            "total com bdi",
                            "valor total c bdi",
                            "valor total com bdi")));

    private record Linha(int numero, Map<String, String> celulas) {
        String valor(String coluna) {
            return celulas.getOrDefault(coluna, "").trim();
        }

        boolean vazia() {
            return celulas.values().stream().allMatch(String::isBlank);
        }
    }

    public PlanilhaOrcamento ler(InputStream conteudo) {
        List<Linha> linhas;
        try (var workbook = WorkbookFactory.create(conteudo)) {
            if (workbook.getNumberOfSheets() == 0) {
                return invalida("A planilha não possui abas.");
            }
            linhas = lerLinhas(workbook.getSheetAt(0));
        } catch (IOException | RuntimeException e) {
            return invalida("Não foi possível ler o arquivo: ele não é uma planilha Excel (.xlsx ou .xls) válida.");
        }

        if (linhas.stream().allMatch(Linha::vazia)) {
            return invalida("A planilha está vazia.");
        }
        boolean analitica = linhas.stream().anyMatch(linha -> "Composição".equalsIgnoreCase(linha.valor("A")));
        return analitica ? lerAnalitica(linhas) : lerSintetica(linhas);
    }

    private static PlanilhaOrcamento invalida(String mensagem) {
        return new PlanilhaOrcamento(null, null, null, List.of(), List.of(), List.of(ErroImportacao.geral(mensagem)));
    }

    // ---------------------------------------------------------------- planilha analítica

    private PlanilhaOrcamento lerAnalitica(List<Linha> linhas) {
        List<ErroImportacao> erros = new ArrayList<>();
        List<SecaoPlanilha> secoes = new ArrayList<>();
        List<ItemPlanilha> itens = new ArrayList<>();
        var cabecalho = lerCabecalhoAnalitico(linhas);

        String codigoBloco = null;
        for (int i = 0; i < linhas.size(); i++) {
            var linha = linhas.get(i);
            var colunaA = linha.valor("A");

            if (CODIGO_EAP.matcher(colunaA).matches()) {
                var descricao = linha.valor("D");
                if (descricao.equalsIgnoreCase("Descrição")) {
                    codigoBloco = colunaA;
                } else if (!descricao.isEmpty() && !descricao.equalsIgnoreCase("Descrição Total")) {
                    secoes.add(new SecaoPlanilha(linha.numero(), colunaA, descricao, decimalOuNulo(linha.valor("J"))));
                }
                continue;
            }
            if (!"Composição".equalsIgnoreCase(colunaA)) {
                continue;
            }
            if (codigoBloco == null) {
                erros.add(ErroImportacao.naLinha(
                        linha.numero(), "A", "Composição sem cabeçalho com código EAP na linha anterior."));
                continue;
            }
            lerComposicao(linhas, i, codigoBloco, erros).ifPresent(itens::add);
            codigoBloco = null;
        }

        return new PlanilhaOrcamento(
                FORMATO_ANALITICO, cabecalho.get("obra"), percentual(cabecalho.get("bdi")), secoes, itens, erros);
    }

    private Optional<ItemPlanilha> lerComposicao(
            List<Linha> linhas, int indice, String codigoEap, List<ErroImportacao> erros) {
        var linha = linhas.get(indice);
        int errosAntes = erros.size();

        Linha totais = null;
        for (int j = indice + 1; j < linhas.size(); j++) {
            var candidata = linhas.get(j);
            if (CODIGO_EAP.matcher(candidata.valor("A")).matches()) {
                break;
            }
            if (candidata.valor("G").startsWith("Quant.")) {
                totais = candidata;
                break;
            }
        }

        var descricao = linha.valor("D");
        if (descricao.isEmpty()) {
            erros.add(ErroImportacao.naLinha(linha.numero(), "D", "Item %s sem descrição.".formatted(codigoEap)));
        }
        var unidade = linha.valor("G");
        if (unidade.isEmpty()) {
            erros.add(ErroImportacao.naLinha(linha.numero(), "G", "Item %s sem unidade.".formatted(codigoEap)));
        }
        var valorBase = numero(linha, "I", "valor unitário", codigoEap, erros);
        if (totais == null) {
            erros.add(ErroImportacao.naLinha(
                    linha.numero(),
                    "G",
                    "Item %s: linha de totais (\"Quant. =>\" / \"Preço Total =>\") não encontrada."
                            .formatted(codigoEap)));
            return Optional.empty();
        }
        var quantidade = numero(totais, "H", "quantidade", codigoEap, erros);
        var total = numero(totais, "J", "preço total", codigoEap, erros);
        if (erros.size() > errosAntes) {
            return Optional.empty();
        }

        var totalArredondado = total.setScale(2, RoundingMode.HALF_UP);
        var unitario = quantidade.signum() == 0
                ? BigDecimal.ZERO
                : totalArredondado.divide(quantidade, 2, RoundingMode.HALF_UP);
        return Optional.of(new ItemPlanilha(
                linha.numero(),
                codigoEap,
                vazioParaNulo(linha.valor("B")),
                vazioParaNulo(linha.valor("C")),
                descricao,
                vazioParaNulo(linha.valor("E")),
                unidade,
                quantidade.setScale(4, RoundingMode.HALF_UP),
                valorBase.setScale(2, RoundingMode.HALF_UP),
                unitario,
                totalArredondado));
    }

    /** Lê "Obra" e "B.D.I." das primeiras linhas: o valor fica na célula logo abaixo do rótulo. */
    private static Map<String, String> lerCabecalhoAnalitico(List<Linha> linhas) {
        Map<String, String> cabecalho = new HashMap<>();
        for (int i = 0; i + 1 < linhas.size() && i < 10; i++) {
            for (var celula : linhas.get(i).celulas().entrySet()) {
                var rotulo = normalizar(celula.getValue());
                var abaixo = linhas.get(i + 1).valor(celula.getKey());
                if (abaixo.isEmpty()) {
                    continue;
                }
                if (rotulo.equals("obra")) {
                    cabecalho.putIfAbsent(
                            "obra", abaixo.lines().findFirst().orElse(abaixo).trim());
                } else if (rotulo.equals("b d i") || rotulo.equals("bdi")) {
                    cabecalho.putIfAbsent("bdi", abaixo);
                }
            }
        }
        return cabecalho;
    }

    // ---------------------------------------------------------------- planilha sintética

    private PlanilhaOrcamento lerSintetica(List<Linha> linhas) {
        List<ErroImportacao> erros = new ArrayList<>();
        int indiceCabecalho = -1;
        Map<Coluna, String> colunas = Map.of();
        for (int i = 0; i < Math.min(linhas.size(), LINHAS_BUSCA_CABECALHO); i++) {
            var reconhecidas = reconhecerColunas(linhas.get(i));
            if (reconhecidas.containsKey(Coluna.ITEM) && reconhecidas.containsKey(Coluna.DESCRICAO)) {
                indiceCabecalho = i;
                colunas = reconhecidas;
                break;
            }
        }
        if (indiceCabecalho < 0) {
            return invalida("Formato não reconhecido: não foi encontrada uma linha de cabeçalho com as colunas "
                    + "Item e Descrição, nem os blocos de composição de uma planilha analítica.");
        }

        var linhaCabecalho = linhas.get(indiceCabecalho).numero();
        List<String> ausentes = new ArrayList<>();
        for (var obrigatoria : List.of(Coluna.UNIDADE, Coluna.QUANTIDADE)) {
            if (!colunas.containsKey(obrigatoria)) {
                ausentes.add(obrigatoria.rotulo);
            }
        }
        if (!colunas.containsKey(Coluna.VALOR_UNITARIO)
                && !colunas.containsKey(Coluna.VALOR_UNITARIO_BDI)
                && !colunas.containsKey(Coluna.TOTAL)) {
            ausentes.add("Valor unitário ou Total");
        }
        if (!ausentes.isEmpty()) {
            erros.add(ErroImportacao.naLinha(
                    linhaCabecalho, null, "Colunas obrigatórias ausentes: " + String.join(", ", ausentes) + "."));
            return new PlanilhaOrcamento(FORMATO_SINTETICO, null, null, List.of(), List.of(), erros);
        }

        var bdi = procurarBdi(linhas.subList(0, indiceCabecalho));
        var nomeObra = procurarRotulo(linhas.subList(0, indiceCabecalho), "obra");
        List<SecaoPlanilha> secoes = new ArrayList<>();
        List<ItemPlanilha> itens = new ArrayList<>();

        for (var linha : linhas.subList(indiceCabecalho + 1, linhas.size())) {
            var codigo = linha.valor(colunas.get(Coluna.ITEM));
            if (!CODIGO_EAP.matcher(codigo).matches()) {
                continue; // linhas vazias, subtotais e rodapés
            }
            var descricao = linha.valor(colunas.get(Coluna.DESCRICAO));
            if (descricao.isEmpty()) {
                erros.add(ErroImportacao.naLinha(
                        linha.numero(), colunas.get(Coluna.DESCRICAO), "Item %s sem descrição.".formatted(codigo)));
                continue;
            }
            var unidade = linha.valor(colunas.get(Coluna.UNIDADE));
            var quantidadeTexto = linha.valor(colunas.get(Coluna.QUANTIDADE));
            if (unidade.isEmpty() && quantidadeTexto.isEmpty()) {
                secoes.add(new SecaoPlanilha(
                        linha.numero(), codigo, descricao, decimalOuNulo(valorDe(linha, colunas, Coluna.TOTAL))));
                continue;
            }
            lerItemSintetico(linha, codigo, descricao, unidade, colunas, bdi, erros)
                    .ifPresent(itens::add);
        }
        return new PlanilhaOrcamento(FORMATO_SINTETICO, nomeObra, bdi, secoes, itens, erros);
    }

    private Optional<ItemPlanilha> lerItemSintetico(
            Linha linha,
            String codigo,
            String descricao,
            String unidade,
            Map<Coluna, String> colunas,
            BigDecimal bdi,
            List<ErroImportacao> erros) {
        int errosAntes = erros.size();
        if (unidade.isEmpty()) {
            erros.add(ErroImportacao.naLinha(
                    linha.numero(), colunas.get(Coluna.UNIDADE), "Item %s sem unidade.".formatted(codigo)));
        }
        var quantidade = numero(linha, colunas.get(Coluna.QUANTIDADE), "quantidade", codigo, erros);
        var unitarioSemBdi = numeroOpcional(linha, colunas.get(Coluna.VALOR_UNITARIO), "valor unitário", codigo, erros);
        var unitarioComBdi =
                numeroOpcional(linha, colunas.get(Coluna.VALOR_UNITARIO_BDI), "valor com BDI", codigo, erros);
        var total = numeroOpcional(linha, colunas.get(Coluna.TOTAL), "total", codigo, erros);
        if (erros.size() > errosAntes) {
            return Optional.empty();
        }

        var unitario = unitarioComBdi != null ? unitarioComBdi : unitarioSemBdi;
        if (unitarioComBdi == null && unitarioSemBdi != null && bdi != null && !colunas.containsKey(Coluna.TOTAL)) {
            unitario = unitarioSemBdi.multiply(BigDecimal.ONE.add(bdi.movePointLeft(2)));
        }
        if (total == null && unitario == null) {
            erros.add(ErroImportacao.naLinha(
                    linha.numero(), null, "Item %s sem valor unitário nem total.".formatted(codigo)));
            return Optional.empty();
        }
        if (total == null) {
            total = unitario.multiply(quantidade);
        }
        if (unitario == null) {
            unitario = quantidade.signum() == 0 ? BigDecimal.ZERO : total.divide(quantidade, 2, RoundingMode.HALF_UP);
        }

        return Optional.of(new ItemPlanilha(
                linha.numero(),
                codigo,
                vazioParaNulo(valorDe(linha, colunas, Coluna.CODIGO)),
                vazioParaNulo(valorDe(linha, colunas, Coluna.BANCO)),
                descricao,
                vazioParaNulo(valorDe(linha, colunas, Coluna.TIPO)),
                unidade,
                quantidade.setScale(4, RoundingMode.HALF_UP),
                unitarioComBdi != null && unitarioSemBdi != null
                        ? unitarioSemBdi.setScale(2, RoundingMode.HALF_UP)
                        : null,
                unitario.setScale(2, RoundingMode.HALF_UP),
                total.setScale(2, RoundingMode.HALF_UP)));
    }

    private static Map<Coluna, String> reconhecerColunas(Linha linha) {
        Map<Coluna, String> reconhecidas = new EnumMap<>(Coluna.class);
        for (var celula : linha.celulas().entrySet()) {
            var texto = normalizar(celula.getValue());
            if (texto.isEmpty()) {
                continue;
            }
            for (var sinonimo : SINONIMOS.entrySet()) {
                if (sinonimo.getValue().contains(texto)) {
                    reconhecidas.putIfAbsent(sinonimo.getKey(), celula.getKey());
                    break;
                }
            }
        }
        return reconhecidas;
    }

    private static String valorDe(Linha linha, Map<Coluna, String> colunas, Coluna coluna) {
        var letra = colunas.get(coluna);
        return letra == null ? "" : linha.valor(letra);
    }

    /** Procura "BDI" antes do cabeçalho: aceita "BDI: 25%", o valor à direita ou logo abaixo do rótulo. */
    private static BigDecimal procurarBdi(List<Linha> linhas) {
        for (int i = 0; i < linhas.size(); i++) {
            for (var celula : linhas.get(i).celulas().entrySet()) {
                var texto = celula.getValue();
                var normalizado = normalizar(texto);
                if (!normalizado.startsWith("bdi") && !normalizado.startsWith("b d i")) {
                    continue;
                }
                var valorNaCelula = texto.contains(":") ? percentual(texto.substring(texto.indexOf(':') + 1)) : null;
                if (valorNaCelula != null) {
                    return valorNaCelula;
                }
                var direita = percentual(linhas.get(i).valor(proximaColuna(celula.getKey())));
                if (direita != null) {
                    return direita;
                }
                if (i + 1 < linhas.size()) {
                    var abaixo = percentual(linhas.get(i + 1).valor(celula.getKey()));
                    if (abaixo != null) {
                        return abaixo;
                    }
                }
            }
        }
        return null;
    }

    private static String procurarRotulo(List<Linha> linhas, String rotulo) {
        for (var linha : linhas) {
            for (var celula : linha.celulas().entrySet()) {
                var texto = celula.getValue();
                if (!normalizar(texto).startsWith(rotulo)) {
                    continue;
                }
                if (texto.contains(":")
                        && !texto.substring(texto.indexOf(':') + 1).isBlank()) {
                    return texto.substring(texto.indexOf(':') + 1).trim();
                }
                var direita = linha.valor(proximaColuna(celula.getKey()));
                if (!direita.isEmpty()) {
                    return direita;
                }
            }
        }
        return null;
    }

    // ---------------------------------------------------------------- utilitários

    private static List<Linha> lerLinhas(Sheet sheet) {
        List<Linha> linhas = new ArrayList<>();
        for (Row row : sheet) {
            Map<String, String> celulas = new HashMap<>();
            for (Cell cell : row) {
                var texto = texto(cell);
                if (!texto.isEmpty()) {
                    celulas.put(CellReference.convertNumToColString(cell.getColumnIndex()), texto);
                }
            }
            linhas.add(new Linha(row.getRowNum() + 1, celulas));
        }
        return linhas;
    }

    private static String texto(Cell cell) {
        var tipo = cell.getCellType() == CellType.FORMULA ? cell.getCachedFormulaResultType() : cell.getCellType();
        return switch (tipo) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC ->
                BigDecimal.valueOf(cell.getNumericCellValue())
                        .stripTrailingZeros()
                        .toPlainString();
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private static BigDecimal numero(
            Linha linha, String coluna, String campo, String codigo, List<ErroImportacao> erros) {
        var texto = linha.valor(coluna);
        if (texto.isEmpty()) {
            erros.add(ErroImportacao.naLinha(
                    linha.numero(), coluna, "Item %s: %s não informado(a).".formatted(codigo, campo)));
            return BigDecimal.ZERO;
        }
        return numeroOpcional(linha, coluna, campo, codigo, erros);
    }

    private static BigDecimal numeroOpcional(
            Linha linha, String coluna, String campo, String codigo, List<ErroImportacao> erros) {
        if (coluna == null) {
            return null;
        }
        var texto = linha.valor(coluna);
        if (texto.isEmpty()) {
            return null;
        }
        var valor = decimalOuNulo(texto);
        if (valor == null) {
            erros.add(ErroImportacao.naLinha(
                    linha.numero(),
                    coluna,
                    "Item %s: %s \"%s\" não é um número válido.".formatted(codigo, campo, texto)));
            return BigDecimal.ZERO;
        }
        return valor;
    }

    /** Aceita "1.234,56" (pt-BR), "1234.56", "R$ 10,00" e "20,74%". */
    static BigDecimal decimalOuNulo(String texto) {
        if (texto == null) {
            return null;
        }
        var limpo = texto.replace("R$", "")
                .replace("%", "")
                .replace(" ", "")
                .replace(" ", "")
                .trim();
        if (limpo.isEmpty()) {
            return null;
        }
        if (limpo.contains(",")) {
            limpo = limpo.replace(".", "").replace(',', '.');
        }
        try {
            return new BigDecimal(limpo);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static BigDecimal percentual(String texto) {
        var valor = decimalOuNulo(texto);
        if (valor == null) {
            return null;
        }
        // Células formatadas como porcentagem chegam como fração (0.2074).
        return valor.compareTo(BigDecimal.ONE) < 0 && !texto.contains("%") ? valor.movePointRight(2) : valor;
    }

    private static String normalizar(String texto) {
        var semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    private static String proximaColuna(String coluna) {
        return CellReference.convertNumToColString(CellReference.convertColStringToIndex(coluna) + 1);
    }

    private static String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
