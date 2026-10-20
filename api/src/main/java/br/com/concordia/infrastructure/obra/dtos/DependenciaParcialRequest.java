package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record DependenciaParcialRequest(
        TipoDependencia tipo, @Min(-365) @Max(365) Integer desfasamentoDias, Boolean obrigatoria) {}
