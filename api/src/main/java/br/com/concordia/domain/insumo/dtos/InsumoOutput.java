package br.com.concordia.domain.insumo.dtos;

import br.com.concordia.domain.obra.enums.UnidadeMedida;
import java.math.BigDecimal;
import java.util.UUID;

public record InsumoOutput(UUID id, String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {}
