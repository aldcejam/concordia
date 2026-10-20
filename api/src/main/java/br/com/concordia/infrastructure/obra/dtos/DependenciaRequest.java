package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DependenciaRequest(
        @NotNull UUID predecessoraId,
        @NotNull UUID sucessoraId,
        TipoDependencia tipo,
        @Min(-365) @Max(365) Integer desfasamentoDias,
        Boolean obrigatoria) {}
