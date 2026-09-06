package br.com.concordia.features.empresas.common;

import java.util.UUID;

public record EmpresaResponse(UUID id, String nome, String cnpj, String razaoSocial) {}
