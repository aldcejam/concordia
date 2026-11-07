package br.com.concordia.domain.obra.dtos;

import java.util.UUID;

public record SugestaoEtapaOutput(UUID etapaId, String codigoEap, String nome, String justificativa) {}
