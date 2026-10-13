package br.com.concordia.domain.cronograma;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class CronogramaDados {
    private CronogramaDados() {}

    public record Etapa(
            UUID id,
            String descricao,
            int ordem,
            StatusEtapa status,
            OffsetDateTime inicio,
            OffsetDateTime fim,
            Integer duracaoDias,
            OffsetDateTime inicioOriginal,
            OffsetDateTime fimOriginal,
            OffsetDateTime inicioReal,
            OffsetDateTime fimReal,
            List<UUID> predecessores) {}

    public record Snapshot(long versao, List<Etapa> etapas) {}

    public record Sugestao(UUID etapaId, String justificativa) {}

    public record Recomendacoes(List<Sugestao> sugestoes) {}

    public record Selecao(List<UUID> etapaIds) {}

    public record Contexto(
            UUID obraId,
            UUID etapaAtrasadaId,
            String motivo,
            int diasAtraso,
            OffsetDateTime referencia,
            Snapshot cronograma,
            List<UUID> candidatasElegiveis) {}

    public record Simulacao(
            Snapshot antes, Snapshot depois, OffsetDateTime terminoAntes, OffsetDateTime terminoDepois) {}

    public record Atraso(
            UUID id,
            UUID etapaId,
            String motivo,
            int diasAtraso,
            String status,
            String erro,
            long versaoCronograma,
            OffsetDateTime criadoEm,
            OffsetDateTime referencia,
            List<Sugestao> sugestoes,
            List<UUID> selecionadas,
            Simulacao resultado,
            OffsetDateTime aplicadoEm,
            String autorAplicacao) {}

    public record Cronograma(
            UUID obraId, String descricao, String fusoHorario, Snapshot cronograma, List<Atraso> atrasos) {}
}
