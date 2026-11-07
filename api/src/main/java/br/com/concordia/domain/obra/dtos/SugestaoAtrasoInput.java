package br.com.concordia.domain.obra.dtos;

import java.util.UUID;

public record SugestaoAtrasoInput(UUID etapaId, String motivo, Integer diasAtraso) {}
