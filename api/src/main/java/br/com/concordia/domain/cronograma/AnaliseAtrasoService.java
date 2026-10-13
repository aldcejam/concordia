package br.com.concordia.domain.cronograma;

import br.com.concordia.domain.cronograma.CronogramaDados.*;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AnaliseAtrasoService {
    private final CronogramaService cronogramas;
    private final RecomendacaoIa ia;

    public AnaliseAtrasoService(CronogramaService cronogramas, RecomendacaoIa ia) {
        this.cronogramas = cronogramas;
        this.ia = ia;
    }

    // A chamada externa fica fora das transações e dos locks de banco.
    public Atraso analisar(UUID obraId, UUID atrasoId) {
        var contexto = cronogramas.prepararAnalise(obraId, atrasoId);
        List<Sugestao> sugestoes;
        try {
            sugestoes = contexto.candidatasElegiveis().isEmpty() ? List.of() : ia.recomendar(contexto);
        } catch (FalhaAnaliseException e) {
            return cronogramas.concluirAnalise(obraId, atrasoId, contexto, null, e.getMessage());
        } catch (RuntimeException e) {
            return cronogramas.concluirAnalise(
                    obraId,
                    atrasoId,
                    contexto,
                    null,
                    "Não foi possível obter as sugestões. O atraso foi preservado; tente novamente.");
        }
        return cronogramas.concluirAnalise(obraId, atrasoId, contexto, sugestoes, null);
    }
}
