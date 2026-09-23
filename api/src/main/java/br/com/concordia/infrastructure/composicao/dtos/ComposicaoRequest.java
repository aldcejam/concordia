package br.com.concordia.infrastructure.composicao.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ComposicaoRequest(@NotNull String codigo, @NotNull String descricao, @NotNull UnidadeMedida unidade, @NotNull BigDecimal preco) {}
