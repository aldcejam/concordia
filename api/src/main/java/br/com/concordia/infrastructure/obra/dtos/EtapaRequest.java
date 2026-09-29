package br.com.concordia.infrastructure.obra.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.UUID;

public record EtapaRequest(
        @NotBlank String nome,
        @NotBlank String descricao,
        OffsetDateTime inicio,
        @Positive Integer prazoEsperadoDias,
        UUID idItemPai,
        @PositiveOrZero Double posicao,
        String codigoEap,
        String bancoOrcamento,
        String codigoComposicao,
        String tipoComposicao,
        String macroetapa,
        String unidadeOrcamento,
        @PositiveOrZero BigDecimal quantidadeOrcada,
        @PositiveOrZero BigDecimal valorUnitarioOrcado,
        @PositiveOrZero BigDecimal valorUnitarioBase,
        @PositiveOrZero BigDecimal percentualBdi,
        @PositiveOrZero BigDecimal valorTotalOrcado) {}
