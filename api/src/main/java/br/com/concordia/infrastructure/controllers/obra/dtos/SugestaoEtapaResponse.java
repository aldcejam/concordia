package br.com.concordia.infrastructure.controllers.obra.dtos;

import br.com.concordia.domain.obra.dtos.SugestaoEtapaOutput;
import java.util.UUID;

public record SugestaoEtapaResponse(UUID etapaId, String codigoEap, String nome, String justificativa) {
    public static SugestaoEtapaResponse from(SugestaoEtapaOutput output) {
        return new SugestaoEtapaResponse(output.etapaId(), output.codigoEap(), output.nome(), output.justificativa());
    }
}
