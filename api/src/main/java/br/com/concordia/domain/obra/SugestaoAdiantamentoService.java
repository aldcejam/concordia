package br.com.concordia.domain.obra;

import br.com.concordia.domain.obra.dtos.ReprogramacaoSimplificadaOutput;
import br.com.concordia.domain.obra.dtos.SugestaoAtrasoInput;
import br.com.concordia.domain.obra.dtos.SugestaoEtapaOutput;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.EtapaCandidata;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.RespostaIa;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.SugestaoIaResultado;
import br.com.concordia.domain.obra.valueobjects.GrafoDependencias;
import br.com.concordia.domain.obra.valueobjects.RegraLiberacao;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
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

    public ReprogramacaoSimplificadaOutput analisarAtraso(UUID obraId, SugestaoAtrasoInput input) {
        var obra = obraRepository
                .findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(obraId)));

        List<ItemEap> etapasOrdenadas = extrairEtapasOrdenadas(obra);
        if (etapasOrdenadas.isEmpty()) {
            throw new IllegalArgumentException("A obra não possui etapas cadastradas para análise.");
        }

        ItemEap etapaAtrasada = identificarEtapaAtrasada(etapasOrdenadas, input.etapaId());
        List<ItemEap> etapasDisponiveis = filtrarEtapasDisponiveisParaAdiantamento(
                etapasOrdenadas, etapaAtrasada, dependenciaRepository.findByObraId(obraId));

        if (etapasDisponiveis.isEmpty()) {
            return criarRespostaSemEtapasDisponiveis(etapaAtrasada, input);
        }

        EtapaCandidata atrasadaCandidata = converterParaCandidata(etapaAtrasada);
        List<EtapaCandidata> candidatas =
                etapasDisponiveis.stream().map(this::converterParaCandidata).toList();

        RespostaIa respostaIa =
                iaClient.sugerirAdiantamento(atrasadaCandidata, input.motivo(), input.diasAtraso(), candidatas);

        if (respostaIa == null || !respostaIa.disponivel()) {
            respostaIa = sugerirLocalmente(etapasDisponiveis);
        }
        List<SugestaoEtapaOutput> sugestoes = correlacionarSugestoesComEtapas(respostaIa, etapasDisponiveis);
        String parecerDescritivo = definirParecerFinal(respostaIa, !sugestoes.isEmpty());

        return new ReprogramacaoSimplificadaOutput(
                extrairIdEtapa(etapaAtrasada),
                extrairCodigoEap(etapaAtrasada),
                etapaAtrasada.getNome(),
                input.motivo(),
                input.diasAtraso(),
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
                .filter(item -> item.getEtapa().percentualAtual().signum() == 0)
                .filter(item -> !dependentesDaAtrasada.contains(extrairIdEtapa(item)))
                .filter(item -> !bloqueadas.contains(extrairIdEtapa(item)))
                .toList();
    }

    private RespostaIa sugerirLocalmente(List<ItemEap> candidatas) {
        var sugestoes = candidatas.stream()
                .sorted(Comparator.<ItemEap, BigDecimal>comparing(item ->
                                item.getValorTotalOrcado() == null ? BigDecimal.ZERO : item.getValorTotalOrcado())
                        .reversed()
                        .thenComparing(ItemEap::getPosicao))
                .limit(3)
                .map(item -> new SugestaoIaResultado(
                        extrairIdEtapa(item),
                        "Etapa não iniciada, sem dependência cadastrada da etapa atrasada e sem predecessoras "
                                + "obrigatórias pendentes. Priorizada pelo valor no orçamento. Confirme a frente "
                                + "de trabalho, equipe e insumos antes de antecipar."))
                .toList();
        return new RespostaIa(
                "Análise local: IA indisponível. Candidatas selecionadas pelas dependências cadastradas e pelo "
                        + "peso no orçamento. A ausência de vínculos cadastrados não garante independência técnica; "
                        + "revise as dependências e a viabilidade de execução antes de aplicar.",
                sugestoes);
    }

    private List<SugestaoEtapaOutput> correlacionarSugestoesComEtapas(
            RespostaIa respostaIa, List<ItemEap> etapasDisponiveis) {
        if (respostaIa == null
                || respostaIa.sugestoes() == null
                || respostaIa.sugestoes().isEmpty()) {
            return List.of();
        }

        Map<UUID, ItemEap> mapaEtapasPorId = indexarEtapasPorIdentificador(etapasDisponiveis);

        return respostaIa.sugestoes().stream()
                .map(sugestao -> montarSugestaoOutput(sugestao, mapaEtapasPorId.get(sugestao.etapaId())))
                .flatMap(Optional::stream)
                .toList();
    }

    private Map<UUID, ItemEap> indexarEtapasPorIdentificador(List<ItemEap> etapas) {
        return etapas.stream()
                .filter(item -> extrairIdEtapa(item) != null)
                .collect(Collectors.toMap(
                        this::extrairIdEtapa, Function.identity(), (existente, duplicado) -> existente));
    }

    private Optional<SugestaoEtapaOutput> montarSugestaoOutput(
            SugestaoIaResultado sugestao, ItemEap itemCorrespondente) {
        if (itemCorrespondente == null) {
            return Optional.empty();
        }
        return Optional.of(new SugestaoEtapaOutput(
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

    private ReprogramacaoSimplificadaOutput criarRespostaSemEtapasDisponiveis(
            ItemEap etapaAtrasada, SugestaoAtrasoInput input) {
        return new ReprogramacaoSimplificadaOutput(
                extrairIdEtapa(etapaAtrasada),
                extrairCodigoEap(etapaAtrasada),
                etapaAtrasada.getNome(),
                input.motivo(),
                input.diasAtraso(),
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
