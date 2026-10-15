package br.com.concordia.infrastructure.ia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "concordia.ia")
public record ConcordiaIaProperties(
        String apiKey, String baseUrl, String model, Integer timeoutSeconds, Double temperature) {

    public ConcordiaIaProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://api.openai.com/v1";
        }
        if (model == null || model.isBlank()) {
            model = "gpt-4o-mini";
        }
        if (timeoutSeconds == null || timeoutSeconds <= 0) {
            timeoutSeconds = 20;
        }
        if (temperature == null) {
            temperature = 0.2;
        }
    }

    public String getResolvedBaseUrl() {
        String trimmed = baseUrl.replaceAll("/+$", "");
        if (apiKey != null && apiKey.matches("^sk-[a-fA-F0-9]{32}$") && "https://api.openai.com/v1".equals(trimmed)) {
            return "https://api.deepseek.com";
        }
        return trimmed;
    }

    public String getResolvedModel() {
        if (apiKey != null && apiKey.matches("^sk-[a-fA-F0-9]{32}$") && "gpt-4o-mini".equals(model)) {
            return "deepseek-chat";
        }
        return model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
