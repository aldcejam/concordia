package br.com.concordia.infrastructure.ia.client;

import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.RespostaIa;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.SugestaoIaResultado;
import br.com.concordia.infrastructure.ia.config.ConcordiaIaProperties;
import br.com.concordia.infrastructure.ia.dtos.OpenAiChatMessage;
import br.com.concordia.infrastructure.ia.dtos.OpenAiChatRequest;
import br.com.concordia.infrastructure.ia.dtos.SugestaoIaPayload;
import java.util.List;
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
    public RespostaIa sugerirAdiantamento(
            EtapaCandidata etapaAtrasada, String motivo, int diasAtraso, List<EtapaCandidata> outrasEtapas) {

        if (!properties.isConfigured()) {
            return RespostaIa.indisponivel("Integração com IA não está configurada (chave de API não informada).");
        }

        if (outrasEtapas == null || outrasEtapas.isEmpty()) {
            return new RespostaIa(
                    "A obra não possui outras etapas disponíveis no cronograma para adiantamento.", List.of());
        }

        try {
            var systemPrompt = buildSystemPrompt();
            var userPrompt = buildUserPrompt(etapaAtrasada, motivo, diasAtraso, outrasEtapas);

            var request = new OpenAiChatRequest(
                    properties.getResolvedModel(),
                    List.of(new OpenAiChatMessage("system", systemPrompt), new OpenAiChatMessage("user", userPrompt)),
                    null,
                    properties.temperature());

            String rawResponse = restClient
                    .post()
                    .uri("/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                log.warn("Resposta vazia retornada pelo provedor de IA");
                return RespostaIa.indisponivel("O serviço de inteligência artificial não retornou dados para a análise do cronograma.");
            }

            return extrairResposta(rawResponse);
        } catch (Exception ex) {
            log.warn("Falha de comunicação com o provedor de IA: {}", ex.getMessage());
            return RespostaIa.indisponivel("Não foi possível consultar a IA no momento.");
        }
    }

    private RespostaIa extrairResposta(String rawResponse) {
        try {
            JsonNode root = jsonMapper.readTree(rawResponse);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                log.warn("Provedor de IA retornou payload sem escolhas válidas");
                return RespostaIa.indisponivel("O serviço de IA não forneceu alternativas válidas no formato esperado.");
            }

            String content = choices.get(0).path("message").path("content").asText("");
            String sanitizedContent = sanitizarJson(content);

            SugestaoIaPayload payload = jsonMapper.readValue(sanitizedContent, SugestaoIaPayload.class);
            if (payload == null) {
                return RespostaIa.indisponivel("Não foi possível interpretar a resposta estruturada da inteligência artificial.");
            }

            List<SugestaoIaResultado> resultados = extrairSugestoesValidas(payload);

            String mensagem = payload.mensagem();
            if (mensagem == null || mensagem.isBlank()) {
                mensagem = resultados.isEmpty()
                        ? "A inteligência artificial analisou o cronograma e não conseguiu identificar etapas passíveis de adiantamento para compensar este atraso com segurança técnica."
                        : "Etapas com potencial para adiantamento identificadas com sucesso.";
            }

            return new RespostaIa(mensagem, resultados);
        } catch (Exception ex) {
            log.warn("Falha ao desserializar sugestões da IA: {}", ex.getMessage());
            return RespostaIa.indisponivel("Falha ao interpretar as sugestões da inteligência artificial.");
        }
    }

    private List<SugestaoIaResultado> extrairSugestoesValidas(SugestaoIaPayload payload) {
        if (payload.sugestoes() == null || payload.sugestoes().isEmpty()) {
            return List.of();
        }

        return payload.sugestoes().stream()
                .map(this::converterItemParaSugestao)
                .flatMap(java.util.Optional::stream)
                .toList();
    }

    private java.util.Optional<SugestaoIaResultado> converterItemParaSugestao(
            br.com.concordia.infrastructure.ia.dtos.SugestaoIaItem item) {
        if (item == null || item.etapaId() == null || item.justificativa() == null) {
            return java.util.Optional.empty();
        }

        try {
            UUID etapaId = UUID.fromString(item.etapaId().trim());
            return java.util.Optional.of(
                    new SugestaoIaResultado(etapaId, item.justificativa().trim()));
        } catch (IllegalArgumentException ignored) {
            // Ignora itens com UUID inválido gerado pelo modelo
            return java.util.Optional.empty();
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
        if (properties.prompt() != null
                && properties.prompt().system() != null
                && !properties.prompt().system().isBlank()) {
            return properties.prompt().system().trim();
        }

        return """
            Você é um engenheiro civil sênior especialista em planejamento e gestão de obras pelo método do caminho crítico (CPM) e EAP/SINAPI.
            Uma etapa da obra sofreu um atraso. Analise criteriosamente as outras etapas disponíveis no cronograma.
            Se houver etapas com real viabilidade técnica, operacional e lógica para serem adiantadas ou executadas em frentes paralelas para recuperar o prazo, selecione de 1 a 3 etapas e descreva suas justificativas técnicas em "sugestoes".
            Caso NÃO encontre etapas viáveis para adiantamento (por exemplo, por restrições de precedência construtiva, dependência estrutural direta ou falta de frentes liberadas), deixe a lista "sugestoes" vazia [] e explique de forma clara em "mensagem" que não foi possível identificar etapas para adiantamento e o porquê.
            Responda EXCLUSIVAMENTE em formato JSON com o seguinte esquema:
            {
              "mensagem": "Texto com o parecer geral da IA, ou texto explicando que não conseguiu identificar etapas para adiantamento",
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
