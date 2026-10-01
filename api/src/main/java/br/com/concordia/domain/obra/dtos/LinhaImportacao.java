package br.com.concordia.domain.obra.dtos;

import java.math.BigDecimal;

/**
 * Uma linha da planilha de importação.
 *
 * @param numeroLinha linha do arquivo de origem, usada nas mensagens de erro
 * @param item numeração da EAP (ex.: "1", "1.1", "1.1.1")
 * @param codigo código do insumo/composição; nulo em linhas de agrupamento
 * @param descricao nome do item da EAP
 * @param unidade sigla da unidade de medida; nula em linhas de agrupamento
 * @param quantidade quantidade orçada; nula em linhas de agrupamento
 */
public record LinhaImportacao(
        int numeroLinha, String item, String codigo, String descricao, String unidade, BigDecimal quantidade) {

    public boolean isAgrupamento() {
        return codigo == null || codigo.isBlank();
    }
}
