package br.com.concordia.infrastructure.cronograma;

import static br.com.concordia.domain.cronograma.CronogramaDados.*;
import static org.assertj.core.api.Assertions.*;

import br.com.concordia.domain.cronograma.FalhaAnaliseException;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class OpenAiRecomendacaoTest {
    private HttpServer server;
    private String requestBody;
    private String authorization;
    private int status = 200;
    private String response;
    private final JsonMapper json = JsonMapper.builder().build();
    private final UUID id = UUID.randomUUID();

    @BeforeEach
    void iniciar() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/chat/completions", exchange -> {
            requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            authorization = exchange.getRequestHeaders().getFirst("Authorization");
            var bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        response = json.writeValueAsString(Map.of(
                "choices",
                List.of(Map.of(
                        "finish_reason",
                        "stop",
                        "message",
                        Map.of(
                                "content",
                                json.writeValueAsString(new Recomendacoes(
                                        List.of(new Sugestao(id, "Frente disponível para revisão.")))))))));
    }

    @AfterEach
    void parar() {
        server.stop(0);
    }

    private OpenAiRecomendacao adapter(String key) {
        return new OpenAiRecomendacao(
                json, key, "http://127.0.0.1:" + server.getAddress().getPort() + "/v1", "modelo-configurado");
    }

    private Contexto contexto() {
        return new Contexto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Atraso de entrega",
                3,
                OffsetDateTime.parse("2026-10-12T09:00:00-03:00"),
                new Snapshot(1, List.of()),
                List.of(id));
    }

    @Test
    void enviaPadraoGptComSchemaEstritoERetornaIds() {
        assertThat(adapter("chave-teste").recomendar(contexto()))
                .extracting(Sugestao::etapaId)
                .containsExactly(id);
        var request = json.readTree(requestBody);
        assertThat(authorization).isEqualTo("Bearer chave-teste");
        assertThat(request.path("model").asString()).isEqualTo("modelo-configurado");
        assertThat(request.path("response_format").path("type").asString()).isEqualTo("json_schema");
        assertThat(request.path("response_format")
                        .path("json_schema")
                        .path("strict")
                        .asBoolean())
                .isTrue();
        assertThat(request.path("messages").path(0).path("content").asString())
                .contains("Não sugira, crie ou altere dependências");
        assertThat(request.path("messages").path(1).path("content").asString()).contains(id.toString());
    }

    @Test
    void ausenciaDeChaveNaoFazChamadaExterna() {
        assertThatThrownBy(() -> adapter("").recomendar(contexto()))
                .isInstanceOf(FalhaAnaliseException.class)
                .hasMessageContaining("configurada");
        assertThat(requestBody).isNull();
    }

    @Test
    void naoExpoeRespostaDoProvedorEmErros() {
        status = 429;
        response = "detalhes internos do provedor";
        assertThatThrownBy(() -> adapter("chave").recomendar(contexto()))
                .isInstanceOf(FalhaAnaliseException.class)
                .hasMessageNotContaining("detalhes internos");
    }

    @Test
    void rejeitaRespostaTruncada() {
        response = "{\"choices\":[{\"finish_reason\":\"length\",\"message\":{\"content\":\"{\"}}]}";
        assertThatThrownBy(() -> adapter("chave").recomendar(contexto())).hasMessageContaining("incompleta");
    }

    @Test
    void rejeitaRecusaEJsonInvalido() {
        response = "{\"choices\":[{\"finish_reason\":\"stop\",\"message\":{\"refusal\":\"recusa\"}}]}";
        assertThatThrownBy(() -> adapter("chave").recomendar(contexto())).hasMessageContaining("não produziu");
        response = "{\"choices\":[{\"finish_reason\":\"stop\",\"message\":{\"content\":\"texto sem JSON\"}}]}";
        assertThatThrownBy(() -> adapter("chave").recomendar(contexto())).isInstanceOf(FalhaAnaliseException.class);
    }
}
