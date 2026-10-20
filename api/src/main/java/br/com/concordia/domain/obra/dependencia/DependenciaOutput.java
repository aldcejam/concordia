package br.com.concordia.domain.obra.dependencia;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DependenciaOutput(
        UUID id,
        EtapaResumo predecessora,
        EtapaResumo sucessora,
        TipoDependencia tipo,
        int desfasamentoDias,
        boolean obrigatoria,
        boolean satisfeita,
        OffsetDateTime criadaEm) {
    public record EtapaResumo(UUID id, String codigoEap, String nome) {}
}
