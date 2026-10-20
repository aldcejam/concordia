package br.com.concordia.domain.obra.dependencia;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.dependencia.DependenciaOutput.EtapaResumo;
import br.com.concordia.domain.obra.dependencia.GrafoDependencias.Aresta;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.enums.TipoDependencia;
import jakarta.persistence.EntityNotFoundException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** UC06 — configura vínculos de precedência entre etapas, impedindo ciclos (deadlock) na EAP. */
@Service
public class DependenciaEtapaService {
    static final int DESFASAMENTO_MAXIMO_DIAS = 365;

    private final ObraRepository obraRepository;
    private final DependenciaEtapaRepository repository;

    public DependenciaEtapaService(ObraRepository obraRepository, DependenciaEtapaRepository repository) {
        this.obraRepository = obraRepository;
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<DependenciaOutput> listar(UUID obraId) {
        var etapas = etapasPorId(obterObra(obraId));
        return repository.findByObraId(obraId).stream()
                .sorted(Comparator.comparing((DependenciaEtapa d) -> posicao(etapas, d.getSucessora()))
                        .thenComparing(d -> posicao(etapas, d.getPredecessora())))
                .map(dependencia -> toOutput(dependencia, etapas))
                .toList();
    }

    @Transactional
    public DependenciaOutput criar(UUID obraId, DependenciaInput input) {
        var obra = obterObra(obraId);
        var etapas = etapasPorId(obra);
        var predecessora = obterEtapa(etapas, input.predecessoraId(), "predecessora");
        var sucessora = obterEtapa(etapas, input.sucessoraId(), "sucessora");
        if (predecessora == sucessora) {
            throw new IllegalArgumentException("Uma etapa não pode depender de si mesma.");
        }

        var existentes = repository.findByObraId(obraId);
        boolean duplicada = existentes.stream()
                .anyMatch(d -> d.getPredecessora()
                                .getId()
                                .equals(predecessora.getEtapa().getId())
                        && d.getSucessora().getId().equals(sucessora.getEtapa().getId()));
        if (duplicada) {
            throw new ConflitoException(
                    "Já existe um vínculo em que %s depende de %s.".formatted(rotulo(sucessora), rotulo(predecessora)));
        }

        var grafo = new GrafoDependencias(existentes.stream()
                .map(d ->
                        new Aresta(d.getPredecessora().getId(), d.getSucessora().getId()))
                .toList());
        grafo.cicloAoAdicionar(
                        predecessora.getEtapa().getId(), sucessora.getEtapa().getId())
                .ifPresent(ciclo -> {
                    throw new ConflitoException(
                            "Vínculo recusado: criaria um ciclo na EAP (%s). Uma etapa não pode depender, direta ou indiretamente, de si mesma."
                                    .formatted(ciclo.stream()
                                            .map(id -> rotulo(etapas.get(id)))
                                            .collect(Collectors.joining(" → "))));
                });

        var dependencia = new DependenciaEtapa(
                obra,
                predecessora.getEtapa(),
                sucessora.getEtapa(),
                input.tipo() == null ? TipoDependencia.FI : input.tipo(),
                desfasamento(input.desfasamentoDias()),
                input.obrigatoria() == null || input.obrigatoria());
        return toOutput(repository.save(dependencia), etapas);
    }

    @Transactional
    public DependenciaOutput atualizar(UUID obraId, UUID dependenciaId, DependenciaInput input) {
        var etapas = etapasPorId(obterObra(obraId));
        var dependencia = obterDependencia(obraId, dependenciaId);
        dependencia.atualizar(
                input.tipo() == null ? dependencia.getTipo() : input.tipo(),
                input.desfasamentoDias() == null
                        ? dependencia.getDesfasamentoDias()
                        : desfasamento(input.desfasamentoDias()),
                input.obrigatoria() == null ? dependencia.isObrigatoria() : input.obrigatoria());
        return toOutput(dependencia, etapas);
    }

    @Transactional
    public void remover(UUID obraId, UUID dependenciaId) {
        repository.delete(obterDependencia(obraId, dependenciaId));
    }

    private DependenciaEtapa obterDependencia(UUID obraId, UUID dependenciaId) {
        return repository
                .findById(dependenciaId)
                .filter(d -> d.getObra().getId().equals(obraId))
                .orElseThrow(() -> new EntityNotFoundException(
                        "Dependência com ID %s não foi encontrada na obra".formatted(dependenciaId)));
    }

    private static int desfasamento(Integer dias) {
        if (dias == null) {
            return 0;
        }
        if (Math.abs(dias) > DESFASAMENTO_MAXIMO_DIAS) {
            throw new IllegalArgumentException("O desfasamento deve estar entre -%d e %d dias."
                    .formatted(DESFASAMENTO_MAXIMO_DIAS, DESFASAMENTO_MAXIMO_DIAS));
        }
        return dias;
    }

    private Obra obterObra(UUID id) {
        return obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
    }

    /** Itens da EAP que são etapas, indexados pelo ID da etapa. */
    private static Map<UUID, ItemEap> etapasPorId(Obra obra) {
        return obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .collect(Collectors.toMap(item -> item.getEtapa().getId(), Function.identity()));
    }

    private static ItemEap obterEtapa(Map<UUID, ItemEap> etapas, UUID id, String papel) {
        if (id == null) {
            throw new IllegalArgumentException("Informe a etapa %s.".formatted(papel));
        }
        var item = etapas.get(id);
        if (item == null) {
            throw new EntityNotFoundException("Etapa %s com ID %s não foi encontrada na obra".formatted(papel, id));
        }
        return item;
    }

    private static double posicao(Map<UUID, ItemEap> etapas, EtapaObra etapa) {
        var item = etapas.get(etapa.getId());
        return item == null ? Double.MAX_VALUE : item.getPosicao();
    }

    private static String rotulo(ItemEap item) {
        return item.getCodigoEap() == null ? item.getNome() : item.getCodigoEap();
    }

    private static DependenciaOutput toOutput(DependenciaEtapa dependencia, Map<UUID, ItemEap> etapas) {
        return new DependenciaOutput(
                dependencia.getId(),
                resumo(etapas.get(dependencia.getPredecessora().getId()), dependencia.getPredecessora()),
                resumo(etapas.get(dependencia.getSucessora().getId()), dependencia.getSucessora()),
                dependencia.getTipo(),
                dependencia.getDesfasamentoDias(),
                dependencia.isObrigatoria(),
                RegraLiberacao.satisfeita(
                        dependencia.getTipo(), dependencia.getPredecessora().percentualAtual()),
                dependencia.getCriadaEm());
    }

    private static EtapaResumo resumo(ItemEap item, EtapaObra etapa) {
        return item == null
                ? new EtapaResumo(etapa.getId(), null, etapa.getDescricao())
                : new EtapaResumo(etapa.getId(), item.getCodigoEap(), item.getNome());
    }
}
