package br.com.concordia.domain.insumo.dtos;

import br.com.concordia.domain.obra.enums.UnidadeMedida;
import java.math.BigDecimal;

public record InsumoInput(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {}
