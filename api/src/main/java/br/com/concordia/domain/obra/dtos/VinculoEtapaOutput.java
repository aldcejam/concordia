package br.com.concordia.domain.obra.dtos;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.util.UUID;

/** Vínculo visto a partir de uma etapa: a outra ponta (predecessora ou sucessora) e se ele já está satisfeito. */
public record VinculoEtapaOutput(
        UUID dependenciaId,
        UUID etapaId,
        String codigoEap,
        String nome,
        TipoDependencia tipo,
        int desfasamentoDias,
        boolean obrigatoria,
        boolean satisfeita) {}
