package br.com.concordia.domain.obra.importacao;

import java.math.BigDecimal;
import java.util.List;

/** Nó da árvore da EAP apresentada no resumo da importação. Itens de serviço são folhas sem filhos. */
public record NoEapResumo(
        String codigoEap,
        String nome,
        boolean itemServico,
        String banco,
        String codigoComposicao,
        String unidade,
        BigDecimal quantidade,
        BigDecimal valorTotal,
        BigDecimal pesoPercentual,
        int quantidadeItens,
        List<NoEapResumo> filhos) {}
