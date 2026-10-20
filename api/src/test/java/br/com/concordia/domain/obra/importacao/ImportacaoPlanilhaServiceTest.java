package br.com.concordia.domain.obra.importacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ImportacaoPlanilhaServiceTest {
    private static final DadosObraImportacao DADOS =
            new DadosObraImportacao(null, UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);

    private final List<Obra> salvas = new ArrayList<>();
    private final ImportacaoPlanilhaService service =
            new ImportacaoPlanilhaService(new ObraRepositoryFake(), new EmpresaRepositoryFake());

    private static ItemPlanilha item(int linha, String codigo, String banco, String codigoComposicao, String total) {
        return new ItemPlanilha(
                linha,
                codigo,
                codigoComposicao,
                banco,
                "SERVIÇO " + codigo,
                null,
                "m²",
                BigDecimal.TEN,
                null,
                new BigDecimal(total).divide(BigDecimal.TEN),
                new BigDecimal(total));
    }

    private static PlanilhaOrcamento planilha(List<SecaoPlanilha> secoes, List<ItemPlanilha> itens) {
        return new PlanilhaOrcamento("Teste", "OBRA DA PLANILHA", new BigDecimal("25"), secoes, itens, List.of());
    }

    private static PlanilhaOrcamento exemplo() {
        return planilha(
                List.of(
                        new SecaoPlanilha(1, "1", "SERVIÇOS PRELIMINARES", new BigDecimal("300")),
                        new SecaoPlanilha(2, "1.1", "CANTEIRO", null),
                        new SecaoPlanilha(5, "2", "PAVIMENTAÇÃO", null)),
                List.of(
                        item(3, "1.1.1", "SINAPI", "103689", "100"),
                        item(4, "1.1.2", "Próprio", "SERV01", "200"),
                        item(6, "2.1", null, null, "700")));
    }

    @Test
    void resumeArvoreCustosEPesos() {
        var resumo = service.resumir(exemplo());

        assertThat(resumo.valida()).isTrue();
        assertThat(resumo.totalItens()).isEqualTo(3);
        assertThat(resumo.totalMacroetapas()).isEqualTo(2);
        assertThat(resumo.totalSubetapas()).isEqualTo(1);
        assertThat(resumo.valorTotalComBdi()).isEqualByComparingTo("1000");
        assertThat(resumo.valorTotalSemBdi()).isEqualByComparingTo("800");
        assertThat(resumo.somaPesos()).isEqualByComparingTo("100");

        var preliminares = resumo.eap().get(0);
        assertThat(preliminares.pesoPercentual()).isEqualByComparingTo("30");
        assertThat(preliminares.quantidadeItens()).isEqualTo(2);
        assertThat(preliminares.filhos().get(0).codigoEap()).isEqualTo("1.1");
        assertThat(preliminares.filhos().get(0).filhos())
                .extracting(NoEapResumo::codigoEap)
                .containsExactly("1.1.1", "1.1.2");
        assertThat(resumo.eap().get(1).pesoPercentual()).isEqualByComparingTo("70");
    }

    @Test
    void cadastraItensSemBancoComoComposicaoPropria() {
        var resumo = service.resumir(exemplo());

        assertThat(resumo.composicoesProprias()).isEqualTo(2);
        var pavimentacao = resumo.eap().get(1).filhos().get(0);
        assertThat(pavimentacao.banco()).isEqualTo(ImportacaoPlanilhaService.COMPOSICAO_PROPRIA);
        assertThat(resumo.avisos()).anyMatch(aviso -> aviso.contains("composição própria"));
    }

    @Test
    void avisaQuandoTotalInformadoDivergeDaSomaDosItens() {
        var dados = planilha(
                List.of(new SecaoPlanilha(1, "1", "SERVIÇOS", new BigDecimal("999"))),
                List.of(item(2, "1.1", "SINAPI", "1", "100")));

        assertThat(service.resumir(dados).avisos()).anyMatch(aviso -> aviso.startsWith("Seção 1: total informado"));
    }

    @Test
    void relataCodigosDuplicados() {
        var dados = planilha(
                List.of(new SecaoPlanilha(1, "1", "SERVIÇOS", null)),
                List.of(item(2, "1.1", "SINAPI", "1", "100"), item(3, "1.1", "SINAPI", "2", "100")));

        var resumo = service.resumir(dados);

        assertThat(resumo.valida()).isFalse();
        assertThat(resumo.erros()).containsExactly(ErroImportacao.naLinha(3, "A", "Código EAP 1.1 está duplicado."));
    }

    @Test
    void persisteObraComMacroetapasSubetapasEItens() {
        var resultado = service.importar(exemplo(), DADOS);

        var obra = salvas.getFirst();
        assertThat(resultado.descricaoObra()).isEqualTo("OBRA DA PLANILHA");
        assertThat(obra.getEtapas()).hasSize(3);
        assertThat(obra.getEap())
                .extracting(ItemEap::getCodigoEap)
                .containsExactly("1", "1.1", "1.1.1", "1.1.2", "2", "2.1");
        assertThat(obra.getEap()).extracting(ItemEap::getPosicao).isSorted();

        var placa = obra.getEap().get(2);
        assertThat(placa.getEtapa()).isNotNull();
        assertThat(placa.getPai().getCodigoEap()).isEqualTo("1.1");
        assertThat(placa.getMacroetapa()).isEqualTo("SERVIÇOS PRELIMINARES › CANTEIRO");
        assertThat(placa.getPercentualBdi()).isEqualByComparingTo("25");
        assertThat(obra.getEap().get(0).getEtapa()).isNull();
        assertThat(obra.getEap().get(0).getValorTotalOrcado()).isEqualByComparingTo("300");
    }

    @Test
    void usaDescricaoInformadaPeloUsuario() {
        var dados =
                new DadosObraImportacao("  Minha obra  ", UnidadeFederativa.PB, ZoneId.of("America/Fortaleza"), null);

        assertThat(service.importar(exemplo(), dados).descricaoObra()).isEqualTo("Minha obra");
    }

    @Test
    void naoPersistePlanilhaComErros() {
        var comErro = new PlanilhaOrcamento(
                "Teste",
                "OBRA",
                null,
                List.of(),
                List.of(),
                List.of(ErroImportacao.naLinha(17, "H", "Item 1.1.1: quantidade \"]\" não é um número válido.")));

        assertThatThrownBy(() -> service.importar(comErro, DADOS))
                .isInstanceOfSatisfying(
                        PlanilhaInvalidaException.class,
                        ex -> assertThat(ex.getErros())
                                .extracting(ErroImportacao::linha)
                                .containsExactly(17));
        assertThat(salvas).isEmpty();
    }

    @Test
    void exigeDescricaoQuandoPlanilhaNaoTemNomeDaObra() {
        var semNome = new PlanilhaOrcamento(
                "Teste", null, null, List.of(), List.of(item(1, "1", "SINAPI", "1", "10")), List.of());

        assertThatThrownBy(() -> service.importar(semNome, DADOS))
                .isInstanceOf(PlanilhaInvalidaException.class)
                .satisfies(ex -> assertThat(((PlanilhaInvalidaException) ex).getErros())
                        .extracting(ErroImportacao::mensagem)
                        .anyMatch(msg -> msg.startsWith("Informe a descrição da obra")));
    }

    private class ObraRepositoryFake implements ObraRepository {
        @Override
        public Obra save(Obra obra) {
            salvas.add(obra);
            return obra;
        }

        @Override
        public Optional<Obra> findById(UUID id) {
            return Optional.empty();
        }

        @Override
        public List<Obra> findAll() {
            return salvas;
        }

        @Override
        public boolean existsById(UUID id) {
            return false;
        }

        @Override
        public void deleteById(UUID id) {}
    }

    private static class EmpresaRepositoryFake implements EmpresaRepository {
        @Override
        public Empresa save(Empresa empresa) {
            return empresa;
        }

        @Override
        public Optional<Empresa> findById(UUID id) {
            return Optional.empty();
        }

        @Override
        public List<Empresa> findAll() {
            return List.of();
        }

        @Override
        public boolean existsById(UUID id) {
            return false;
        }

        @Override
        public void deleteById(UUID id) {}
    }
}
