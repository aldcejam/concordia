package br.com.concordia.features.obras.common;

import java.util.UUID;

public record EmpresaDto(UUID id, String nome, String cnpj, String razaoSocial) {
}
