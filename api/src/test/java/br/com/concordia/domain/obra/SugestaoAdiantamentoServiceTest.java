package br.com.concordia.domain.obra;

import static org.junit.jupiter.api.Assertions.*;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
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
        service = new SugestaoAdiantamentoService(obraRepository, iaClient);
    }

    @Test
    void deveRetornarSugestoesFallbackQuandoIaRetornaVazio() {
        UUID obraId = UUID.randomUUID();
        Obra obra = new Obra("Reforma Geral", UnidadeFederativa.CE, ZoneId.of("America/Fortaleza"), null);

        UUID idEtapa1 = UUID.randomUUID();
        UUID idEtapa2 = UUID.randomUUID();
        UUID idEtapa3 = UUID.randomUUID();

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

        EtapaObra etapa3 = new EtapaObra("Instalações Hidráulicas", null, 15);
        org.springframework.test.util.ReflectionTestUtils.setField(etapa3, "id", idEtapa3);
        ItemEap item3 = new ItemEap(obra, "Instalações Hidráulicas", 3000.0, etapa3);
        org.springframework.test.util.ReflectionTestUtils.setField(item3, "id", UUID.randomUUID());
        item3.atualizarDadosOrcamento(
                "Instalações Hidráulicas", "1.3", null, null, null, null, null, null, null, null, null, null);
        obra.adicionarItemEap(item3);

        Mockito.when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));
        Mockito.when(iaClient.sugerirAdiantamento(
                        Mockito.any(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyList()))
                .thenReturn(List.of());

        var request = new SugestaoAtrasoRequest(idEtapa1, "Chuva intensa", 7);
        var response = service.analisarAtraso(obraId, request);

        assertNotNull(response);
        assertEquals(idEtapa1, response.etapaAtrasadaId());
        assertEquals("Demolição e Limpeza", response.etapaAtrasadaNome());
        assertEquals("Chuva intensa", response.motivo());
        assertEquals(7, response.diasAtraso());
        assertFalse(response.sugestoes().isEmpty());
        assertTrue(response.sugestoes().stream().anyMatch(s -> s.nome().equals("Estrutura e Alvenaria")));
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
                .thenReturn(List.of(
                        new SugestaoIaResultado(idEtapa2, "Pré-montagem das formas em paralelo na bancada de corte.")));

        var request = new SugestaoAtrasoRequest(idEtapa1, "Atraso no fornecimento de concreto", 5);
        var response = service.analisarAtraso(obraId, request);

        assertNotNull(response);
        assertEquals(1, response.sugestoes().size());
        var sugestao = response.sugestoes().get(0);
        assertEquals(idEtapa2, sugestao.etapaId());
        assertEquals("Armação e Formas", sugestao.nome());
        assertEquals("Pré-montagem das formas em paralelo na bancada de corte.", sugestao.justificativa());
    }
}
