package br.com.concordia.domain.obra.dtos;

import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.UUID;

public record EtapaInput(
        String nome,
        String descricao,
        OffsetDateTime inicio,
        Integer prazoEsperadoDias,
        UUID idItemPai,
        Double posicao,
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
        BigDecimal valorTotalOrcado) {}
