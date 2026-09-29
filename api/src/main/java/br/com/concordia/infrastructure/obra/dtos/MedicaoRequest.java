package br.com.concordia.infrastructure.obra.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MedicaoRequest(
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal percentualExecutado,
        @NotNull @DecimalMin("0.00") BigDecimal quantidadeExecutada,
        String observacao,
        String motivoAtraso,
        @DecimalMin("0") Integer diasAtraso) {}
