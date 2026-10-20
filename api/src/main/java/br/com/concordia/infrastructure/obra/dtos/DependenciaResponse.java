package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.dependencia.DependenciaOutput;
import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DependenciaResponse(
        UUID id,
        EtapaDependenciaResponse predecessora,
        EtapaDependenciaResponse sucessora,
        TipoDependencia tipo,
        int desfasamentoDias,
        boolean obrigatoria,
        boolean satisfeita,
        OffsetDateTime criadaEm) {
    public record EtapaDependenciaResponse(UUID id, String codigoEap, String nome) {
        static EtapaDependenciaResponse from(DependenciaOutput.EtapaResumo etapa) {
            return new EtapaDependenciaResponse(etapa.id(), etapa.codigoEap(), etapa.nome());
        }
    }

    public static DependenciaResponse from(DependenciaOutput output) {
        return new DependenciaResponse(
                output.id(),
                EtapaDependenciaResponse.from(output.predecessora()),
                EtapaDependenciaResponse.from(output.sucessora()),
                output.tipo(),
                output.desfasamentoDias(),
                output.obrigatoria(),
                output.satisfeita(),
                output.criadaEm());
    }
}
