package br.com.concordia.infrastructure.obra.dtos;

import java.util.List;
import java.util.UUID;

public record ReprogramacaoSimplificadaResponse(
        UUID etapaAtrasadaId,
        String etapaAtrasadaCodigo,
        String etapaAtrasadaNome,
        String motivo,
        Integer diasAtraso,
        String mensagem,
        List<SugestaoEtapaResponse> sugestoes) {}
