package br.com.concordia.infrastructure.controllers.obra.dtos;

import br.com.concordia.domain.obra.dtos.ResultadoImportacao;
import java.util.UUID;

public record ImportacaoPlanilhaResponse(UUID idObra, String descricaoObra, ResumoImportacaoResponse resumo) {
    public static ImportacaoPlanilhaResponse from(ResultadoImportacao resultado) {
        return new ImportacaoPlanilhaResponse(
                resultado.idObra(), resultado.descricaoObra(), ResumoImportacaoResponse.from(resultado.resumo()));
    }
}
