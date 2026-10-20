package br.com.concordia.domain.obra;

import static org.junit.jupiter.api.Assertions.*;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.obra.dependencia.DependenciaEtapaRepository;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.RespostaIa;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.SugestaoIaResultado;
import br.com.concordia.infrastructure.obra.dtos.SugestaoAtrasoRequest;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class SugestaoAdiantamentoServiceTest {

    private ObraRepository obraRepository;
    private IaReprogramacaoClient iaClient;
    private SugestaoAdiantamentoService service;

    @BeforeEach
    void setUp() {
        obraRepository = Mockito.mock(ObraRepository.class);
        iaClient = Mockito.mock(IaReprogramacaoClient.class);
        service = new SugestaoAdiantamentoService(
                obraRepository, iaClient, Mockito.mock(DependenciaEtapaRepository.class));
    }

    @Test
    void deveRetornarMensagemExplicativaQuandoIaNaoIdentificaEtapas() {
        UUID obraId = UUID.randomUUID();
        Obra obra = new Obra("Reforma Geral", UnidadeFederativa.CE, ZoneId.of("America/Fortaleza"), null);

        UUID idEtapa1 = UUID.randomUUID();
        UUID idEtapa2 = UUID.randomUUID();

        EtapaObra etapa1 = new EtapaObra("Demolição e Limpeza", null, 10);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa1, "id", idEtapa1);
        ItemEap item1 = new ItemEap(obra, "Demolição e Limpeza", 1000.0, etapa1);
        org.springframework.test.util.ReflectionTestUtils.setField(item1, "id", UUID.randomUUID());
        item1.atualizarDadosOrcamento(
                "Demolição e Limpeza", "1.1", null, null, null, null, null, null, null, null, null, null);
        obra.adicionarItemEap(item1);

        EtapaObra etapa2 = new EtapaObra("Estrutura e Alvenaria", null, 20);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa2, "id", idEtapa2);
        ItemEap item2 = new ItemEap(obra, "Estrutura e Alvenaria", 2000.0, etapa2);
        org.springframework.test.util.ReflectionTestUtils.setField(item2, "id", UUID.randomUUID());
        item2.atualizarDadosOrcamento(
                "Estrutura e Alvenaria", "1.2", null, null, null, null, null, null, null, null, null, null);
        obra.adicionarItemEap(item2);

        String mensagemIa =
                "Devido à dependência estrutural direta, não foi possível identificar etapas passíveis de adiantamento.";
        Mockito.when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));
        Mockito.when(iaClient.sugerirAdiantamento(
                        Mockito.any(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyList()))
                .thenReturn(new RespostaIa(mensagemIa, List.of()));

        var request = new SugestaoAtrasoRequest(idEtapa1, "Chuva intensa", 7);
        var response = service.analisarAtraso(obraId, request);

        assertNotNull(response);
        assertEquals(idEtapa1, response.etapaAtrasadaId());
        assertEquals("Demolição e Limpeza", response.etapaAtrasadaNome());
        assertEquals("Chuva intensa", response.motivo());
        assertEquals(7, response.diasAtraso());
        assertTrue(response.sugestoes().isEmpty(), "Não deve conter sugestões inventadas de fallback");
        assertEquals(mensagemIa, response.mensagem());
    }

    @Test
    void deveRetornarSugestoesEnriquecidasQuandoIaRetornaRecomendacoes() {
        UUID obraId = UUID.randomUUID();
        Obra obra = new Obra("Edifício Solar", UnidadeFederativa.SP, ZoneId.of("America/Sao_Paulo"), null);

        UUID idEtapa1 = UUID.randomUUID();
        UUID idEtapa2 = UUID.randomUUID();

        EtapaObra etapa1 = new EtapaObra("Fundação", null, 30);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa1, "id", idEtapa1);
        ItemEap item1 = new ItemEap(obra, "Fundação", 1000.0, etapa1);
        org.springframework.test.util.ReflectionTestUtils.setField(item1, "id", UUID.randomUUID());
        item1.atualizarDadosOrcamento("Fundação", "1.0", null, null, null, null, null, null, null, null, null, null);
        obra.adicionarItemEap(item1);

        EtapaObra etapa2 = new EtapaObra("Armação e Formas", null, 20);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa2, "id", idEtapa2);
        ItemEap item2 = new ItemEap(obra, "Armação e Formas", 2000.0, etapa2);
        org.springframework.test.util.ReflectionTestUtils.setField(item2, "id", UUID.randomUUID());
        item2.atualizarDadosOrcamento(
                "Armação e Formas", "2.0", null, null, null, null, null, null, null, null, null, null);
        obra.adicionarItemEap(item2);

        Mockito.when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));
        Mockito.when(iaClient.sugerirAdiantamento(
                        Mockito.any(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyList()))
                .thenReturn(new RespostaIa(
                        "Etapas identificadas.",
                        List.of(new SugestaoIaResultado(
                                idEtapa2, "Pré-montagem das formas em paralelo na bancada de corte."))));

        var request = new SugestaoAtrasoRequest(idEtapa1, "Atraso no fornecimento de concreto", 5);
        var response = service.analisarAtraso(obraId, request);

        assertNotNull(response);
        assertEquals(1, response.sugestoes().size());
        var sugestao = response.sugestoes().get(0);
        assertEquals(idEtapa2, sugestao.etapaId());
        assertEquals("Armação e Formas", sugestao.nome());
        assertEquals("Pré-montagem das formas em paralelo na bancada de corte.", sugestao.justificativa());
        assertEquals("Etapas identificadas.", response.mensagem());
    }

    @Test
    void deveSelecionarNoMaximoTresCandidatasPorOrcamentoQuandoIaIndisponivel() {
        var obra = new Obra("Teste", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);
        var atrasada = adicionarEtapa(obra, "Atrasada", 1, 10);
        var menor = adicionarEtapa(obra, "Menor", 2, 20);
        var maior = adicionarEtapa(obra, "Maior", 3, 90);
        var segunda = adicionarEtapa(obra, "Segunda", 4, 80);
        var terceira = adicionarEtapa(obra, "Terceira", 5, 70);
        var iniciada = adicionarEtapa(obra, "Iniciada", 6, 1000);
        iniciada.getEtapa().registrarMedicao(java.math.BigDecimal.TEN, java.math.BigDecimal.TEN, null, null, 0);
        var concluida = adicionarEtapa(obra, "Concluída", 7, 2000);
        concluida.getEtapa().registrarMedicao(java.math.BigDecimal.valueOf(100), java.math.BigDecimal.TEN, null, null, 0);
        var obraId = UUID.randomUUID();
        Mockito.when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));
        Mockito.when(iaClient.sugerirAdiantamento(Mockito.any(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyList()))
                .thenReturn(RespostaIa.indisponivel("Sem chave"));
        var resposta = service.analisarAtraso(obraId, new SugestaoAtrasoRequest(atrasada.getEtapa().getId(), "Chuva", 5));
        assertEquals(List.of(maior.getEtapa().getId(), segunda.getEtapa().getId(), terceira.getEtapa().getId()),
                resposta.sugestoes().stream().map(sugestao -> sugestao.etapaId()).toList());
        assertTrue(resposta.mensagem().contains("Análise local"));
    }

    @Test
    void deveExcluirDependentesDiretasIndiretasEBloqueadasDaSelecaoLocal() {
        var obra = new Obra("Teste", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);
        var atrasada = adicionarEtapa(obra, "Atrasada", 1, 10);
        var direta = adicionarEtapa(obra, "Direta", 2, 100);
        var indireta = adicionarEtapa(obra, "Indireta", 3, 100);
        var livre = adicionarEtapa(obra, "Livre", 4, 50);
        var bloqueada = adicionarEtapa(obra, "Bloqueada", 5, 100);
        var deps = Mockito.mock(DependenciaEtapaRepository.class);
        var obraId = UUID.randomUUID();
        Mockito.when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));
        Mockito.when(deps.findByObraId(obraId)).thenReturn(List.of(
                dependencia(obra, atrasada, direta), dependencia(obra, direta, indireta), dependencia(obra, livre, bloqueada)));
        Mockito.when(iaClient.sugerirAdiantamento(Mockito.any(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyList()))
                .thenReturn(RespostaIa.indisponivel("Sem chave"));
        var resposta = new SugestaoAdiantamentoService(obraRepository, iaClient, deps)
                .analisarAtraso(obraId, new SugestaoAtrasoRequest(atrasada.getEtapa().getId(), "Chuva", 5));
        assertEquals(List.of(livre.getEtapa().getId()), resposta.sugestoes().stream().map(sugestao -> sugestao.etapaId()).toList());
    }

    private br.com.concordia.domain.obra.entities.DependenciaEtapa dependencia(Obra obra, ItemEap de, ItemEap para) {
        return new br.com.concordia.domain.obra.entities.DependenciaEtapa(
                obra, de.getEtapa(), para.getEtapa(), br.com.concordia.domain.obra.enums.TipoDependencia.FI, 0, true);
    }

    private ItemEap adicionarEtapa(Obra obra, String nome, int posicao, int valor) {
        var etapa = new EtapaObra(nome, null, 10);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa, "id", UUID.randomUUID());
        var item = new ItemEap(obra, nome, (double) posicao, etapa);
        org.springframework.test.util.ReflectionTestUtils.setField(item, "id", UUID.randomUUID());
        item.atualizarDadosOrcamento(nome, "1." + posicao, null, null, null, null, null,
                null, null, null, null, java.math.BigDecimal.valueOf(valor));
        obra.adicionarItemEap(item);
        return item;
    }
}
