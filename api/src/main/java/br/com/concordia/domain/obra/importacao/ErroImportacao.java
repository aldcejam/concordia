package br.com.concordia.domain.obra.importacao;

/** Problema encontrado ao ler ou validar a planilha. {@code linha} e {@code coluna} seguem a numeração do Excel. */
public record ErroImportacao(Integer linha, String coluna, String mensagem) {
    public static ErroImportacao geral(String mensagem) {
        return new ErroImportacao(null, null, mensagem);
    }

    public static ErroImportacao naLinha(int linha, String coluna, String mensagem) {
        return new ErroImportacao(linha, coluna, mensagem);
    }
}
