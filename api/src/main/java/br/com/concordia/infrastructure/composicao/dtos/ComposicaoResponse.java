package br.com.concordia.infrastructure.composicao.dtos;

import br.com.concordia.domain.common.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ComposicaoResponse(UUID id, String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco, List<UUID> itens) {}
