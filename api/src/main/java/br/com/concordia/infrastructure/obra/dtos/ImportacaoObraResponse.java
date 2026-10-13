package br.com.concordia.infrastructure.obra.dtos;

import java.util.UUID;

public record ImportacaoObraResponse(UUID idObra, int itensEapCriados) {}
