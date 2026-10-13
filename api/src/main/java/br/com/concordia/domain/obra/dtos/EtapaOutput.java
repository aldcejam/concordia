package br.com.concordia.domain.obra.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EtapaOutput(
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
        List<MedicaoOutput> medicoes) {}
