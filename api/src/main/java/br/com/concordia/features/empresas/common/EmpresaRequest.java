package br.com.concordia.features.empresas.common;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record EmpresaRequest(
        @NotBlank String nome,
        @Pattern(regexp = "^[A-Z0-9]{12}\\d{2}$") @NotNull String cnpj,
        @NotBlank String razaoSocial) {}
