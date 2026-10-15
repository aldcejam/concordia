package br.com.concordia.infrastructure.ia.dtos;

import java.util.List;

public record SugestaoIaPayload(String mensagem, List<SugestaoIaItem> sugestoes) {}
