package br.com.concordia.infrastructure.controller.dto.obra;

import java.util.UUID;

public record EmpresaDto(UUID id, String nome, String cnpj, String razaoSocial) {}
