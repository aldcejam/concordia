package br.com.concordia.domain.obra.dependencia;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.concordia.domain.obra.dependencia.GrafoDependencias.Aresta;
import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class GrafoDependenciasTest {
    private final UUID a = UUID.randomUUID();
    private final UUID b = UUID.randomUUID();
    private final UUID c = UUID.randomUUID();
    private final UUID d = UUID.randomUUID();

    @Test
    void detectaCicloIndiretoEDevolveOCaminho() {
        var grafo = new GrafoDependencias(List.of(new Aresta(a, b), new Aresta(b, c)));

        assertThat(grafo.cicloAoAdicionar(c, a)).contains(List.of(c, a, b, c));
    }

    @Test
    void detectaCicloDireto() {
        var grafo = new GrafoDependencias(List.of(new Aresta(a, b)));

        assertThat(grafo.cicloAoAdicionar(b, a)).contains(List.of(b, a, b));
    }

    @Test
    void aceitaVinculosParalelosSemCiclo() {
        var grafo = new GrafoDependencias(List.of(new Aresta(a, b), new Aresta(a, c), new Aresta(b, d)));

        assertThat(grafo.cicloAoAdicionar(c, d)).isEmpty();
        assertThat(grafo.cicloAoAdicionar(a, d)).isEmpty();
    }

    @Test
    void listaDescendentesDiretosEIndiretos() {
        var grafo = new GrafoDependencias(List.of(new Aresta(a, b), new Aresta(b, c), new Aresta(d, c)));

        assertThat(grafo.descendentes(a)).containsExactlyInAnyOrder(b, c);
        assertThat(grafo.descendentes(c)).isEmpty();
    }

    @Test
    void regraDeLiberacaoPorTipo() {
        assertThat(RegraLiberacao.satisfeita(TipoDependencia.FI, new BigDecimal("99.9")))
                .isFalse();
        assertThat(RegraLiberacao.satisfeita(TipoDependencia.FI, new BigDecimal("100")))
                .isTrue();
        assertThat(RegraLiberacao.satisfeita(TipoDependencia.II, BigDecimal.ZERO))
                .isFalse();
        assertThat(RegraLiberacao.satisfeita(TipoDependencia.II, BigDecimal.ONE))
                .isTrue();
        assertThat(RegraLiberacao.satisfeita(TipoDependencia.FF, null)).isTrue();
    }
}
