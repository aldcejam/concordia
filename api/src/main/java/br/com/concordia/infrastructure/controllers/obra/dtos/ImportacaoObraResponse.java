package br.com.concordia.infrastructure.controllers.obra.dtos;

import java.util.UUID;

public record ImportacaoObraResponse(UUID idObra, int itensEapCriados) {}
