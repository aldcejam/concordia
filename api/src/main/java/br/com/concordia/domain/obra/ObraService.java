package br.com.concordia.domain.obra;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.dependencia.DependenciaEtapaRepository;
import br.com.concordia.domain.obra.dependencia.RegraLiberacao;
import br.com.concordia.domain.obra.dtos.EtapaInput;
import br.com.concordia.domain.obra.dtos.EtapaOutput;
import br.com.concordia.domain.obra.dtos.MedicaoInput;
import br.com.concordia.domain.obra.dtos.MedicaoOutput;
import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.domain.obra.dtos.VinculoEtapaOutput;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.MedicaoEtapa;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObraService {

    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final ObraMapper mapper;
    private final DependenciaEtapaRepository dependenciaRepository;

    public ObraService(
            ObraRepository obraRepository,
            EmpresaRepository empresaRepository,
            ObraMapper mapper,
            DependenciaEtapaRepository dependenciaRepository) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
        this.dependenciaRepository = dependenciaRepository;
    }

    @Transactional
    public ObraOutput criar(ObraInput request) {
        Empresa empresa = null;
        if (request.idEmpresa() != null) {
            empresa = empresaRepository
                    .findById(request.idEmpresa())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.idEmpresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toOutputDto(obraRepository.save(obra));
    }

    @Transactional(readOnly = true)
    public ObraOutput consultar(UUID id) {
        var obra = obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
        return mapper.toOutputDto(obra);
    }

    @Transactional
    public ObraOutput atualizar(UUID id, ObraInput request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizar(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toOutputDto(obra);
    }

    @Transactional
    public ObraOutput atualizarParcial(UUID id, ObraInput request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizarParcial(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toOutputDto(obra);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!obraRepository.existsById(id)) {
            throw new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id));
        }
        obraRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ObraOutput> listar() {
        var obras = obraRepository.findAll();
        return mapper.toOutputDto(obras);
    }

    @Transactional(readOnly = true)
    public List<EtapaOutput> listarEtapas(UUID obraId) {
        var obra = obterObra(obraId);
        var contexto = contexto(obra);
        return obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(java.util.Comparator.comparing(ItemEap::getPosicao))
                .map(item -> toEtapaOutput(item, contexto))
                .toList();
    }

    @Transactional
    public EtapaOutput criarEtapa(UUID obraId, EtapaInput request) {
        var obra = obterObra(obraId);
        ItemEap pai = null;
        if (request.idItemPai() != null) {
            pai = obra.getEap().stream()
                    .filter(item -> item.getId().equals(request.idItemPai()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Item EAP com ID %s não foi encontrado na obra".formatted(request.idItemPai())));
        }

        var etapa = new EtapaObra(request.descricao(), request.inicio(), request.prazoEsperadoDias());
        var item = pai == null
                ? new ItemEap(obra, request.nome(), request.posicao(), etapa)
                : new ItemEap(obra, request.nome(), pai, request.posicao(), etapa);
        item.atualizarDadosOrcamento(
                request.nome(),
                request.codigoEap(),
                request.bancoOrcamento(),
                request.codigoComposicao(),
                request.tipoComposicao(),
                request.macroetapa(),
                request.unidadeOrcamento(),
                request.quantidadeOrcada(),
                request.valorUnitarioOrcado(),
                request.valorUnitarioBase(),
                request.percentualBdi(),
                request.valorTotalOrcado());
        obra.adicionarEtapa(etapa);
        obra.adicionarItemEap(item);
        obraRepository.save(obra);
        return toEtapaOutput(item, contexto(obra));
    }

    @Transactional
    public EtapaOutput atualizarOrcamentoEtapa(UUID obraId, UUID etapaId, EtapaInput request) {
        var obra = obterObra(obraId);
        var item = obra.getEap().stream()
                .filter(eap -> eap.getEtapa() != null && eap.getEtapa().getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() ->
                        new EntityNotFoundException("Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
        item.atualizarDadosOrcamento(
                request.nome(),
                request.codigoEap(),
                request.bancoOrcamento(),
                request.codigoComposicao(),
                request.tipoComposicao(),
                request.macroetapa(),
                request.unidadeOrcamento(),
                request.quantidadeOrcada(),
                request.valorUnitarioOrcado(),
                request.valorUnitarioBase(),
                request.percentualBdi(),
                request.valorTotalOrcado());
        return toEtapaOutput(item, contexto(obra));
    }

    @Transactional(readOnly = true)
    public EtapaOutput consultarEtapa(UUID obraId, UUID etapaId) {
        var obra = obterObra(obraId);
        var item = obra.getEap().stream()
                .filter(eap -> eap.getEtapa() != null && eap.getEtapa().getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() ->
                        new EntityNotFoundException("Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
        return toEtapaOutput(item, contexto(obra));
    }

    @Transactional
    public EtapaOutput registrarMedicao(UUID obraId, UUID etapaId, MedicaoInput request) {
        var obra = obterObra(obraId);
        var etapa = obra.getEtapas().stream()
                .filter(item -> item.getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() ->
                        new EntityNotFoundException("Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
        if (request.percentualExecutado().signum() > 0) {
            var pendentes = contexto(obra).predecessorasPendentes(etapaId);
            if (!pendentes.isEmpty()) {
                throw new ConflitoException(
                        "Etapa bloqueada: aguarda %s. Conclua as predecessoras ou ajuste as dependências antes de medir."
                                .formatted(String.join(", ", pendentes)));
            }
        }
        etapa.registrarMedicao(
                request.percentualExecutado(),
                request.quantidadeExecutada(),
                request.observacao(),
                request.motivoAtraso(),
                request.diasAtraso());
        obraRepository.save(obra);

        return consultarEtapa(obraId, etapaId);
    }

    private @NonNull Obra obterObra(UUID id) {
        return obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
    }

    private @Nullable Empresa obterEmpresa(UUID id) {
        Empresa empresa = null;
        if (id != null) {
            empresa = empresaRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new EntityNotFoundException("Empresa com ID %s não foi encontrada no banco".formatted(id)));
        }
        return empresa;
    }

    /** Dados da obra necessários para montar cada etapa: total orçado (pesos) e grafo de dependências (RN02). */
    private record ContextoEtapas(
            BigDecimal totalOrcado,
            Map<UUID, ItemEap> itensPorEtapa,
            Map<UUID, List<DependenciaEtapa>> porSucessora,
            Map<UUID, List<DependenciaEtapa>> porPredecessora) {

        List<String> predecessorasPendentes(UUID etapaId) {
            return porSucessora.getOrDefault(etapaId, List.of()).stream()
                    .filter(DependenciaEtapa::isObrigatoria)
                    .filter(d -> !RegraLiberacao.satisfeita(
                            d.getTipo(), d.getPredecessora().percentualAtual()))
                    .map(d -> {
                        var item = itensPorEtapa.get(d.getPredecessora().getId());
                        return item == null || item.getCodigoEap() == null
                                ? d.getPredecessora().getDescricao()
                                : item.getCodigoEap();
                    })
                    .toList();
        }

        VinculoEtapaOutput vinculo(DependenciaEtapa dependencia, boolean ladoPredecessora) {
            var outra = ladoPredecessora ? dependencia.getPredecessora() : dependencia.getSucessora();
            var item = itensPorEtapa.get(outra.getId());
            return new VinculoEtapaOutput(
                    dependencia.getId(),
                    outra.getId(),
                    item == null ? null : item.getCodigoEap(),
                    item == null ? outra.getDescricao() : item.getNome(),
                    dependencia.getTipo(),
                    dependencia.getDesfasamentoDias(),
                    dependencia.isObrigatoria(),
                    RegraLiberacao.satisfeita(
                            dependencia.getTipo(), dependencia.getPredecessora().percentualAtual()));
        }
    }

    private ContextoEtapas contexto(Obra obra) {
        var itens =
                obra.getEap().stream().filter(item -> item.getEtapa() != null).toList();
        var total = itens.stream()
                .map(ItemEap::getValorTotalOrcado)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        var dependencias =
                obra.getId() == null ? List.<DependenciaEtapa>of() : dependenciaRepository.findByObraId(obra.getId());
        return new ContextoEtapas(
                total,
                itens.stream()
                        .collect(Collectors.toMap(item -> item.getEtapa().getId(), Function.identity(), (a, b) -> a)),
                dependencias.stream()
                        .collect(Collectors.groupingBy(d -> d.getSucessora().getId())),
                dependencias.stream()
                        .collect(Collectors.groupingBy(d -> d.getPredecessora().getId())));
    }

    private EtapaOutput toEtapaOutput(ItemEap item, ContextoEtapas contexto) {
        var etapa = item.getEtapa();
        var peso = item.getValorTotalOrcado() == null || contexto.totalOrcado().signum() == 0
                ? BigDecimal.ZERO
                : item.getValorTotalOrcado()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(contexto.totalOrcado(), 4, RoundingMode.HALF_UP);
        var predecessoras = contexto.porSucessora().getOrDefault(etapa.getId(), List.of()).stream()
                .map(d -> contexto.vinculo(d, true))
                .toList();
        var sucessoras = contexto.porPredecessora().getOrDefault(etapa.getId(), List.of()).stream()
                .map(d -> contexto.vinculo(d, false))
                .toList();
        var medicoes = etapa.getMedicoes().stream().map(this::toMedicaoOutput).toList();
        var ultimaMedicao = etapa.getMedicoes().isEmpty()
                ? null
                : etapa.getMedicoes().get(etapa.getMedicoes().size() - 1);

        return new EtapaOutput(
                etapa.getId(),
                item.getId(),
                item.getPai() == null ? null : item.getPai().getId(),
                item.getNome(),
                etapa.getDescricao(),
                item.getPosicao(),
                etapa.getInicio(),
                etapa.getFim(),
                etapa.getPrazoEsperadoDias(),
                ultimaMedicao == null ? BigDecimal.ZERO : ultimaMedicao.getPercentualExecutado(),
                ultimaMedicao == null ? BigDecimal.ZERO : ultimaMedicao.getQuantidadeExecutada(),
                ultimaMedicao == null ? null : ultimaMedicao.getMotivoAtraso(),
                ultimaMedicao == null ? null : ultimaMedicao.getDiasAtraso(),
                item.getCodigoEap(),
                item.getBancoOrcamento(),
                item.getCodigoComposicao(),
                item.getTipoComposicao(),
                item.getMacroetapa(),
                item.getUnidadeOrcamento(),
                item.getQuantidadeOrcada(),
                item.getValorUnitarioOrcado(),
                item.getValorUnitarioBase(),
                item.getPercentualBdi(),
                item.getValorTotalOrcado(),
                medicoes,
                peso,
                !contexto.predecessorasPendentes(etapa.getId()).isEmpty(),
                predecessoras,
                sucessoras);
    }

    private MedicaoOutput toMedicaoOutput(MedicaoEtapa medicao) {
        return new MedicaoOutput(
                medicao.getId(),
                medicao.getPercentualExecutado(),
                medicao.getQuantidadeExecutada(),
                medicao.getObservacao(),
                medicao.getMotivoAtraso(),
                medicao.getDiasAtraso(),
                medicao.getRegistradaEm());
    }

    @Transactional
    public List<EtapaOutput> reordenarEtapaLogoApos(UUID obraId, UUID etapaAtrasadaId, UUID etapaAdiantadaId) {
        var obra = obterObra(obraId);
        var itensComEtapa = obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(java.util.Comparator.comparing(ItemEap::getPosicao))
                .toList();

        var itemAtrasado = itensComEtapa.stream()
                .filter(item -> (item.getEtapa() != null
                                && etapaAtrasadaId.equals(item.getEtapa().getId()))
                        || (item.getId() != null && etapaAtrasadaId.equals(item.getId())))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Etapa atrasada com ID %s não encontrada".formatted(etapaAtrasadaId)));

        var itemAdiantado = itensComEtapa.stream()
                .filter(item -> (item.getEtapa() != null
                                && etapaAdiantadaId.equals(item.getEtapa().getId()))
                        || (item.getId() != null && etapaAdiantadaId.equals(item.getId())))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Etapa adiantada com ID %s não encontrada".formatted(etapaAdiantadaId)));

        if (!itemAtrasado.equals(itemAdiantado)) {
            int idxAtrasado = itensComEtapa.indexOf(itemAtrasado);
            Double posAtrasado = itemAtrasado.getPosicao();
            Double proximaPosicao = (idxAtrasado + 1 < itensComEtapa.size())
                    ? itensComEtapa.get(idxAtrasado + 1).getPosicao()
                    : posAtrasado + 1000.0;

            if (idxAtrasado + 1 < itensComEtapa.size() && itemAdiantado.equals(itensComEtapa.get(idxAtrasado + 1))) {
                proximaPosicao = (idxAtrasado + 2 < itensComEtapa.size())
                        ? itensComEtapa.get(idxAtrasado + 2).getPosicao()
                        : posAtrasado + 1000.0;
            }

            Double novaPosicao = (posAtrasado + proximaPosicao) / 2.0;
            itemAdiantado.moverParaLogoApos(itemAtrasado, novaPosicao);
            obraRepository.save(obra);
        }

        return listarEtapas(obraId);
    }
}
