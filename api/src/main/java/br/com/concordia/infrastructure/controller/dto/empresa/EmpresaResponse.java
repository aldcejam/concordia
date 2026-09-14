package br.com.concordia.infrastructure.controller.dto.empresa;

import java.util.UUID;

public record EmpresaResponse(UUID id, String nome, String cnpj, String razaoSocial) {}
