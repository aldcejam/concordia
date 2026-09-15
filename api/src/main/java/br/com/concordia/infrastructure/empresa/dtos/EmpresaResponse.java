package br.com.concordia.infrastructure.empresa.dtos;

import java.util.UUID;

public record EmpresaResponse(UUID id, String nome, String cnpj, String razaoSocial) {}
