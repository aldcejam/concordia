package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.importacao.NoEapResumo;
import java.math.BigDecimal;
import java.util.List;

public record NoEapResumoResponse(
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
        List<NoEapResumoResponse> filhos) {
    public static NoEapResumoResponse from(NoEapResumo no) {
        return new NoEapResumoResponse(
                no.codigoEap(),
                no.nome(),
                no.itemServico(),
                no.banco(),
                no.codigoComposicao(),
                no.unidade(),
                no.quantidade(),
                no.valorTotal(),
                no.pesoPercentual(),
                no.quantidadeItens(),
                no.filhos().stream().map(NoEapResumoResponse::from).toList());
    }
}
