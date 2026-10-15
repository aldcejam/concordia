package br.com.concordia.infrastructure.ia.dtos;

import java.util.List;
import java.util.Map;

public record OpenAiChatRequest(
        String model, List<OpenAiChatMessage> messages, Map<String, String> response_format, Double temperature) {}
