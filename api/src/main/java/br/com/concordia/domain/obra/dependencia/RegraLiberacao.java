package br.com.concordia.domain.obra.dependencia;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.math.BigDecimal;

/** RN02 — condição de bloqueio e desbloqueio dos nós da trilha a partir das predecessoras. */
public final class RegraLiberacao {
    private static final BigDecimal CONCLUIDO = BigDecimal.valueOf(100);

    private RegraLiberacao() {}

    /**
     * Indica se o vínculo já permite o início da sucessora.
     *
     * <ul>
     *   <li>FI: a predecessora precisa estar concluída (100%).
     *   <li>II: basta a predecessora ter iniciado (&gt; 0%).
     *   <li>FF: restringe apenas o término da sucessora, nunca o início.
     * </ul>
     */
    public static boolean satisfeita(TipoDependencia tipo, BigDecimal percentualPredecessora) {
        var percentual = percentualPredecessora == null ? BigDecimal.ZERO : percentualPredecessora;
        return switch (tipo) {
            case FI -> percentual.compareTo(CONCLUIDO) >= 0;
            case II -> percentual.signum() > 0;
            case FF -> true;
        };
    }
}
