package br.com.concordia.infrastructure.ia.client;

import static org.junit.jupiter.api.Assertions.*;

import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.EtapaCandidata;
import br.com.concordia.infrastructure.ia.config.ConcordiaIaProperties;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;

class OpenAiReprogramacaoClientTest {

    @Test
    void deveRetornarMensagemExplicativaQuandoNaoConfigurado() {
        var properties = ConcordiaIaProperties.of("", "https://openrouter.ai/api/v1", "openai/gpt-4o-mini", 30, 0.2);
        var restClient = RestClient.builder().build();
        var jsonMapper = JsonMapper.builder().build();

        var client = new OpenAiReprogramacaoClient(restClient, properties, jsonMapper);

        var atrasada = new EtapaCandidata(UUID.randomUUID(), "1.1", "Fundação");
        var candidatas = List.of(new EtapaCandidata(UUID.randomUUID(), "1.2", "Alvenaria"));

        var resposta = client.sugerirAdiantamento(atrasada, "Chuva", 3, candidatas);
        assertNotNull(resposta);
        assertTrue(resposta.sugestoes().isEmpty());
        assertNotNull(resposta.mensagem());
        assertTrue(resposta.mensagem().contains("não está configurada"));
    }

    @Test
    void deveRetornarMensagemExplicativaQuandoNaoHaEtapasCandidatas() {
        var properties =
                ConcordiaIaProperties.of("sk-teste", "https://openrouter.ai/api/v1", "openai/gpt-4o-mini", 30, 0.2);
        var restClient = RestClient.builder().build();
        var jsonMapper = JsonMapper.builder().build();

        var client = new OpenAiReprogramacaoClient(restClient, properties, jsonMapper);

        var atrasada = new EtapaCandidata(UUID.randomUUID(), "1.1", "Fundação");

        var resposta = client.sugerirAdiantamento(atrasada, "Chuva", 3, List.of());
        assertNotNull(resposta);
        assertTrue(resposta.sugestoes().isEmpty());
        assertNotNull(resposta.mensagem());
        assertTrue(resposta.mensagem().contains("não possui outras etapas"));
    }
}
