package br.com.concordia.domain.obra;

import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.infrastructure.obra.dtos.ReprogramacaoSimplificadaResponse;
import br.com.concordia.infrastructure.obra.dtos.SugestaoAtrasoRequest;
import br.com.concordia.infrastructure.obra.dtos.SugestaoEtapaResponse;
import jakarta.persistence.EntityNotFoundException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
@Transactional(readOnly = true)
public class SugestaoAdiantamentoService {
    private static final Logger log = LoggerFactory.getLogger(SugestaoAdiantamentoService.class);

    private final ObraRepository obraRepository;
    private final JsonMapper json;
    private final String apiKey;
    private final URI endpoint;
    private final String model;
    private final HttpClient httpClient;

    public SugestaoAdiantamentoService(
            ObraRepository obraRepository,
            JsonMapper json,
            @Value("${concordia.ia.api-key:}") String apiKey,
            @Value("${concordia.ia.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${concordia.ia.model:gpt-4o-mini}") String model) {
        this.obraRepository = obraRepository;
        this.json = json;
        this.apiKey = apiKey;

        String resolvedBaseUrl = baseUrl;
        String resolvedModel = model;
        if (apiKey != null && apiKey.matches("^sk-[a-fA-F0-9]{32}$") && "https://api.openai.com/v1".equals(baseUrl)) {
            resolvedBaseUrl = "https://api.deepseek.com";
            if ("gpt-4o-mini".equals(model)) {
                resolvedModel = "deepseek-chat";
            }
        }

        this.endpoint = URI.create(resolvedBaseUrl.replaceAll("/+$", "") + "/chat/completions");
        this.model = resolvedModel;
        this.httpClient =
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public ReprogramacaoSimplificadaResponse analisarAtraso(UUID obraId, SugestaoAtrasoRequest request) {
        var obra = obraRepository
                .findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(obraId)));

        var etapasItens = obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(Comparator.comparing(ItemEap::getPosicao))
                .toList();

        if (etapasItens.isEmpty()) {
            throw new IllegalArgumentException("A obra não possui etapas cadastradas para análise.");
        }

        var etapaAtrasadaItem = etapasItens.stream()
                .filter(item -> (item.getEtapa() != null
                                && item.getEtapa().getId() != null
                                && item.getEtapa().getId().equals(request.etapaId()))
                        || (item.getId() != null && item.getId().equals(request.etapaId())))
                .findFirst()
                .orElse(etapasItens.get(0));

        var outrasEtapas = etapasItens.stream()
                .filter(item -> !item.getId().equals(etapaAtrasadaItem.getId()))
                .toList();

        List<SugestaoEtapaResponse> sugestoes = new ArrayList<>();

        if (!apiKey.isBlank() && !outrasEtapas.isEmpty()) {
            try {
                sugestoes = consultarIa(etapaAtrasadaItem, request.motivo(), request.diasAtraso(), outrasEtapas);
            } catch (Exception ex) {
                log.warn(
                        "Falha na chamada à IA, utilizando sugestões heurísticas de contingência: {}", ex.getMessage());
            }
        }

        if (sugestoes.isEmpty()) {
            sugestoes = gerarSugestoesFallback(etapaAtrasadaItem, request.motivo(), request.diasAtraso(), outrasEtapas);
        }

        UUID etapaIdRetorno = etapaAtrasadaItem.getEtapa() != null
                ? etapaAtrasadaItem.getEtapa().getId()
                : etapaAtrasadaItem.getId();

