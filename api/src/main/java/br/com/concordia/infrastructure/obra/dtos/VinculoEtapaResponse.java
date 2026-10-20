package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.dtos.VinculoEtapaOutput;
import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.util.UUID;

public record VinculoEtapaResponse(
        UUID dependenciaId,
        UUID etapaId,
        String codigoEap,
        String nome,
        TipoDependencia tipo,
        int desfasamentoDias,
        boolean obrigatoria,
        boolean satisfeita) {
    public static VinculoEtapaResponse from(VinculoEtapaOutput output) {
        return new VinculoEtapaResponse(
                output.dependenciaId(),
                output.etapaId(),
                output.codigoEap(),
                output.nome(),
                output.tipo(),
                output.desfasamentoDias(),
                output.obrigatoria(),
                output.satisfeita());
    }
}
