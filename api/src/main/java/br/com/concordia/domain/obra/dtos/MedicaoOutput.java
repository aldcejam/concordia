package br.com.concordia.domain.obra.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicaoOutput(
        UUID id,
        BigDecimal percentualExecutado,
        BigDecimal quantidadeExecutada,
        String observacao,
        String motivoAtraso,
        Integer diasAtraso,
        OffsetDateTime registradaEm) {}
