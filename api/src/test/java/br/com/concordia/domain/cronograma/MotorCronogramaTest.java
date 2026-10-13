package br.com.concordia.domain.cronograma;

import static br.com.concordia.domain.cronograma.CronogramaDados.*;
import static org.assertj.core.api.Assertions.*;

import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;

class MotorCronogramaTest {
    private final OffsetDateTime agora = OffsetDateTime.parse("2026-10-12T09:00:00-03:00");
    private final ZoneId fuso = ZoneId.of("America/Fortaleza");

    private Etapa etapa(String nome, int ordem, int inicio, int duracao, Etapa... pais) {
        var data = agora.plusDays(inicio);
        return new Etapa(
                UUID.randomUUID(),
                nome,
                ordem,
                StatusEtapa.NAO_INICIADA,
                data,
                data.plusDays(duracao),
                duracao,
                data,
                data.plusDays(duracao),
                null,
                null,
                Arrays.stream(pais).map(Etapa::id).toList());
    }

    private Etapa buscar(Snapshot s, Etapa e) {
        return s.etapas().stream()
                .filter(x -> x.id().equals(e.id()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void aplicaOrdemEscolhidaEPropagaAtrasoTransitivoSemCriarDependencias() {
        var b = etapa("B", 0, 0, 2);
        var c = etapa("C", 1, 2, 3, b);
        var d = etapa("D", 2, 5, 1, c);
        var e = etapa("E", 3, 10, 2);
        var f = etapa("F", 4, 12, 1);
        var antes = new Snapshot(4, List.of(b, c, d, e, f));
        var simulacao = MotorCronograma.simular(antes, b.id(), 3, agora, List.of(f.id(), e.id()), fuso);
        assertThat(simulacao.depois().etapas()).extracting(Etapa::descricao).containsExactly("B", "F", "E", "C", "D");
        assertThat(buscar(simulacao.depois(), b).fim()).isEqualTo(agora.plusDays(5));
        assertThat(buscar(simulacao.depois(), c).inicio()).isEqualTo(agora.plusDays(5));
        assertThat(buscar(simulacao.depois(), d).inicio()).isEqualTo(agora.plusDays(8));
        assertThat(buscar(simulacao.depois(), f).inicio()).isEqualTo(agora);
        assertThat(buscar(simulacao.depois(), e).inicio()).isEqualTo(agora);
        assertThat(buscar(simulacao.depois(), e).predecessores()).isEmpty();
        assertThat(buscar(simulacao.depois(), e).inicioOriginal()).isEqualTo(e.inicio());
        assertThat(antes.etapas()).containsExactly(b, c, d, e, f);
    }

    @Test
    void rejeitaDependentesDuplicatasEEtapasQueJaDeveriamTerComecado() {
        var b = etapa("B", 0, 0, 2);
        var c = etapa("C", 1, 2, 1, b);
        var e = etapa("E", 2, 3, 1);
        var vencida = etapa("Vencida", 3, -1, 1);
        var snapshot = new Snapshot(0, List.of(b, c, e, vencida));
        assertThat(MotorCronograma.candidatas(snapshot, b.id(), agora)).containsExactly(e.id());
        for (var ids :
                List.of(List.of(c.id()), List.of(e.id(), e.id()), List.of(vencida.id()), List.of(UUID.randomUUID()))) {
            assertThatThrownBy(() -> MotorCronograma.simular(snapshot, b.id(), 1, agora, ids, fuso))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void preservaDatasReaisEConsideraTerminoRealDaPredecessora() {
        var p = etapa("Concluída", 0, -10, 2);
        var concluida = new Etapa(
                p.id(),
                p.descricao(),
                0,
                StatusEtapa.CONCLUIDA,
                p.inicio(),
                p.fim(),
                2,
                p.inicioOriginal(),
                p.fimOriginal(),
                agora.minusDays(9),
                agora.minusDays(1),
                List.of());
        var b = etapa("Atrasada", 1, 0, 2);
        var e = etapa("Elegível", 2, 4, 1, concluida);
        var s = MotorCronograma.simular(
                new Snapshot(0, List.of(concluida, b, e)), b.id(), 2, agora, List.of(e.id()), fuso);
        assertThat(buscar(s.depois(), concluida)).isEqualTo(concluida);
        assertThat(buscar(s.depois(), e).inicio()).isEqualTo(agora);
    }

    @Test
    void naoReduzDuracaoEstendidaEmUmaReprogramacaoPosterior() {
        var b = etapa("B", 0, 0, 2);
        var c = etapa("C", 1, 5, 1);
        var primeira = MotorCronograma.simular(new Snapshot(0, List.of(b, c)), b.id(), 3, agora, List.of(), fuso);
        var segunda = MotorCronograma.simular(primeira.depois(), c.id(), 1, agora, List.of(), fuso);
        assertThat(buscar(segunda.depois(), b).fim()).isEqualTo(agora.plusDays(5));
    }

    @Test
    void identificaCiclosEProcessaGrafosLongosSemRecursao() {
        var a = etapa("A", 0, 0, 1);
        var b = etapa("B", 1, 1, 1, a);
        var ciclo = new Etapa(
                a.id(),
                a.descricao(),
                0,
                a.status(),
                a.inicio(),
                a.fim(),
                1,
                a.inicioOriginal(),
                a.fimOriginal(),
                null,
                null,
                List.of(b.id()));
        assertThatThrownBy(() -> MotorCronograma.validarGrafo(new Snapshot(0, List.of(ciclo, b))))
                .hasMessageContaining("ciclo");
        var lista = new ArrayList<Etapa>();
        lista.add(a);
        for (int i = 1; i < 5000; i++) lista.add(etapa("E" + i, i, i, 1, lista.get(i - 1)));
        assertThat(MotorCronograma.simular(new Snapshot(0, lista), a.id(), 2, agora, List.of(), fuso)
                        .depois()
                        .etapas()
                        .getLast()
                        .fim())
                .isEqualTo(agora.plusDays(5002));
    }

    @Test
    void respeitaDiasDeCalendarioAoCruzarHorarioDeVerao() {
        var inicio = OffsetDateTime.parse("2026-03-07T09:00:00-05:00");
        var b = new Etapa(
                UUID.randomUUID(),
                "B",
                0,
                StatusEtapa.NAO_INICIADA,
                inicio,
                OffsetDateTime.parse("2026-03-08T09:00:00-04:00"),
                1,
                inicio,
                OffsetDateTime.parse("2026-03-08T09:00:00-04:00"),
                null,
                null,
                List.of());
        var s = MotorCronograma.simular(
                new Snapshot(0, List.of(b)), b.id(), 1, inicio, List.of(), ZoneId.of("America/New_York"));
        assertThat(s.depois().etapas().getFirst().fim()).isEqualTo(OffsetDateTime.parse("2026-03-09T09:00:00-04:00"));
    }
}
