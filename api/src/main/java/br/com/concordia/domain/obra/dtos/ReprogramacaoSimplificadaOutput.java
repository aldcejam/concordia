package br.com.concordia.domain.obra.dtos;

import java.util.List;
import java.util.UUID;

public record ReprogramacaoSimplificadaOutput(
        UUID etapaAtrasadaId,
        String etapaAtrasadaCodigo,
        String etapaAtrasadaNome,
        String motivo,
        Integer diasAtraso,
        String mensagem,
        List<SugestaoEtapaOutput> sugestoes) {}
