package br.com.concordia.domain.obra.dependencia;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/** Grafo dirigido predecessora → sucessora usado para impedir ciclos na EAP e consultar dependências indiretas. */
public final class GrafoDependencias {
    public record Aresta(UUID predecessora, UUID sucessora) {}

    private final Map<UUID, Set<UUID>> sucessoras = new HashMap<>();

    public GrafoDependencias(Collection<Aresta> arestas) {
        arestas.forEach(aresta -> sucessoras
                .computeIfAbsent(aresta.predecessora(), id -> new LinkedHashSet<>())
                .add(aresta.sucessora()));
    }

    /**
     * Caminho que surgiria ao adicionar {@code predecessora → sucessora}, fechando um ciclo. Vazio quando o vínculo é
     * seguro. O caminho começa e termina na predecessora (ex.: A → B → C → A).
     */
    public Optional<List<UUID>> cicloAoAdicionar(UUID predecessora, UUID sucessora) {
        if (predecessora.equals(sucessora)) {
            return Optional.of(List.of(predecessora, predecessora));
        }
        return caminho(sucessora, predecessora).map(caminho -> {
            var ciclo = new ArrayList<UUID>(caminho.size() + 1);
            ciclo.add(predecessora);
            ciclo.addAll(caminho);
            return ciclo;
        });
    }

    /** Busca em largura: menor caminho de {@code origem} até {@code destino} seguindo as arestas. */
    public Optional<List<UUID>> caminho(UUID origem, UUID destino) {
        Map<UUID, UUID> anterior = new HashMap<>();
        Set<UUID> visitados = new HashSet<>(Set.of(origem));
        var fila = new ArrayDeque<UUID>(List.of(origem));
        while (!fila.isEmpty()) {
            var atual = fila.poll();
            if (atual.equals(destino)) {
                var caminho = new ArrayList<UUID>();
                for (var no = destino; no != null; no = anterior.get(no)) {
                    caminho.add(no);
                }
                Collections.reverse(caminho);
                return Optional.of(caminho);
            }
            for (var proxima : sucessoras.getOrDefault(atual, Set.of())) {
                if (visitados.add(proxima)) {
                    anterior.put(proxima, atual);
                    fila.add(proxima);
                }
            }
        }
        return Optional.empty();
    }

    /** Todas as etapas que dependem, direta ou indiretamente, da etapa informada. */
    public Set<UUID> descendentes(UUID etapa) {
        Set<UUID> encontrados = new LinkedHashSet<>();
        var fila = new ArrayDeque<UUID>(List.of(etapa));
        while (!fila.isEmpty()) {
            for (var proxima : sucessoras.getOrDefault(fila.poll(), Set.of())) {
                if (encontrados.add(proxima)) {
                    fila.add(proxima);
                }
            }
        }
        encontrados.remove(etapa);
        return encontrados;
    }
}
