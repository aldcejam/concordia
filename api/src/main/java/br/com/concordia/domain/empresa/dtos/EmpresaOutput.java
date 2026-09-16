package br.com.concordia.domain.empresa.dtos;

import java.util.UUID;

public record EmpresaOutput(UUID id, String nome, String cnpj, String razaoSocial) {}
