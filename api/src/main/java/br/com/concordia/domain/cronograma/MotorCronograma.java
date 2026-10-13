package br.com.concordia.domain.cronograma;

import static br.com.concordia.domain.cronograma.CronogramaDados.*;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Calendário em dias corridos; dependências cadastradas do tipo fim-início. */
public final class MotorCronograma {
    private MotorCronograma() {}

    public static List<UUID> candidatas(Snapshot snapshot, UUID atrasada, OffsetDateTime referencia) {
        var etapas = indexar(snapshot);
        var afetada = exigir(etapas, atrasada);
        validarGrafo(snapshot);
        var descendentes = descendentes(snapshot, atrasada);
        return snapshot.etapas().stream()
                .filter(e -> e.ordem() > afetada.ordem())
                .filter(e -> !descendentes.contains(e.id()))
                .filter(e ->
                        e.status() == StatusEtapa.NAO_INICIADA && e.inicio().isAfter(referencia))
                .filter(e -> e.predecessores().stream().allMatch(id -> {
                    var p = exigir(etapas, id);
                    return p.status() == StatusEtapa.CONCLUIDA && !p.fimReal().isAfter(referencia);
                }))
                .map(Etapa::id)
                .toList();
    }

    private static Set<UUID> descendentes(Snapshot snapshot, UUID etapaId) {
        var sucessores = new HashMap<UUID, List<UUID>>();
        for (var e : snapshot.etapas())
            for (var p : e.predecessores()) {
                sucessores.computeIfAbsent(p, k -> new ArrayList<>()).add(e.id());
            }
        var fila = new ArrayDeque<UUID>();
        var resultado = new HashSet<UUID>();
        fila.add(etapaId);
        while (!fila.isEmpty())
            for (var id : sucessores.getOrDefault(fila.remove(), List.of())) {
                if (resultado.add(id)) fila.add(id);
            }
        return resultado;
    }

    public static void validarGrafo(Snapshot snapshot) {
        topologica(snapshot);
    }

    private static List<Etapa> topologica(Snapshot snapshot) {
        var etapas = indexar(snapshot);
        var graus = new HashMap<UUID, Integer>();
        var sucessores = new HashMap<UUID, List<UUID>>();
        var fila = new ArrayDeque<Etapa>();
        for (var e : snapshot.etapas()) {
            graus.put(e.id(), e.predecessores().size());
            if (e.predecessores().isEmpty()) fila.add(e);
            for (var id : e.predecessores()) {
                exigir(etapas, id);
                sucessores.computeIfAbsent(id, k -> new ArrayList<>()).add(e.id());
            }
        }
        var resultado = new ArrayList<Etapa>();
        while (!fila.isEmpty()) {
            var e = fila.remove();
            resultado.add(e);
            for (var id : sucessores.getOrDefault(e.id(), List.of())) {
                if (graus.compute(id, (k, v) -> v - 1) == 0) fila.add(etapas.get(id));
            }
        }
        if (resultado.size() != etapas.size()) throw new IllegalArgumentException("As dependências formam um ciclo.");
        return resultado;
    }

    public static Simulacao simular(
            Snapshot antes, UUID atrasada, int dias, OffsetDateTime referencia, List<UUID> selecionadas, ZoneId fuso) {
        var etapas = indexar(antes);
        var afetada = exigir(etapas, atrasada);
        if (dias <= 0 || afetada.status() == StatusEtapa.CONCLUIDA) {
            throw new IllegalArgumentException("O atraso deve ser positivo e a etapa deve estar aberta.");
        }
        var elegiveis = new HashSet<>(candidatas(antes, atrasada, referencia));
        var ids = new LinkedHashSet<>(selecionadas);
        if (ids.size() != selecionadas.size() || !elegiveis.containsAll(ids)) {
            throw new IllegalArgumentException("A seleção contém etapas duplicadas ou sem condições de adiantamento.");
        }
        var ordem = new ArrayList<UUID>();
        for (var e : antes.etapas()) {
            if (!ids.contains(e.id())) ordem.add(e.id());
            if (e.id().equals(atrasada)) ordem.addAll(selecionadas);
        }
        var calculadas = new HashMap<UUID, Etapa>();
        for (var e : topologica(antes)) calcular(e, calculadas, ids, atrasada, dias, referencia, fuso);
        var resultado = new ArrayList<Etapa>();
        for (int i = 0; i < ordem.size(); i++) {
            var e = calculadas.get(ordem.get(i));
            resultado.add(copiar(e, i, e.inicio(), e.fim()));
        }
        var depois = new Snapshot(antes.versao() + 1, List.copyOf(resultado));
        return new Simulacao(antes, depois, termino(antes), termino(depois));
    }

