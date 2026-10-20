package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.importacao.ResumoImportacao;
import java.math.BigDecimal;
import java.util.List;

public record ResumoImportacaoResponse(
        String formato,
        String nomeObra,
        BigDecimal percentualBdi,
        int totalItens,
        int totalMacroetapas,
        int totalSubetapas,
        int composicoesProprias,
        BigDecimal valorTotalSemBdi,
        BigDecimal valorTotalComBdi,
        BigDecimal somaPesos,
        boolean valida,
        List<NoEapResumoResponse> eap,
        List<ErroImportacaoResponse> erros,
        List<String> avisos) {
    public static ResumoImportacaoResponse from(ResumoImportacao resumo) {
        return new ResumoImportacaoResponse(
                resumo.formato(),
                resumo.nomeObra(),
                resumo.percentualBdi(),
                resumo.totalItens(),
                resumo.totalMacroetapas(),
                resumo.totalSubetapas(),
                resumo.composicoesProprias(),
                resumo.valorTotalSemBdi(),
                resumo.valorTotalComBdi(),
                resumo.somaPesos(),
                resumo.valida(),
                resumo.eap().stream().map(NoEapResumoResponse::from).toList(),
                resumo.erros().stream().map(ErroImportacaoResponse::from).toList(),
                resumo.avisos());
    }
}
