package br.com.concordia.infrastructure.obra.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SugestaoAtrasoRequest(
        @NotNull UUID etapaId,
        @NotBlank String motivo,
        @NotNull Integer diasAtraso) {}
