package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.dtos.MedicaoOutput;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicaoResponse(
        UUID id,
        BigDecimal percentualExecutado,
        BigDecimal quantidadeExecutada,
        String observacao,
        String motivoAtraso,
        Integer diasAtraso,
        OffsetDateTime registradaEm) {
    public static MedicaoResponse from(MedicaoOutput output) {
        return new MedicaoResponse(
                output.id(),
                output.percentualExecutado(),
                output.quantidadeExecutada(),
                output.observacao(),
                output.motivoAtraso(),
                output.diasAtraso(),
                output.registradaEm());
    }
}
