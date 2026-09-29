package br.com.concordia.domain.obra.dtos;

import java.math.BigDecimal;

public record MedicaoInput(
        BigDecimal percentualExecutado,
        BigDecimal quantidadeExecutada,
        String observacao,
        String motivoAtraso,
        Integer diasAtraso) {}
