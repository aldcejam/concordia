package br.com.concordia.domain.obra.importacao;

import java.math.BigDecimal;
import java.util.List;

public record ResumoImportacao(
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
        List<NoEapResumo> eap,
        List<ErroImportacao> erros,
        List<String> avisos) {
    public boolean valida() {
        return erros.isEmpty();
    }
}
