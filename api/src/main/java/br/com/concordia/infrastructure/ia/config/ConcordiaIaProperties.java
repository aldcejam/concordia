package br.com.concordia.infrastructure.ia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "concordia.ia")
public record ConcordiaIaProperties(
        String apiKey,
        String baseUrl,
        String model,
        Integer timeoutSeconds,
        Double temperature,
        PromptProperties prompt) {

    public record PromptProperties(String system) {}

    public static ConcordiaIaProperties of(
            String apiKey, String baseUrl, String model, Integer timeoutSeconds, Double temperature) {
        return new ConcordiaIaProperties(apiKey, baseUrl, model, timeoutSeconds, temperature, null);
    }

    public ConcordiaIaProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://openrouter.ai/api/v1";
        }
        if (model == null || model.isBlank()) {
            model = "openai/gpt-4o-mini";
        }
        if (timeoutSeconds == null || timeoutSeconds <= 0) {
            timeoutSeconds = 30;
        }
        if (temperature == null) {
            temperature = 0.2;
        }
    }

    public String getResolvedBaseUrl() {
        return baseUrl.replaceAll("/+$", "");
    }

    public String getResolvedModel() {
        return model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
