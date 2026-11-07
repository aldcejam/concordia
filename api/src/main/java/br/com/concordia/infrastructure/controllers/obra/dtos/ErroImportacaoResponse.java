package br.com.concordia.infrastructure.controllers.obra.dtos;

import br.com.concordia.domain.obra.dtos.ErroImportacao;

public record ErroImportacaoResponse(Integer linha, String coluna, String mensagem) {
    public static ErroImportacaoResponse from(ErroImportacao erro) {
        return new ErroImportacaoResponse(erro.linha(), erro.coluna(), erro.mensagem());
    }
}
