package br.com.concordia.features.empresas.common;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Pattern;

public record EmpresaParcialRequest(
        @Nullable String nome,
        @Nullable @Pattern(regexp = "^[A-Z0-9]{12}\\d{2}$") String cnpj,
        @Nullable String razaoSocial) {}
