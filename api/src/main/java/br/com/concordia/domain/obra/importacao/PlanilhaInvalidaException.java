package br.com.concordia.domain.obra.importacao;

import java.util.List;

/** A planilha possui erros que impedem a importação; {@code erros} compõe o relatório devolvido ao usuário. */
public class PlanilhaInvalidaException extends RuntimeException {
    private final List<ErroImportacao> erros;

    public PlanilhaInvalidaException(List<ErroImportacao> erros) {
        super("A planilha possui %d erro(s) que impedem a importação.".formatted(erros.size()));
        this.erros = List.copyOf(erros);
    }

    public List<ErroImportacao> getErros() {
        return erros;
    }
}
