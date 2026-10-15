package br.com.concordia.domain.obra;

import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.EtapaCandidata;
import br.com.concordia.domain.obra.ports.IaReprogramacaoClient.RespostaIa;
import br.com.concordia.infrastructure.obra.dtos.ReprogramacaoSimplificadaResponse;
import br.com.concordia.infrastructure.obra.dtos.SugestaoAtrasoRequest;
import br.com.concordia.infrastructure.obra.dtos.SugestaoEtapaResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SugestaoAdiantamentoService {

    private final ObraRepository obraRepository;
    private final IaReprogramacaoClient iaClient;

    public SugestaoAdiantamentoService(ObraRepository obraRepository, IaReprogramacaoClient iaClient) {
        this.obraRepository = obraRepository;
        this.iaClient = iaClient;
    }

    public ReprogramacaoSimplificadaResponse analisarAtraso(UUID obraId, SugestaoAtrasoRequest request) {
        var obra = obraRepository
                .findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(obraId)));

        var etapasItens = obra.getEap().stream()
                .filter(item -> item.getEtapa() != null)
                .sorted(Comparator.comparing(ItemEap::getPosicao))
                .toList();

        if (etapasItens.isEmpty()) {
            throw new IllegalArgumentException("A obra não possui etapas cadastradas para análise.");
        }

        var etapaAtrasadaItem = etapasItens.stream()
                .filter(item -> (item.getEtapa() != null
                                && item.getEtapa().getId() != null
                                && item.getEtapa().getId().equals(request.etapaId()))
                        || (item.getId() != null && item.getId().equals(request.etapaId())))
                .findFirst()
                .orElse(etapasItens.get(0));

        var outrasEtapas = etapasItens.stream()
                .filter(item -> item != etapaAtrasadaItem
                        && (item.getId() == null
                                || etapaAtrasadaItem.getId() == null
                                || !item.getId().equals(etapaAtrasadaItem.getId())))
                .toList();

        final List<SugestaoEtapaResponse> sugestoes = new ArrayList<>();
        String mensagem;

        if (outrasEtapas.isEmpty()) {
            mensagem = "A obra não possui outras etapas disponíveis no cronograma para adiantamento.";
        } else {
            UUID idAtrasada = etapaAtrasadaItem.getEtapa() != null
                    ? etapaAtrasadaItem.getEtapa().getId()
                    : etapaAtrasadaItem.getId();

            var atrasadaCandidata = new EtapaCandidata(
                    idAtrasada,
                    etapaAtrasadaItem.getCodigoEap() != null ? etapaAtrasadaItem.getCodigoEap() : "",
                    etapaAtrasadaItem.getNome());

            var candidatas = outrasEtapas.stream()
                    .map(item -> {
                        UUID id = item.getEtapa() != null ? item.getEtapa().getId() : item.getId();
                        return new EtapaCandidata(
                                id, item.getCodigoEap() != null ? item.getCodigoEap() : "", item.getNome());
                    })
                    .toList();

            RespostaIa respostaIa =
                    iaClient.sugerirAdiantamento(atrasadaCandidata, request.motivo(), request.diasAtraso(), candidatas);

            if (respostaIa != null
                    && respostaIa.sugestoes() != null
                    && !respostaIa.sugestoes().isEmpty()) {
                for (var res : respostaIa.sugestoes()) {
                    for (var it : outrasEtapas) {
                        boolean match = (it.getEtapa() != null
                                        && it.getEtapa().getId() != null
                                        && it.getEtapa().getId().equals(res.etapaId()))
                                || (it.getId() != null && it.getId().equals(res.etapaId()));
                        if (match) {
                            UUID retId = it.getEtapa() != null ? it.getEtapa().getId() : it.getId();
                            sugestoes.add(new SugestaoEtapaResponse(
                                    retId,
                                    it.getCodigoEap() != null ? it.getCodigoEap() : "",
                                    it.getNome(),
                                    res.justificativa()));
                            break;
                        }
                    }
                }
            }

            if (sugestoes.isEmpty()) {
                mensagem = (respostaIa != null
                                && respostaIa.mensagem() != null
                                && !respostaIa.mensagem().isBlank())
                        ? respostaIa.mensagem()
                        : "A inteligência artificial analisou o cronograma e não conseguiu identificar etapas passíveis de adiantamento com segurança técnica para compensar este atraso.";
            } else {
                mensagem = (respostaIa != null
                                && respostaIa.mensagem() != null
                                && !respostaIa.mensagem().isBlank())
                        ? respostaIa.mensagem()
                        : "Etapas com potencial para adiantamento identificadas com sucesso.";
            }
        }

        UUID etapaIdRetorno = etapaAtrasadaItem.getEtapa() != null
                ? etapaAtrasadaItem.getEtapa().getId()
                : etapaAtrasadaItem.getId();

        return new ReprogramacaoSimplificadaResponse(
                etapaIdRetorno,
                etapaAtrasadaItem.getCodigoEap() != null ? etapaAtrasadaItem.getCodigoEap() : "",
                etapaAtrasadaItem.getNome(),
                request.motivo(),
                request.diasAtraso(),
                mensagem,
                sugestoes);
    }
}
