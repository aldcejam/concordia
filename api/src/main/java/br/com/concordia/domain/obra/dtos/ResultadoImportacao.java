package br.com.concordia.domain.obra.dtos;

import java.util.UUID;

public record ResultadoImportacao(UUID idObra, String descricaoObra, ResumoImportacao resumo) {}
