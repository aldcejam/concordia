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
    void deveRetornarListaVaziaQuandoNaoConfigurado() {
        var properties = new ConcordiaIaProperties("", "https://api.openai.com/v1", "gpt-4o-mini", 20, 0.2);
        var restClient = RestClient.builder().build();
        var jsonMapper = JsonMapper.builder().build();

        var client = new OpenAiReprogramacaoClient(restClient, properties, jsonMapper);

        var atrasada = new EtapaCandidata(UUID.randomUUID(), "1.1", "Fundação");
        var candidatas = List.of(new EtapaCandidata(UUID.randomUUID(), "1.2", "Alvenaria"));

        var sugestoes = client.sugerirAdiantamento(atrasada, "Chuva", 3, candidatas);
        assertNotNull(sugestoes);
        assertTrue(sugestoes.isEmpty());
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHaEtapasCandidatas() {
        var properties = new ConcordiaIaProperties("sk-teste", "https://api.openai.com/v1", "gpt-4o-mini", 20, 0.2);
        var restClient = RestClient.builder().build();
        var jsonMapper = JsonMapper.builder().build();

        var client = new OpenAiReprogramacaoClient(restClient, properties, jsonMapper);

        var atrasada = new EtapaCandidata(UUID.randomUUID(), "1.1", "Fundação");

        var sugestoes = client.sugerirAdiantamento(atrasada, "Chuva", 3, List.of());
        assertNotNull(sugestoes);
        assertTrue(sugestoes.isEmpty());
    }
}
