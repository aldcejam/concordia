package br.com.concordia.domain.obra.importacao;

import java.util.UUID;

public record ResultadoImportacao(UUID idObra, String descricaoObra, ResumoImportacao resumo) {}
