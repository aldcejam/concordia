package br.com.concordia.infrastructure.empresa.dtos;

import jakarta.validation.constraints.Pattern;

public record EmpresaParcialRequest(
        String nome,

        @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$|^\\d{14}$", message = "O CNPJ deve ser valido")
        String cnpj,

        String razaoSocial) {}
