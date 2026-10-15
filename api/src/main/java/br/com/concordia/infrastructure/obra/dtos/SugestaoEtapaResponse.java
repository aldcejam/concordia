package br.com.concordia.infrastructure.obra.dtos;

import java.util.UUID;

public record SugestaoEtapaResponse(UUID etapaId, String codigoEap, String nome, String justificativa) {}
