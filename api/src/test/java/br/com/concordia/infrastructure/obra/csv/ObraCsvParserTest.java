package br.com.concordia.infrastructure.obra.csv;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.concordia.domain.obra.dtos.ImportacaoObraInput;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class ObraCsvParserTest {
    private final ObraCsvParser parser = new ObraCsvParser();

    private ImportacaoObraInput ler(String csv) {
        return parser.ler(new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void leAgrupamentosEItensComAspasEDecimalBrasileiro() {
        var input = ler("""
                ﻿item;codigo;descricao;unidade;quantidade
                1;;SERVIÇOS PRELIMINARES;;

                 1.1 ;103689;"PLACA; CHAPA ""GALVANIZADA\""";M2;1.234,50
                1.2;SERV01;PLACA DE LICENCIAMENTO;M2;0.96
                """);

        assertThat(input.linhas()).hasSize(3);

        var agrupamento = input.linhas().get(0);
        assertThat(agrupamento.isAgrupamento()).isTrue();
        assertThat(agrupamento.item()).isEqualTo("1");
        assertThat(agrupamento.quantidade()).isNull();

        var item = input.linhas().get(1);
        assertThat(item.numeroLinha()).isEqualTo(4);
        assertThat(item.item()).isEqualTo("1.1");
        assertThat(item.codigo()).isEqualTo("103689");
        assertThat(item.descricao()).isEqualTo("PLACA; CHAPA \"GALVANIZADA\"");
        assertThat(item.quantidade()).isEqualByComparingTo(new BigDecimal("1234.50"));

        assertThat(input.linhas().get(2).quantidade()).isEqualByComparingTo(new BigDecimal("0.96"));
    }

    @Test
    void rejeitaCabecalhoInvalido() {
        assertThatThrownBy(() -> ler("item;descricao\n1;X\n"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cabeçalho inválido");
    }

    @Test
    void rejeitaArquivoVazio() {
        assertThatThrownBy(() -> ler("")).hasMessageContaining("vazio");
    }

    @Test
    void rejeitaQuantidadeInvalida() {
        assertThatThrownBy(() -> ler("item;codigo;descricao;unidade;quantidade\n1;123;X;M2;abc\n"))
                .hasMessage("Linha 2: quantidade 'abc' não é um número válido.");
    }

    @Test
    void rejeitaItemComCodigoSemQuantidade() {
        assertThatThrownBy(() -> ler("item;codigo;descricao;unidade;quantidade\n1;123;X;M2;\n"))
                .hasMessageContaining("Linha 2: itens com código precisam de unidade e quantidade");
    }

    @Test
    void rejeitaNumeroErradoDeColunas() {
        assertThatThrownBy(() -> ler("item;codigo;descricao;unidade;quantidade\n1;;X\n"))
                .hasMessageContaining("esperadas 5 colunas, encontradas 3");
    }
}
