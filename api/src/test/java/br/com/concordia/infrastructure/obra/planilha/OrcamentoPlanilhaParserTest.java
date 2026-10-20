package br.com.concordia.infrastructure.obra.planilha;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import br.com.concordia.domain.obra.importacao.ErroImportacao;
import br.com.concordia.domain.obra.importacao.ItemPlanilha;
import br.com.concordia.domain.obra.importacao.SecaoPlanilha;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

class OrcamentoPlanilhaParserTest {
    private static final Path PLANILHA_EXEMPLO = Path.of("..", "docs", "orcamento_analitico.xlsx");

    private final OrcamentoPlanilhaParser parser = new OrcamentoPlanilhaParser();

    @Test
    void leAPlanilhaAnaliticaDeExemploDoRepositorio() throws IOException {
        assumeTrue(Files.exists(PLANILHA_EXEMPLO), "planilha de exemplo disponível apenas no repositório completo");

        try (var conteudo = Files.newInputStream(PLANILHA_EXEMPLO)) {
            var planilha = parser.ler(conteudo);

            assertThat(planilha.erros()).isEmpty();
            assertThat(planilha.formato()).isEqualTo(OrcamentoPlanilhaParser.FORMATO_ANALITICO);
            assertThat(planilha.percentualBdi()).isEqualByComparingTo("20.74");
            assertThat(planilha.nomeObra()).startsWith("COMPLEMENTAÇÃO DE OBRA");
            assertThat(planilha.itens()).hasSize(160);
            assertThat(planilha.secoes()).extracting(SecaoPlanilha::codigoEap).contains("1", "1.1");

            var placa = planilha.itens().get(0);
            assertThat(placa.codigoEap()).isEqualTo("1.1.1");
            assertThat(placa.codigoComposicao()).isEqualTo("103689");
            assertThat(placa.banco()).isEqualTo("SINAPI");
            assertThat(placa.quantidade()).isEqualByComparingTo("4.5");
            assertThat(placa.valorTotal()).isEqualByComparingTo("1897.83");
            assertThat(placa.valorUnitarioBase()).isEqualByComparingTo("349.30");
        }
    }

    @Test
    void leBlocoAnaliticoMinimo() {
        var planilha = parser.ler(xlsx(new String[][] {
            {"", "", "", "Obra", "", "", "B.D.I."},
            {"", "", "", "ESCOLA MODELO", "", "", "25,00%"},
            {"1", "", "", "SERVIÇOS PRELIMINARES", "", "", "", "", "", "1000"},
            {"1.1", "Código", "Banco", "Descrição", "Tipo", "", "Und", "Quant.", "Valor Unit", "Total"},
            {"Composição", "SERV01", "", "LOCAÇÃO DA OBRA", "SERP", "", "m²", "1", "80", "80"},
            {"", "", "", "", "", "", "Quant. =>", "10,00", "Preço Total =>", "1000"},
        }));

        assertThat(planilha.erros()).isEmpty();
        assertThat(planilha.nomeObra()).isEqualTo("ESCOLA MODELO");
        assertThat(planilha.percentualBdi()).isEqualByComparingTo("25");
        assertThat(planilha.itens()).singleElement().satisfies(item -> {
            assertThat(item.codigoEap()).isEqualTo("1.1");
            assertThat(item.banco()).isNull();
            assertThat(item.valorUnitario()).isEqualByComparingTo("100");
            assertThat(item.valorTotal()).isEqualByComparingTo("1000");
        });
    }

    @Test
    void relataQuantidadeMalFormatadaComLinhaEColuna() {
        var planilha = parser.ler(xlsx(new String[][] {
            {"1", "", "", "SERVIÇOS PRELIMINARES"},
            {"1.1", "Código", "Banco", "Descrição", "Tipo", "", "Und", "Quant.", "Valor Unit", "Total"},
            {"Composição", "SERV01", "SINAPI", "LOCAÇÃO DA OBRA", "SERP", "", "m²", "1", "80", "80"},
            {"", "", "", "", "", "", "Quant. =>", "1O,00", "Preço Total =>", "1000"},
        }));

        assertThat(planilha.itens()).isEmpty();
        assertThat(planilha.erros()).singleElement().satisfies(erro -> {
            assertThat(erro.linha()).isEqualTo(4);
            assertThat(erro.coluna()).isEqualTo("H");
            assertThat(erro.mensagem()).contains("quantidade", "1O,00");
        });
    }

