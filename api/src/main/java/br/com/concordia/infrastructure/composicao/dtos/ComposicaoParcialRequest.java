package br.com.concordia.infrastructure.composicao.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;

import java.math.BigDecimal;

public record ComposicaoParcialRequest(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {}
