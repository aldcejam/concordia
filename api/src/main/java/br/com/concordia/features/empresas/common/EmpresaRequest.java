package br.com.concordia.features.empresas.common;

import jakarta.validation.constraints.NotBlank;

public record EmpresaRequest(
        @NotBlank String nome,
        @NotBlank String cnpj,
        @NotBlank String razaoSocial) {}
