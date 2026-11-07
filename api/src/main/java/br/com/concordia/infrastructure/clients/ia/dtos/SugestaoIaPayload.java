package br.com.concordia.infrastructure.clients.ia.dtos;

import java.util.List;

public record SugestaoIaPayload(String mensagem, List<SugestaoIaItem> sugestoes) {}