    @Test
    void leSinteticaComCabecalhosSinonimosEIgnoraRodape() {
        var planilha = parser.ler(xlsx(new String[][] {
            {"Obra:", "PRAÇA CENTRAL"},
            {"BDI: 20%"},
            {},
            {"Item", "Cód.", "Fonte", "Discriminação", "Unid.", "Qtde", "Val. Unit.", "Valor c/ BDI", "Preço Total"},
            {"1", "", "", "PAVIMENTAÇÃO", "", "", "", "", "3600"},
            {"1.1", "94990", "SINAPI", "CALÇADA EM CONCRETO", "m²", "100", "25,00", "30,00", "3.000,00"},
            {"1.2", "", "", "MEIO-FIO PRÉ-MOLDADO", "m", "20", "25,00", "30,00", "600,00"},
            {"", "", "", "TOTAL GERAL", "", "", "", "", "3600"},
        }));

        assertThat(planilha.erros()).isEmpty();
        assertThat(planilha.formato()).isEqualTo(OrcamentoPlanilhaParser.FORMATO_SINTETICO);
        assertThat(planilha.nomeObra()).isEqualTo("PRAÇA CENTRAL");
        assertThat(planilha.percentualBdi()).isEqualByComparingTo("20");
        assertThat(planilha.secoes()).extracting(SecaoPlanilha::codigoEap).containsExactly("1");
        assertThat(planilha.itens()).extracting(ItemPlanilha::codigoEap).containsExactly("1.1", "1.2");
        var calcada = planilha.itens().get(0);
        assertThat(calcada.valorUnitario()).isEqualByComparingTo("30");
        assertThat(calcada.valorUnitarioBase()).isEqualByComparingTo("25");
        assertThat(calcada.valorTotal()).isEqualByComparingTo(new BigDecimal("3000"));
        assertThat(planilha.itens().get(1).codigoComposicao()).isNull();
    }

    @Test
    void relataColunasObrigatoriasAusentes() {
        var planilha = parser.ler(xlsx(new String[][] {
            {"Item", "Descrição", "Valor Unitário"},
            {"1.1", "CALÇADA", "25"},
        }));

        assertThat(planilha.erros())
                .extracting(ErroImportacao::mensagem)
                .containsExactly("Colunas obrigatórias ausentes: Unidade, Quantidade.");
    }

    @Test
    void rejeitaArquivoQueNaoEPlanilha() {
        var planilha = parser.ler(new ByteArrayInputStream("item;descricao".getBytes(StandardCharsets.UTF_8)));

        assertThat(planilha.erros())
                .extracting(ErroImportacao::mensagem)
                .singleElement()
                .asString()
                .contains("não é uma planilha Excel");
    }

    @Test
    void rejeitaPlanilhaSemCabecalhoReconhecido() {
        var planilha = parser.ler(xlsx(new String[][] {{"foo", "bar"}, {"1", "2"}}));

        assertThat(planilha.erros())
                .extracting(ErroImportacao::mensagem)
                .singleElement()
                .asString()
                .startsWith("Formato não reconhecido");
    }

    @Test
    void converteNumerosNoPadraoBrasileiro() {
        assertThat(OrcamentoPlanilhaParser.decimalOuNulo("1.234,56")).isEqualByComparingTo("1234.56");
        assertThat(OrcamentoPlanilhaParser.decimalOuNulo("349.3")).isEqualByComparingTo("349.3");
        assertThat(OrcamentoPlanilhaParser.decimalOuNulo("R$ 10,00")).isEqualByComparingTo("10");
        assertThat(OrcamentoPlanilhaParser.decimalOuNulo("]")).isNull();
    }

    /** Monta um .xlsx em memória; textos numéricos viram células numéricas, como no Excel. */
    private static ByteArrayInputStream xlsx(String[][] linhas) {
        try (var workbook = new XSSFWorkbook();
                var saida = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Orçamento");
            for (int i = 0; i < linhas.length; i++) {
                var row = sheet.createRow(i);
                for (int j = 0; j < linhas[i].length; j++) {
                    var valor = linhas[i][j];
                    if (valor.isEmpty()) {
                        continue;
                    }
                    var cell = row.createCell(j);
                    if (valor.matches("-?\\d+(\\.\\d+)?") && !valor.contains(".") && j > 0) {
                        cell.setCellValue(Double.parseDouble(valor));
                    } else {
                        cell.setCellValue(valor);
                    }
                }
            }
            workbook.write(saida);
            return new ByteArrayInputStream(saida.toByteArray());
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
