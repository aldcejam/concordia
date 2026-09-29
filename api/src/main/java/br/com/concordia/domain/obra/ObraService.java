package br.com.concordia.domain.obra;

import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.domain.obra.dtos.EtapaInput;
import br.com.concordia.domain.obra.dtos.EtapaOutput;
import br.com.concordia.domain.obra.dtos.MedicaoInput;
import br.com.concordia.domain.obra.dtos.MedicaoOutput;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.MedicaoEtapa;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObraService {

    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public ObraService(ObraRepository obraRepository, EmpresaRepository empresaRepository, ObraMapper mapper) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
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
        return obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(java.util.Comparator.comparing(ItemEap::getPosicao))
                .map(this::toEtapaOutput)
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
        return toEtapaOutput(item);
    }

    @Transactional
    public EtapaOutput atualizarOrcamentoEtapa(UUID obraId, UUID etapaId, EtapaInput request) {
        var obra = obterObra(obraId);
        var item = obra.getEap().stream()
                .filter(eap -> eap.getEtapa() != null && eap.getEtapa().getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
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
        return toEtapaOutput(item);
    }

    @Transactional(readOnly = true)
    public EtapaOutput consultarEtapa(UUID obraId, UUID etapaId) {
        var obra = obterObra(obraId);
        var item = obra.getEap().stream()
                .filter(eap -> eap.getEtapa() != null && eap.getEtapa().getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
        return toEtapaOutput(item);
    }

    @Transactional
    public EtapaOutput registrarMedicao(UUID obraId, UUID etapaId, MedicaoInput request) {
        var obra = obterObra(obraId);
        var etapa = obra.getEtapas().stream()
                .filter(item -> item.getId().equals(etapaId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Etapa com ID %s não foi encontrada na obra".formatted(etapaId)));
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

    private EtapaOutput toEtapaOutput(ItemEap item) {
        var etapa = item.getEtapa();
        var medicoes = etapa.getMedicoes().stream().map(this::toMedicaoOutput).toList();
        var ultimaMedicao = etapa.getMedicoes().isEmpty() ? null : etapa.getMedicoes().get(etapa.getMedicoes().size() - 1);

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
                medicoes);
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
}
