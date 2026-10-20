package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.importacao.ErroImportacao;

public record ErroImportacaoResponse(Integer linha, String coluna, String mensagem) {
    public static ErroImportacaoResponse from(ErroImportacao erro) {
        return new ErroImportacaoResponse(erro.linha(), erro.coluna(), erro.mensagem());
    }
}
