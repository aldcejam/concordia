package br.com.concordia.domain.obra.importacao;

import java.math.BigDecimal;

/** Item de serviço (folha da EAP) lido da planilha. Valores com BDI, exceto {@code valorUnitarioBase}. */
public record ItemPlanilha(
        int linha,
        String codigoEap,
        String codigoComposicao,
        String banco,
        String descricao,
        String tipo,
        String unidade,
        BigDecimal quantidade,
        BigDecimal valorUnitarioBase,
        BigDecimal valorUnitario,
        BigDecimal valorTotal) {}
