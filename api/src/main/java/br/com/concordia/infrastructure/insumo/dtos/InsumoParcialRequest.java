package br.com.concordia.infrastructure.insumo.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import java.math.BigDecimal;

public record InsumoParcialRequest(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {}
