package br.com.concordia.domain.composicao.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import java.math.BigDecimal;

public record ComposicaoInput(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {}
