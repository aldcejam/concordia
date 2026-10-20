package br.com.concordia.domain.obra;

import br.com.concordia.domain.obra.dependencia.DependenciaEtapaRepository;
import br.com.concordia.domain.obra.dependencia.GrafoDependencias;
import br.com.concordia.domain.obra.dependencia.RegraLiberacao;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.EtapaCandidata;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.RespostaIa;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.SugestaoIaResultado;
import br.com.concordia.infrastructure.obra.dtos.ReprogramacaoSimplificadaResponse;
import br.com.concordia.infrastructure.obra.dtos.SugestaoAtrasoRequest;
import br.com.concordia.infrastructure.obra.dtos.SugestaoEtapaResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SugestaoAdiantamentoService {

    private final ObraRepository obraRepository;
    private final IaReprogramacaoClient iaClient;
    private final DependenciaEtapaRepository dependenciaRepository;

    public SugestaoAdiantamentoService(
            ObraRepository obraRepository,
            IaReprogramacaoClient iaClient,
            DependenciaEtapaRepository dependenciaRepository) {
        this.obraRepository = obraRepository;
        this.iaClient = iaClient;
        this.dependenciaRepository = dependenciaRepository;
    }

    public ReprogramacaoSimplificadaResponse analisarAtraso(UUID obraId, SugestaoAtrasoRequest request) {
        var obra = obraRepository
                .findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(obraId)));

        List<ItemEap> etapasOrdenadas = extrairEtapasOrdenadas(obra);
        if (etapasOrdenadas.isEmpty()) {
            throw new IllegalArgumentException("A obra não possui etapas cadastradas para análise.");
        }

        ItemEap etapaAtrasada = identificarEtapaAtrasada(etapasOrdenadas, request.etapaId());
        List<ItemEap> etapasDisponiveis = filtrarEtapasDisponiveisParaAdiantamento(
                etapasOrdenadas, etapaAtrasada, dependenciaRepository.findByObraId(obraId));

        if (etapasDisponiveis.isEmpty()) {
            return criarRespostaSemEtapasDisponiveis(etapaAtrasada, request);
        }

        EtapaCandidata atrasadaCandidata = converterParaCandidata(etapaAtrasada);
        List<EtapaCandidata> candidatas =
                etapasDisponiveis.stream().map(this::converterParaCandidata).toList();

        RespostaIa respostaIa =
                iaClient.sugerirAdiantamento(atrasadaCandidata, request.motivo(), request.diasAtraso(), candidatas);

        List<SugestaoEtapaResponse> sugestoes = correlacionarSugestoesComEtapas(respostaIa, etapasDisponiveis);
        String parecerDescritivo = definirParecerFinal(respostaIa, !sugestoes.isEmpty());

        return new ReprogramacaoSimplificadaResponse(
                extrairIdEtapa(etapaAtrasada),
                extrairCodigoEap(etapaAtrasada),
                etapaAtrasada.getNome(),
                request.motivo(),
                request.diasAtraso(),
                parecerDescritivo,
                sugestoes);
    }

    private List<ItemEap> extrairEtapasOrdenadas(Obra obra) {
        return obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(Comparator.comparing(ItemEap::getPosicao))
                .toList();
    }

    private ItemEap identificarEtapaAtrasada(List<ItemEap> etapas, UUID etapaId) {
        return etapas.stream()
                .filter(item -> correspondeAoId(item, etapaId))
                .findFirst()
                .orElse(etapas.get(0));
    }

    /**
     * RN03: candidatas não podem depender (direta ou indiretamente) da etapa atrasada e precisam ter as predecessoras
     * obrigatórias satisfeitas (UC06).
     */
    private List<ItemEap> filtrarEtapasDisponiveisParaAdiantamento(
            List<ItemEap> etapas, ItemEap etapaAtrasada, List<DependenciaEtapa> dependencias) {
        UUID idAtrasada = extrairIdEtapa(etapaAtrasada);
        var grafo = new GrafoDependencias(dependencias.stream()
                .map(d -> new GrafoDependencias.Aresta(
                        d.getPredecessora().getId(), d.getSucessora().getId()))
                .toList());
        Set<UUID> dependentesDaAtrasada = grafo.descendentes(idAtrasada);
        Set<UUID> bloqueadas = dependencias.stream()
                .filter(DependenciaEtapa::isObrigatoria)
                .filter(d -> !RegraLiberacao.satisfeita(
                        d.getTipo(), d.getPredecessora().percentualAtual()))
                .map(d -> d.getSucessora().getId())
                .collect(Collectors.toSet());
        return etapas.stream()
                .filter(item -> item != etapaAtrasada && !correspondeAoId(item, idAtrasada))
                .filter(item -> !dependentesDaAtrasada.contains(extrairIdEtapa(item)))
                .filter(item -> !bloqueadas.contains(extrairIdEtapa(item)))
                .toList();
    }

    private List<SugestaoEtapaResponse> correlacionarSugestoesComEtapas(
            RespostaIa respostaIa, List<ItemEap> etapasDisponiveis) {
        if (respostaIa == null
                || respostaIa.sugestoes() == null
                || respostaIa.sugestoes().isEmpty()) {
            return List.of();
        }

        Map<UUID, ItemEap> mapaEtapasPorId = indexarEtapasPorIdentificador(etapasDisponiveis);

        return respostaIa.sugestoes().stream()
                .map(sugestao -> montarSugestaoResponse(sugestao, mapaEtapasPorId.get(sugestao.etapaId())))
                .flatMap(Optional::stream)
                .toList();
    }

    private Map<UUID, ItemEap> indexarEtapasPorIdentificador(List<ItemEap> etapas) {
        return etapas.stream()
                .filter(item -> extrairIdEtapa(item) != null)
                .collect(Collectors.toMap(
                        this::extrairIdEtapa, Function.identity(), (existente, duplicado) -> existente));
    }

    private Optional<SugestaoEtapaResponse> montarSugestaoResponse(
            SugestaoIaResultado sugestao, ItemEap itemCorrespondente) {
        if (itemCorrespondente == null) {
            return Optional.empty();
        }
        return Optional.of(new SugestaoEtapaResponse(
                extrairIdEtapa(itemCorrespondente),
                extrairCodigoEap(itemCorrespondente),
                itemCorrespondente.getNome(),
                sugestao.justificativa()));
    }

    private String definirParecerFinal(RespostaIa respostaIa, boolean possuiSugestoesValidas) {
        if (respostaIa != null
                && respostaIa.mensagem() != null
                && !respostaIa.mensagem().isBlank()) {
            return respostaIa.mensagem();
        }

        return possuiSugestoesValidas
                ? "Etapas com potencial para adiantamento identificadas com sucesso."
                : "A inteligência artificial analisou o cronograma e não conseguiu identificar etapas passíveis de adiantamento com segurança técnica para compensar este atraso.";
    }

    private ReprogramacaoSimplificadaResponse criarRespostaSemEtapasDisponiveis(
            ItemEap etapaAtrasada, SugestaoAtrasoRequest request) {
        return new ReprogramacaoSimplificadaResponse(
                extrairIdEtapa(etapaAtrasada),
                extrairCodigoEap(etapaAtrasada),
                etapaAtrasada.getNome(),
                request.motivo(),
                request.diasAtraso(),
                "A obra não possui outras etapas disponíveis no cronograma para adiantamento.",
                List.of());
    }

    private EtapaCandidata converterParaCandidata(ItemEap item) {
        return new EtapaCandidata(extrairIdEtapa(item), extrairCodigoEap(item), item.getNome());
    }

    private UUID extrairIdEtapa(ItemEap item) {
        if (item == null) {
            return null;
        }
        return item.getEtapa() != null ? item.getEtapa().getId() : item.getId();
    }

    private String extrairCodigoEap(ItemEap item) {
        return (item != null && item.getCodigoEap() != null) ? item.getCodigoEap() : "";
    }

    private boolean correspondeAoId(ItemEap item, UUID targetId) {
        if (item == null || targetId == null) {
            return false;
        }
        UUID id = extrairIdEtapa(item);
        return targetId.equals(id) || (item.getId() != null && targetId.equals(item.getId()));
    }
}
