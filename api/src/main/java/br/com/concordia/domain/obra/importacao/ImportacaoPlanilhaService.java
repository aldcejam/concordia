package br.com.concordia.domain.obra.importacao;

import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UC01 — valida a planilha orçamentária já lida, monta a árvore hierárquica da EAP, calcula pesos percentuais e
 * persiste a obra com macroetapas, subetapas e itens de serviço.
 */
@Service
public class ImportacaoPlanilhaService {
    public static final String COMPOSICAO_PROPRIA = "Composição Própria";

    private static final double INTERVALO_POSICAO = 1000.0;
    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final BigDecimal TOLERANCIA_TOTAL_SECAO = BigDecimal.ONE;
    private static final String SEPARADOR_MACROETAPA = " › ";

    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;

    public ImportacaoPlanilhaService(ObraRepository obraRepository, EmpresaRepository empresaRepository) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
    }

    /** Pré-visualização: valida e resume a planilha sem persistir nada. */
    public ResumoImportacao resumir(PlanilhaOrcamento planilha) {
        return montar(planilha).resumo();
    }

    @Transactional
    public ResultadoImportacao importar(PlanilhaOrcamento planilha, DadosObraImportacao dados) {
        var montagem = montar(planilha);
        var resumo = montagem.resumo();

        var descricao = dados.descricao() == null || dados.descricao().isBlank()
                ? resumo.nomeObra()
                : dados.descricao().trim();
        if (descricao == null || descricao.isBlank()) {
            var erros = new ArrayList<>(resumo.erros());
            erros.add(ErroImportacao.geral("Informe a descrição da obra: a planilha não contém o nome da obra."));
            throw new PlanilhaInvalidaException(erros);
        }
        if (!resumo.valida()) {
            throw new PlanilhaInvalidaException(resumo.erros());
        }

        var obra = new Obra(descricao, dados.uf(), dados.fusoHorario(), obterEmpresa(dados));
        var posicao = new int[] {0};
        for (var raiz : montagem.raizes()) {
            persistir(obra, raiz, null, List.of(), resumo.percentualBdi(), posicao);
        }
        var salva = obraRepository.save(obra);
        return new ResultadoImportacao(salva.getId(), salva.getDescricao(), resumo);
    }

    private void persistir(Obra obra, No no, ItemEap pai, List<String> caminho, BigDecimal bdi, int[] posicao) {
        var ordem = ++posicao[0] * INTERVALO_POSICAO;
        if (no.item != null) {
            var item = no.item;
            var etapa = new EtapaObra(item.descricao(), null, null);
            var itemEap = new ItemEap(obra, item.descricao(), pai, ordem, etapa);
            itemEap.atualizarDadosOrcamento(
                    item.descricao(),
                    item.codigoEap(),
                    no.banco,
                    item.codigoComposicao(),
                    item.tipo(),
                    String.join(SEPARADOR_MACROETAPA, caminho),
                    item.unidade(),
                    item.quantidade(),
                    item.valorUnitario(),
                    item.valorUnitarioBase(),
                    bdi,
                    item.valorTotal());
            obra.adicionarEtapa(etapa);
            obra.adicionarItemEap(itemEap);
            return;
        }

        var secao = new ItemEap(obra, no.nome, pai, ordem);
        secao.atualizarDadosOrcamento(
                no.nome,
                no.codigo,
                null,
                null,
                null,
                String.join(SEPARADOR_MACROETAPA, caminho),
                null,
                null,
                null,
                null,
                bdi,
                no.valorTotal);
        obra.adicionarItemEap(secao);

        var caminhoFilhos = new ArrayList<>(caminho);
        caminhoFilhos.add(no.nome);
        for (var filho : no.filhos) {
            persistir(obra, filho, secao, caminhoFilhos, bdi, posicao);
        }
    }

    private Empresa obterEmpresa(DadosObraImportacao dados) {
        if (dados.idEmpresa() == null) {
            return null;
        }
        return empresaRepository
                .findById(dados.idEmpresa())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Empresa com ID %s não foi encontrada no banco".formatted(dados.idEmpresa())));
    }

    private Montagem montar(PlanilhaOrcamento planilha) {
        List<ErroImportacao> erros = new ArrayList<>(planilha.erros());
        List<String> avisos = new ArrayList<>();

        if (planilha.itens().isEmpty() && erros.isEmpty()) {
            erros.add(ErroImportacao.geral("Nenhum item de serviço foi encontrado na planilha."));
        }
        if (planilha.percentualBdi() == null) {
            avisos.add("BDI não informado na planilha; os valores foram importados como estão.");
        }

        Map<String, No> secoes = new LinkedHashMap<>();
        Set<String> codigosUsados = new HashSet<>();
        List<No> raizes = new ArrayList<>();

        for (var secao : planilha.secoes()) {
            if (!codigosUsados.add(secao.codigoEap())) {
                erros.add(ErroImportacao.naLinha(
                        secao.linha(), "A", "Código EAP %s está duplicado.".formatted(secao.codigoEap())));
                continue;
            }
            var no = No.secao(secao);
            secoes.put(secao.codigoEap(), no);
            var pai = ancestral(secao.codigoEap(), secoes);
            if (pai == null) {
                raizes.add(no);
            } else {
                pai.filhos.add(no);
            }
        }

        int composicoesProprias = 0;
        for (var item : planilha.itens()) {
            if (!codigosUsados.add(item.codigoEap())) {
                erros.add(ErroImportacao.naLinha(
                        item.linha(), "A", "Código EAP %s está duplicado.".formatted(item.codigoEap())));
                continue;
            }
            validarValores(item, erros);

            var no = No.item(item);
            if (isComposicaoPropria(item)) {
                composicoesProprias++;
            }
            var pai = ancestral(item.codigoEap(), secoes);
            if (pai == null) {
                avisos.add("Item %s (linha %d) não pertence a nenhuma macroetapa da planilha."
                        .formatted(item.codigoEap(), item.linha()));
                raizes.add(no);
            } else {
                pai.filhos.add(no);
            }
        }

        var totalComBdi = raizes.stream().map(No::somarTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        var totalSemBdi = planilha.itens().stream()
                .map(item -> valorSemBdi(item, planilha.percentualBdi()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        raizes.forEach(raiz -> raiz.calcularPeso(totalComBdi));
        secoes.values().forEach(secao -> conferirTotalInformado(secao, avisos));
        if (composicoesProprias > 0) {
            avisos.add("%d item(ns) cadastrado(s) como composição própria (sem código de banco oficial)."
                    .formatted(composicoesProprias));
        }

        var eap = raizes.stream().map(No::paraResumo).toList();
        var somaPesos = eap.stream()
                .map(NoEapResumo::pesoPercentual)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        int macroetapas = (int) raizes.stream().filter(no -> no.item == null).count();
        int subetapas = secoes.size() - macroetapas;

        var resumo = new ResumoImportacao(
                planilha.formato(),
                planilha.nomeObra(),
                planilha.percentualBdi(),
                planilha.itens().size(),
                macroetapas,
                subetapas,
                composicoesProprias,
                totalSemBdi,
                totalComBdi.setScale(2, RoundingMode.HALF_UP),
                somaPesos,
                eap,
                List.copyOf(erros),
                List.copyOf(avisos));
        return new Montagem(resumo, raizes);
    }

    private static void validarValores(ItemPlanilha item, List<ErroImportacao> erros) {
        if (item.quantidade() != null && item.quantidade().signum() < 0) {
            erros.add(ErroImportacao.naLinha(
                    item.linha(), "Quantidade", "Item %s com quantidade negativa.".formatted(item.codigoEap())));
        }
        if (item.valorTotal() != null && item.valorTotal().signum() < 0) {
            erros.add(ErroImportacao.naLinha(
                    item.linha(), "Total", "Item %s com valor total negativo.".formatted(item.codigoEap())));
        }
    }

    private static void conferirTotalInformado(No secao, List<String> avisos) {
        if (secao.valorInformado == null) {
            return;
        }
        var diferenca = secao.valorInformado.subtract(secao.valorTotal).abs();
        if (diferenca.compareTo(TOLERANCIA_TOTAL_SECAO) > 0) {
            avisos.add("Seção %s: total informado na planilha (R$ %s) difere da soma dos itens (R$ %s)."
                    .formatted(
                            secao.codigo,
                            secao.valorInformado.setScale(2, RoundingMode.HALF_UP),
                            secao.valorTotal.setScale(2, RoundingMode.HALF_UP)));
        }
    }

    private static BigDecimal valorSemBdi(ItemPlanilha item, BigDecimal bdi) {
        if (item.valorUnitarioBase() != null && item.quantidade() != null) {
            return item.valorUnitarioBase().multiply(item.quantidade());
        }
        var total = item.valorTotal() == null ? BigDecimal.ZERO : item.valorTotal();
        if (bdi == null) {
            return total;
        }
        return total.divide(BigDecimal.ONE.add(bdi.divide(CEM, 6, RoundingMode.HALF_UP)), 2, RoundingMode.HALF_UP);
    }

    /** UC01, fluxo alternativo 4a: itens sem código ou banco de referência são composições próprias. */
    static boolean isComposicaoPropria(ItemPlanilha item) {
        var banco = item.banco() == null ? "" : item.banco().trim().toLowerCase(Locale.ROOT);
        return banco.isEmpty()
                || banco.startsWith("própri")
                || banco.startsWith("propri")
                || item.codigoComposicao() == null
                || item.codigoComposicao().isBlank();
    }

    /** Seção mais próxima cujo código é prefixo hierárquico do código informado ("8.1.1" → "8.1" → "8"). */
    private static No ancestral(String codigo, Map<String, No> secoes) {
        var atual = codigo;
        while (atual.contains(".")) {
            atual = atual.substring(0, atual.lastIndexOf('.'));
            var encontrada = secoes.get(atual);
            if (encontrada != null) {
                return encontrada;
            }
        }
        return null;
    }

    private record Montagem(ResumoImportacao resumo, List<No> raizes) {}

    /** Nó mutável usado apenas durante a montagem da árvore. */
    private static final class No {
        private final String codigo;
        private final String nome;
        private final ItemPlanilha item;
        private final String banco;
        private final BigDecimal valorInformado;
        private final List<No> filhos = new ArrayList<>();
        private BigDecimal valorTotal = BigDecimal.ZERO;
        private BigDecimal peso = BigDecimal.ZERO;

        private No(String codigo, String nome, ItemPlanilha item, String banco, BigDecimal valorInformado) {
            this.codigo = codigo;
            this.nome = nome;
            this.item = item;
            this.banco = banco;
            this.valorInformado = valorInformado;
        }

        static No secao(SecaoPlanilha secao) {
            return new No(secao.codigoEap(), secao.nome(), null, null, secao.valorTotalInformado());
        }

        static No item(ItemPlanilha item) {
            var banco = item.banco() == null || item.banco().isBlank() ? COMPOSICAO_PROPRIA : item.banco();
            return new No(item.codigoEap(), item.descricao(), item, banco, null);
        }

        BigDecimal somarTotal() {
            if (item != null) {
                valorTotal = item.valorTotal() == null ? BigDecimal.ZERO : item.valorTotal();
            } else {
                valorTotal = filhos.stream().map(No::somarTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            return valorTotal;
        }

        void calcularPeso(BigDecimal totalObra) {
            peso = totalObra.signum() == 0
                    ? BigDecimal.ZERO
                    : valorTotal.multiply(CEM).divide(totalObra, 4, RoundingMode.HALF_UP);
            filhos.forEach(filho -> filho.calcularPeso(totalObra));
        }

        int contarItens() {
            return item != null ? 1 : filhos.stream().mapToInt(No::contarItens).sum();
        }

        NoEapResumo paraResumo() {
            return new NoEapResumo(
                    codigo,
                    nome,
                    item != null,
                    banco,
                    item == null ? null : item.codigoComposicao(),
                    item == null ? null : item.unidade(),
                    item == null ? null : item.quantidade(),
                    valorTotal.setScale(2, RoundingMode.HALF_UP),
                    peso,
                    contarItens(),
                    filhos.stream().map(No::paraResumo).toList());
        }
    }
}
