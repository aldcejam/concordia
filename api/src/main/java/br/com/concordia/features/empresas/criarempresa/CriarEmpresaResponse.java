package br.com.concordia.features.empresas.criarempresa;

import java.util.UUID;

public record CriarEmpresaResponse(UUID id, String nome, String cnpj, String razaoSocial ) {
}
