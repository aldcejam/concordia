package br.com.concordia.features.empresas.criarempresa;

import jakarta.validation.constraints.NotBlank;

public record CriarEmpresaRequest(@NotBlank String nome, @NotBlank String cnpj, @NotBlank String razaoSocial) {
}
