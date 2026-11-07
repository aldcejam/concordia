package br.com.concordia.infrastructure.controllers.obra.dtos;

import br.com.concordia.domain.obra.dtos.ReprogramacaoSimplificadaOutput;
import java.util.List;
import java.util.UUID;

public record ReprogramacaoSimplificadaResponse(
        UUID etapaAtrasadaId,
        String etapaAtrasadaCodigo,
        String etapaAtrasadaNome,
        String motivo,
        Integer diasAtraso,
        String mensagem,
        List<SugestaoEtapaResponse> sugestoes) {
    public static ReprogramacaoSimplificadaResponse from(ReprogramacaoSimplificadaOutput output) {
        return new ReprogramacaoSimplificadaResponse(
                output.etapaAtrasadaId(),
                output.etapaAtrasadaCodigo(),
                output.etapaAtrasadaNome(),
                output.motivo(),
                output.diasAtraso(),
                output.mensagem(),
                output.sugestoes().stream().map(SugestaoEtapaResponse::from).toList());
    }
}