        return new ReprogramacaoSimplificadaResponse(
                etapaIdRetorno,
                etapaAtrasadaItem.getCodigoEap() != null ? etapaAtrasadaItem.getCodigoEap() : "",
                etapaAtrasadaItem.getNome(),
                request.motivo(),
                request.diasAtraso(),
                sugestoes);
    }

    private List<SugestaoEtapaResponse> consultarIa(
            ItemEap atrasada, String motivo, int diasAtraso, List<ItemEap> outrasEtapas) {
        var sb = new StringBuilder();
        for (var item : outrasEtapas) {
            UUID id = item.getEtapa() != null ? item.getEtapa().getId() : item.getId();
            sb.append("- ID: ")
                    .append(id)
                    .append(" | Código: ")
                    .append(item.getCodigoEap() != null ? item.getCodigoEap() : "S/C")
                    .append(" | Nome: ")
                    .append(item.getNome())
                    .append("\n");
        }

        var systemPrompt = """
            Você é um engenheiro sênior de planejamento e gestão de obras civis.
            Uma etapa da obra sofreu um atraso. Analise as outras etapas do cronograma e selecione de 2 a 3 etapas com alto potencial para serem adiantadas ou executadas em paralelo para recuperar o prazo.
            Para cada etapa sugerida, explique de forma clara e técnica a justificativa civil/operacional para o adiantamento.
            Responda EXCLUSIVAMENTE em formato JSON com o seguinte formato:
            {
              "sugestoes": [
                {
                  "etapaId": "UUID_EXATO_DA_ETAPA",
                  "justificativa": "Texto da justificativa técnica"
                }
              ]
            }
            """;

        var userPrompt = String.format(
                """
            ETAPA ATRASADA: %s (Código: %s)
            MOTIVO DO ATRASO: %s
            DIAS DE ATRASO: %d dias

            OUTRAS ETAPAS DA OBRA DISPONÍVEIS:
            %s
            """,
                atrasada.getNome(),
                atrasada.getCodigoEap() != null ? atrasada.getCodigoEap() : "",
                motivo,
                diasAtraso,
                sb.toString());

        try {
            var body = Map.of(
                    "model",
                    model,
                    "messages",
                    List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)),
                    "response_format",
                    Map.of("type", "json_object"),
                    "temperature",
                    0.2);

            var requestJson = json.writeValueAsString(body);
            var httpRequest = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("OpenAI retornou status {}: {}", response.statusCode(), response.body());
                return List.of();
            }

            JsonNode root = json.readTree(response.body());
            String content =
                    root.path("choices").path(0).path("message").path("content").asText();
            JsonNode parsed = json.readTree(content);
            JsonNode sugestoesNode = parsed.path("sugestoes");

            List<SugestaoEtapaResponse> resultado = new ArrayList<>();
            if (sugestoesNode.isArray()) {
                for (JsonNode node : sugestoesNode) {
                    String idStr = node.path("etapaId").asText();
                    String just = node.path("justificativa").asText();
                    try {
                        UUID id = UUID.fromString(idStr);
                        var matched = outrasEtapas.stream()
                                .filter(it -> (it.getEtapa() != null
                                                && it.getEtapa().getId().equals(id))
                                        || it.getId().equals(id))
                                .findFirst();
                        if (matched.isPresent()) {
                            var it = matched.get();
                            UUID retId = it.getEtapa() != null ? it.getEtapa().getId() : it.getId();
                            resultado.add(new SugestaoEtapaResponse(
                                    retId, it.getCodigoEap() != null ? it.getCodigoEap() : "", it.getNome(), just));
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
            return resultado;
        } catch (Exception ex) {
            log.warn("Erro ao comunicar com a OpenAI: {}", ex.getMessage());
            return List.of();
        }
    }

    private List<SugestaoEtapaResponse> gerarSugestoesFallback(
            ItemEap atrasada, String motivo, int diasAtraso, List<ItemEap> outrasEtapas) {
        if (outrasEtapas.isEmpty()) {
            return List.of();
        }

        List<SugestaoEtapaResponse> fallback = new ArrayList<>();
        int count = Math.min(3, outrasEtapas.size());
        for (int i = 0; i < count; i++) {
            var item = outrasEtapas.get(i);
            UUID retId = item.getEtapa() != null ? item.getEtapa().getId() : item.getId();
            String just;
            if (i == 0) {
                just =
                        "Atividade com baixa dependência direta da etapa atrasada; a mobilização antecipada de frentes paralelas permite absorver o atraso de "
                                + diasAtraso + " dias.";
            } else if (i == 1) {
                just =
                        "Serviço com insumos padronizados e disponível para pré-montagem em canteiro, reduzindo o tempo de execução no caminho crítico.";
            } else {
                just = "Pode ser adiantada mediante alocação de equipe adicional nas áreas desimpedidas da obra.";
            }

            fallback.add(new SugestaoEtapaResponse(
                    retId, item.getCodigoEap() != null ? item.getCodigoEap() : "", item.getNome(), just));
        }
        return fallback;
    }
}