    private static Etapa calcular(
            Etapa e,
            Map<UUID, Etapa> calculadas,
            Set<UUID> selecionadas,
            UUID atrasada,
            int dias,
            OffsetDateTime referencia,
            ZoneId fuso) {
        if (calculadas.containsKey(e.id())) return calculadas.get(e.id());
        OffsetDateTime inicio = e.inicio();
        OffsetDateTime fim = e.fim();
        if (e.status() != StatusEtapa.CONCLUIDA) {
            inicio = e.status() == StatusEtapa.EM_ANDAMENTO
                    ? e.inicioReal()
                    : max(selecionadas.contains(e.id()) ? referencia : e.inicio(), referencia);
            for (var id : e.predecessores()) {
                var p = calculadas.get(id);
                var termino = p.status() == StatusEtapa.CONCLUIDA ? p.fimReal() : p.fim();
                if (e.status() == StatusEtapa.NAO_INICIADA) inicio = max(inicio, termino);
            }
            // Preserva também extensões de duração aplicadas em reprogramações anteriores.
            var duracao = Duration.between(
                    e.inicio().atZoneSameInstant(fuso).toLocalDateTime(),
                    e.fim().atZoneSameInstant(fuso).toLocalDateTime());
            fim = inicio.atZoneSameInstant(fuso)
                    .toLocalDateTime()
                    .plus(duracao)
                    .atZone(fuso)
                    .toOffsetDateTime();
            if (e.status() == StatusEtapa.EM_ANDAMENTO) fim = max(fim, max(e.fim(), referencia));
            if (e.id().equals(atrasada)) fim = maisDias(max(fim, e.fim()), dias, fuso);
        }
        var nova = copiar(e, e.ordem(), inicio, fim);
        calculadas.put(e.id(), nova);
        return nova;
    }

    private static Etapa copiar(Etapa e, int ordem, OffsetDateTime inicio, OffsetDateTime fim) {
        return new Etapa(
                e.id(),
                e.descricao(),
                ordem,
                e.status(),
                inicio,
                fim,
                e.duracaoDias(),
                e.inicioOriginal(),
                e.fimOriginal(),
                e.inicioReal(),
                e.fimReal(),
                e.predecessores());
    }

    private static OffsetDateTime maisDias(OffsetDateTime data, int dias, ZoneId fuso) {
        return data.atZoneSameInstant(fuso).plusDays(dias).toOffsetDateTime();
    }

    private static OffsetDateTime max(OffsetDateTime a, OffsetDateTime b) {
        return a.isAfter(b) ? a : b;
    }

    private static OffsetDateTime termino(Snapshot s) {
        return s.etapas().stream()
                .map(e -> e.fimReal() == null ? e.fim() : e.fimReal())
                .max(Comparator.comparing(OffsetDateTime::toInstant))
                .orElse(null);
    }

    private static Map<UUID, Etapa> indexar(Snapshot s) {
        return s.etapas().stream().collect(Collectors.toMap(Etapa::id, Function.identity()));
    }

    private static Etapa exigir(Map<UUID, Etapa> etapas, UUID id) {
        var etapa = etapas.get(id);
        if (etapa == null) throw new IllegalArgumentException("Dependência ou etapa não pertence a esta obra.");
        return etapa;
    }
}
