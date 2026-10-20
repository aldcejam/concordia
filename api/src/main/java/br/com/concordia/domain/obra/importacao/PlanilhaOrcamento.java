package br.com.concordia.domain.obra.importacao;

import java.math.BigDecimal;
import java.util.List;

/**
 * Conteúdo extraído de uma planilha orçamentária, antes de qualquer validação de negócio.
 *
 * @param formato descrição do layout reconhecido (ex.: "Analítica", "Sintética")
 * @param erros problemas de leitura encontrados pelo parser (linhas mal formatadas, colunas ausentes)
 */
public record PlanilhaOrcamento(
        String formato,
        String nomeObra,
        BigDecimal percentualBdi,
        List<SecaoPlanilha> secoes,
        List<ItemPlanilha> itens,
        List<ErroImportacao> erros) {}
