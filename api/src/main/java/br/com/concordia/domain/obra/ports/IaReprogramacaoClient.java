package br.com.concordia.domain.obra.ports;

import java.util.List;
import java.util.UUID;

/**
 * Porta de domínio para consulta a modelos de inteligência artificial
 * para reprogramação e adiantamento de etapas de cronograma.
 */
public interface IaReprogramacaoClient {

    record EtapaCandidata(UUID id, String codigoEap, String nome) {}

    record SugestaoIaResultado(UUID etapaId, String justificativa) {}

    record RespostaIa(String mensagem, List<SugestaoIaResultado> sugestoes, boolean disponivel) {
        public RespostaIa(String mensagem, List<SugestaoIaResultado> sugestoes) {
            this(mensagem, sugestoes, true);
        }

        public static RespostaIa indisponivel(String mensagem) {
            return new RespostaIa(mensagem, List.of(), false);
        }
    }

    RespostaIa sugerirAdiantamento(
            EtapaCandidata etapaAtrasada, String motivo, int diasAtraso, List<EtapaCandidata> outrasEtapas);
}
