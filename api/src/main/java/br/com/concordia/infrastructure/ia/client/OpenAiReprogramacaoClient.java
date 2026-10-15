package br.com.concordia.infrastructure.ia.client;

import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.infrastructure.ia.config.ConcordiaIaProperties;
import br.com.concordia.infrastructure.ia.dtos.OpenAiChatMessage;
import br.com.concordia.infrastructure.ia.dtos.OpenAiChatRequest;
import br.com.concordia.infrastructure.ia.dtos.SugestaoIaPayload;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class OpenAiReprogramacaoClient implements IaReprogramacaoClient {
    private static final Logger log = LoggerFactory.getLogger(OpenAiReprogramacaoClient.class);

    private final RestClient restClient;
    private final ConcordiaIaProperties properties;
    private final JsonMapper jsonMapper;

    public OpenAiReprogramacaoClient(RestClient restClient, ConcordiaIaProperties properties, JsonMapper jsonMapper) {
        this.restClient = restClient;
        this.properties = properties;
        this.jsonMapper = jsonMapper;
    }

    @Override
    public List<SugestaoIaResultado> sugerirAdiantamento(
            EtapaCandidata etapaAtrasada, String motivo, int diasAtraso, List<EtapaCandidata> outrasEtapas) {

        if (!properties.isConfigured() || outrasEtapas == null || outrasEtapas.isEmpty()) {
            return List.of();
        }

        try {
            var systemPrompt = buildSystemPrompt();
            var userPrompt = buildUserPrompt(etapaAtrasada, motivo, diasAtraso, outrasEtapas);

            var request = new OpenAiChatRequest(
                    properties.getResolvedModel(),
                    List.of(new OpenAiChatMessage("system", systemPrompt), new OpenAiChatMessage("user", userPrompt)),
                    Map.of("type", "json_object"),
                    properties.temperature());

            String rawResponse = restClient
                    .post()
                    .uri("/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                log.warn("Resposta vazia retornada pelo provedor de IA");
                return List.of();
            }

            return extrairSugestoes(rawResponse);
        } catch (Exception ex) {
            log.warn("Falha de comunicação com o provedor de IA (ativando contingência): {}", ex.getMessage());
            return List.of();
        }
    }

    private List<SugestaoIaResultado> extrairSugestoes(String rawResponse) {
        try {
            JsonNode root = jsonMapper.readTree(rawResponse);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                log.warn("Provedor de IA retornou payload sem escolhas válidas");
                return List.of();
            }

            String content = choices.get(0).path("message").path("content").asText("");
            String sanitizedContent = sanitizarJson(content);

            SugestaoIaPayload payload = jsonMapper.readValue(sanitizedContent, SugestaoIaPayload.class);
            if (payload == null || payload.sugestoes() == null) {
                return List.of();
            }

            List<SugestaoIaResultado> resultados = new ArrayList<>();
            for (var item : payload.sugestoes()) {
                if (item.etapaId() != null && item.justificativa() != null) {
                    try {
                        UUID id = UUID.fromString(item.etapaId().trim());
                        resultados.add(
                                new SugestaoIaResultado(id, item.justificativa().trim()));
                    } catch (IllegalArgumentException ignored) {
                        // Ignora itens com UUID inválido gerado pelo modelo
                    }
                }
            }
            return resultados;
        } catch (Exception ex) {
            log.warn("Falha ao desserializar sugestões da IA: {}", ex.getMessage());
            return List.of();
        }
    }

    private String sanitizarJson(String content) {
        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return trimmed.trim();
    }

    private String buildSystemPrompt() {
        return """
            Você é um engenheiro civil sênior especialista em planejamento e gestão de obras pelo método do caminho crítico (CPM) e EAP/SINAPI.
            Uma etapa da obra sofreu um atraso. Analise as outras etapas disponíveis no cronograma e selecione de 2 a 3 etapas com alto potencial técnico e operacional para serem adiantadas ou executadas em frentes paralelas, compensando os dias perdidos.
            Para cada etapa indicada, forneça uma justificativa técnica concisa e fundamentada na engenharia civil.
            Responda EXCLUSIVAMENTE em formato JSON com o seguinte esquema:
            {
              "sugestoes": [
                {
                  "etapaId": "UUID_EXATO_DA_ETAPA",
                  "justificativa": "Texto da justificativa técnica"
                }
              ]
            }
            """;
    }

    private String buildUserPrompt(
            EtapaCandidata atrasada, String motivo, int diasAtraso, List<EtapaCandidata> outrasEtapas) {

        var sb = new StringBuilder();
        for (var item : outrasEtapas) {
            sb.append("- ID: ")
                    .append(item.id())
                    .append(" | Código: ")
                    .append(item.codigoEap() != null ? item.codigoEap() : "S/C")
                    .append(" | Nome: ")
                    .append(item.nome())
                    .append("\n");
        }

        return """
            ETAPA ATRASADA: %s (Código: %s)
            MOTIVO DO ATRASO: %s
            DIAS DE ATRASO: %d dias

            ETAPAS DISPONÍVEIS NO CRONOGRAMA:
            %s
            """.formatted(
                        atrasada.nome(),
                        atrasada.codigoEap() != null ? atrasada.codigoEap() : "S/C",
                        motivo,
                        diasAtraso,
                        sb.toString());
    }
}
