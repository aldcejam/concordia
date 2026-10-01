package br.com.concordia.infrastructure.obra.csv;

import br.com.concordia.domain.obra.dtos.ImportacaoObraInput;
import br.com.concordia.domain.obra.dtos.LinhaImportacao;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Lê a planilha de importação de obra em CSV separado por ponto e vírgula (padrão do Excel em pt-BR).
 *
 * <p>Cabeçalho esperado: {@code item;codigo;descricao;unidade;quantidade}. Linhas sem código são agrupamentos
 * da EAP (ex.: "1;;SERVIÇOS PRELIMINARES;;").
 */
@Component
public class ObraCsvParser {
    private static final char SEPARADOR = ';';
    private static final List<String> CABECALHO = List.of("item", "codigo", "descricao", "unidade", "quantidade");

    public ImportacaoObraInput ler(InputStream conteudo) {
        try (var reader = new BufferedReader(new InputStreamReader(conteudo, StandardCharsets.UTF_8))) {
            var cabecalho = reader.readLine();
            if (cabecalho == null) {
                throw new IllegalArgumentException("O arquivo CSV está vazio.");
            }
            validarCabecalho(dividir(removerBom(cabecalho)));

            List<LinhaImportacao> linhas = new ArrayList<>();
            String texto;
            int numeroLinha = 1;
            while ((texto = reader.readLine()) != null) {
                numeroLinha++;
                if (texto.isBlank()) {
                    continue;
                }
                linhas.add(converter(numeroLinha, dividir(texto)));
            }
            return new ImportacaoObraInput(linhas);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível ler o arquivo CSV.", e);
        }
    }

    private void validarCabecalho(List<String> colunas) {
        var normalizadas = colunas.stream().map(c -> c.trim().toLowerCase()).toList();
        if (!normalizadas.equals(CABECALHO)) {
            throw new IllegalArgumentException(
                    "Cabeçalho inválido. Esperado: %s".formatted(String.join(String.valueOf(SEPARADOR), CABECALHO)));
        }
    }

    private LinhaImportacao converter(int numeroLinha, List<String> colunas) {
        if (colunas.size() != CABECALHO.size()) {
            throw new IllegalArgumentException("Linha %d: esperadas %d colunas, encontradas %d."
                    .formatted(numeroLinha, CABECALHO.size(), colunas.size()));
        }

        var item = obrigatorio(numeroLinha, "item", colunas.get(0));
        var descricao = obrigatorio(numeroLinha, "descricao", colunas.get(2));
        var codigo = opcional(colunas.get(1));
        var unidade = opcional(colunas.get(3));
        var quantidade = decimal(numeroLinha, opcional(colunas.get(4)));

        if (codigo != null && (unidade == null || quantidade == null)) {
            throw new IllegalArgumentException(
                    "Linha %d: itens com código precisam de unidade e quantidade.".formatted(numeroLinha));
        }

        return new LinhaImportacao(numeroLinha, item, codigo, descricao, unidade, quantidade);
    }

    private static String obrigatorio(int numeroLinha, String coluna, String valor) {
        var limpo = opcional(valor);
        if (limpo == null) {
            throw new IllegalArgumentException("Linha %d: a coluna '%s' é obrigatória.".formatted(numeroLinha, coluna));
        }
        return limpo;
    }

    private static String opcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    /** Aceita "1.234,56" (pt-BR) e "1234.56". */
    private static BigDecimal decimal(int numeroLinha, String valor) {
        if (valor == null) {
            return null;
        }
        var normalizado = valor.contains(",") ? valor.replace(".", "").replace(',', '.') : valor;
        try {
            return new BigDecimal(normalizado);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Linha %d: quantidade '%s' não é um número válido.".formatted(numeroLinha, valor));
        }
    }

    private static String removerBom(String texto) {
        return texto.startsWith("﻿") ? texto.substring(1) : texto;
    }

    /** Divide a linha pelo separador, respeitando campos entre aspas ("" escapa uma aspa). */
    private static List<String> dividir(String linha) {
        List<String> campos = new ArrayList<>();
        var atual = new StringBuilder();
        boolean entreAspas = false;
        for (int i = 0; i < linha.length(); i++) {
            char c = linha.charAt(i);
            if (c == '"') {
                if (entreAspas && i + 1 < linha.length() && linha.charAt(i + 1) == '"') {
                    atual.append('"');
                    i++;
                } else {
                    entreAspas = !entreAspas;
                }
            } else if (c == SEPARADOR && !entreAspas) {
                campos.add(atual.toString());
                atual.setLength(0);
            } else {
                atual.append(c);
            }
        }
        campos.add(atual.toString());
        return campos;
    }
}
