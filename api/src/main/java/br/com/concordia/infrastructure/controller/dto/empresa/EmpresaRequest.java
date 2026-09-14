package br.com.concordia.infrastructure.controller.dto.empresa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmpresaRequest(
        @NotBlank String nome,

        @NotBlank
        @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$|^\\d{14}$", message = "O CNPJ deve ser valido")
        String cnpj,

        @NotBlank String razaoSocial) {}
