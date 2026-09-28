package br.com.concordia.infrastructure.insumo.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record InsumoRequest(
        @NotBlank String codigo,
        @NotBlank String descricao,
        @NotNull UnidadeMedida unidade,
        @NotNull BigDecimal preco) {}
