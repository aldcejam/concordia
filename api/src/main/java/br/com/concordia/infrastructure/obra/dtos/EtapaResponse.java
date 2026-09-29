package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.dtos.EtapaOutput;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EtapaResponse(
        UUID id,
        UUID idItemEap,
        UUID idItemPai,
        String nome,
        String descricao,
        Double posicao,
        OffsetDateTime inicio,
        OffsetDateTime fim,
        Integer prazoEsperadoDias,
        BigDecimal percentualExecutado,
        BigDecimal quantidadeExecutada,
        String motivoAtraso,
        Integer diasAtraso,
        String codigoEap,
        String bancoOrcamento,
        String codigoComposicao,
        String tipoComposicao,
        String macroetapa,
        String unidadeOrcamento,
        BigDecimal quantidadeOrcada,
        BigDecimal valorUnitarioOrcado,
        BigDecimal valorUnitarioBase,
        BigDecimal percentualBdi,
        BigDecimal valorTotalOrcado,
        List<MedicaoResponse> medicoes) {
    public static EtapaResponse from(EtapaOutput output) {
        return new EtapaResponse(
                output.id(),
                output.idItemEap(),
                output.idItemPai(),
                output.nome(),
                output.descricao(),
                output.posicao(),
                output.inicio(),
                output.fim(),
                output.prazoEsperadoDias(),
                output.percentualExecutado(),
                output.quantidadeExecutada(),
                output.motivoAtraso(),
                output.diasAtraso(),
                output.codigoEap(),
                output.bancoOrcamento(),
                output.codigoComposicao(),
                output.tipoComposicao(),
                output.macroetapa(),
                output.unidadeOrcamento(),
                output.quantidadeOrcada(),
                output.valorUnitarioOrcado(),
                output.valorUnitarioBase(),
                output.percentualBdi(),
                output.valorTotalOrcado(),
                output.medicoes().stream().map(MedicaoResponse::from).toList());
    }
}
