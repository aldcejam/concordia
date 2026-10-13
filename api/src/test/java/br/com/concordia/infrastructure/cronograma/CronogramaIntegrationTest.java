package br.com.concordia.infrastructure.cronograma;

import static br.com.concordia.domain.cronograma.CronogramaDados.*;
import static org.assertj.core.api.Assertions.*;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.cronograma.*;
import br.com.concordia.domain.obra.ObraService;
import br.com.concordia.domain.obra.dtos.ObraInput;
import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "spring.profiles.active=test",
            "spring.datasource.url=jdbc:h2:mem:cronograma;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
            "spring.datasource.username=sa",
            "spring.datasource.password=",
            "spring.jpa.hibernate.ddl-auto=create-drop",
            "spring.jpa.open-in-view=false"
        })
class CronogramaIntegrationTest {
    private static final OffsetDateTime AGORA = OffsetDateTime.parse("2026-10-12T09:00:00-03:00");

    @Autowired
    ObraService obras;

    @Autowired
    CronogramaService cronogramas;

    @Autowired
    AnaliseAtrasoService analises;

    @Autowired
    FakeIa ia;

    @Autowired
    CronogramaSerializer json;

    @Autowired
    JdbcTemplate jdbc;

    @LocalServerPort
    int port;

    private UUID obraId;

    @TestConfiguration
    static class Config {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(AGORA.toInstant(), ZoneId.of("America/Fortaleza"));
        }

        @Bean
        @Primary
        FakeIa fakeIa() {
            return new FakeIa();
        }
    }

    static class FakeIa implements RecomendacaoIa {
        int modo;
        Runnable durante = () -> {};
        Contexto recebido;

        public List<Sugestao> recomendar(Contexto contexto) {
            recebido = contexto;
            durante.run();
            if (modo == 1) throw new FalhaAnaliseException("IA indisponível");
            if (modo == 2) return List.of(new Sugestao(UUID.randomUUID(), "ID inexistente"));
            return contexto.candidatasElegiveis().stream()
                    .map(id -> new Sugestao(id, "Frente independente, confirmar equipe."))
                    .toList();
        }
    }

    @BeforeEach
    void preparar() {
        ia.modo = 0;
        ia.durante = () -> {};
        ia.recebido = null;
        obraId = obras.criar(new ObraInput("Obra de teste", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null))
                .id();
    }

    private Etapa etapa(String nome, int inicio, int dias, UUID... pais) {
        var e = cronogramas.criarEtapa(obraId, nome, AGORA.plusDays(inicio), dias, List.of(pais));
        assertThat(e.id()).isNotNull();
        return e;
    }

    private Etapa buscar(UUID id) {
        return cronogramas.consultar(obraId).cronograma().etapas().stream()
                .filter(e -> e.id().equals(id))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void exibeEtapasLegadasSemInventarPlanejamentoEBloqueiaReprogramacao() {
        var e = etapa("Etapa importada", 0, 2);
        jdbc.update(
                "UPDATE etapa_obra SET inicio = NULL, fim = NULL, prazo_esperado_dias = NULL, "
                        + "inicio_original = NULL, fim_original = NULL WHERE id = ?",
                e.id());
        var legada = buscar(e.id());
        assertThat(legada.inicio()).isNull();
        assertThat(legada.fim()).isNull();
        assertThat(legada.duracaoDias()).isNull();
        var atraso = cronogramas.registrarAtraso(obraId, e.id(), "Chuva", 1);
        assertThat(atraso.status()).isEqualTo("REGISTRADO");
        assertThatThrownBy(() -> analises.analisar(obraId, atraso.id()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("datas e duração");
        etapa("Nova etapa planejada", 1, 2);
        assertThat(buscar(e.id()).inicioOriginal()).isNull();
    }

    @Test
    void persisteSimulacaoAplicacaoHistoricoEIdempotencia() {
        var b = etapa("B", 0, 2);
        var c = etapa("C", 2, 3, b.id());
        var e = etapa("E", 10, 2);
        var f = etapa("F", 12, 1);
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Material atrasado", 3);
        var analisado = analises.analisar(obraId, atraso.id());
        assertThat(analisado.status()).isEqualTo("PRONTO");
        assertThat(ia.recebido.cronograma().etapas()).hasSize(4);
        assertThat(ia.recebido.candidatasElegiveis()).containsExactly(e.id(), f.id());
        var ids = List.of(f.id(), e.id());
        var previa = cronogramas.simular(obraId, atraso.id(), ids);
        assertThat(buscar(e.id()).inicio()).isEqualTo(e.inicio());
        var aplicado = cronogramas.aplicar(obraId, atraso.id(), ids);
        assertThat(aplicado.aplicadoEm()).isEqualTo(AGORA);
        assertThat(aplicado.autorAplicacao()).isEqualTo("anonimo");
        assertThat(aplicado.resultado()).isEqualTo(previa);
        assertThat(cronogramas.consultar(obraId).cronograma().etapas())
                .extracting(Etapa::descricao)
                .containsExactly("B", "F", "E", "C");
        assertThat(buscar(c.id()).inicio()).isEqualTo(AGORA.plusDays(5));
        assertThat(buscar(e.id()).inicio()).isEqualTo(AGORA);
        assertThat(buscar(e.id()).inicioOriginal()).isEqualTo(e.inicio());
        assertThat(buscar(e.id()).predecessores()).isEmpty();
        var versao = cronogramas.consultar(obraId).cronograma().versao();
        assertThat(cronogramas.aplicar(obraId, atraso.id(), ids)).isEqualTo(aplicado);
        assertThat(cronogramas.consultar(obraId).cronograma().versao()).isEqualTo(versao);
        assertThatThrownBy(() -> cronogramas.aplicar(obraId, atraso.id(), List.of(e.id())))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    void preservaApontamentoAoFalharIaEPermiteNovaAnalise() {
        var b = etapa("B", 0, 2);
        etapa("E", 10, 2);
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 2);
        ia.modo = 1;
        assertThat(analises.analisar(obraId, atraso.id()).status()).isEqualTo("FALHOU");
        assertThat(cronogramas.consultar(obraId).atrasos()).hasSize(1);
        assertThat(buscar(b.id()).fim()).isEqualTo(b.fim());
        ia.modo = 0;
        assertThat(analises.analisar(obraId, atraso.id()).status()).isEqualTo("PRONTO");
    }

    @Test
    void rejeitaRespostaComIdInexistenteENaoMudaCronograma() {
        var b = etapa("B", 0, 2);
        etapa("E", 10, 2);
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 2);
        ia.modo = 2;
        assertThat(analises.analisar(obraId, atraso.id()).status()).isEqualTo("FALHOU");
        assertThat(buscar(b.id()).fim()).isEqualTo(b.fim());
    }

    @Test
    void bloqueiaAplicacaoQuandoCronogramaMudaEAceitaReanalise() {
        var b = etapa("B", 0, 2);
        var e = etapa("E", 10, 2);
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 2);
        analises.analisar(obraId, atraso.id());
        etapa("Nova", 20, 1);
        assertThatThrownBy(() -> cronogramas.aplicar(obraId, atraso.id(), List.of(e.id())))
                .isInstanceOf(ConflitoException.class);
        assertThat(analises.analisar(obraId, atraso.id()).status()).isEqualTo("PRONTO");
    }

    @Test
    void detectaAlteracaoDuranteChamadaExterna() {
        var b = etapa("B", 0, 2);
        etapa("E", 10, 2);
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 2);
        ia.durante = () -> etapa("Nova", 20, 1);
        assertThat(analises.analisar(obraId, atraso.id()).erro()).contains("mudou durante");
    }

    @Test
    void semCandidatasAplicaSomenteDatasSemChamarIa() {
        var b = etapa("B", 0, 2);
        var c = etapa("C", 2, 1, b.id());
        var atraso = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 2);
        assertThat(analises.analisar(obraId, atraso.id()).sugestoes()).isEmpty();
        assertThat(ia.recebido).isNull();
        cronogramas.aplicar(obraId, atraso.id(), List.of());
        assertThat(buscar(c.id()).inicio()).isEqualTo(AGORA.plusDays(4));
    }

    @Test
    void validaExecucaoRealEImpedeReprogramarEtapaConcluida() {
        var p = etapa("Predecessora", -4, 1);
        var b = etapa("B", 0, 2, p.id());
        assertThatThrownBy(() -> cronogramas.registrarExecucao(obraId, b.id(), StatusEtapa.EM_ANDAMENTO, AGORA, null))
                .isInstanceOf(IllegalArgumentException.class);
        cronogramas.registrarExecucao(obraId, p.id(), StatusEtapa.CONCLUIDA, AGORA.minusDays(4), AGORA.minusDays(3));
        cronogramas.registrarExecucao(obraId, b.id(), StatusEtapa.EM_ANDAMENTO, AGORA, null);
        assertThat(buscar(b.id()).inicioReal()).isEqualTo(AGORA);
        assertThatThrownBy(() -> cronogramas.registrarAtraso(obraId, p.id(), "Inválido", 1))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private HttpResponse<String> post(String path, Object body) throws Exception {
        var builder = HttpRequest.newBuilder(
                        URI.create("http://127.0.0.1:" + port + "/api/obras/" + obraId + "/cronograma" + path))
                .header("Content-Type", "application/json");
        return HttpClient.newHttpClient()
                .send(
                        builder.POST(HttpRequest.BodyPublishers.ofString(json.escrever(body)))
                                .build(),
                        HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> requestObra(String method, String path, Object body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/obras/" + obraId + path))
                .header("Content-Type", "application/json")
                .method(
                        method,
                        body == null
                                ? HttpRequest.BodyPublishers.noBody()
                                : HttpRequest.BodyPublishers.ofString(json.escrever(body)))
                .build();
        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void preservaCadastroSemDatasListagemEMedicoesUsadosPelaTelaDaMain() throws Exception {
        var cadastro = requestObra(
                "POST",
                "/etapas",
                Map.of(
                        "nome",
                        "Etapa da EAP",
                        "descricao",
                        "Etapa da EAP",
                        "posicao",
                        1000,
                        "codigoEap",
                        "1.1",
                        "macroetapa",
                        "Fundação",
                        "quantidadeOrcada",
                        8));
        assertThat(cadastro.statusCode()).isEqualTo(201);
        var etapa = json.ler(cadastro.body(), br.com.concordia.infrastructure.obra.dtos.EtapaResponse.class);
        assertThat(etapa.id()).isNotNull();
        assertThat(etapa.inicio()).isNull();
        assertThat(etapa.prazoEsperadoDias()).isNull();
        var listagem = requestObra("GET", "/etapas", null);
        assertThat(listagem.statusCode()).isEqualTo(200);
        assertThat(json.ler(listagem.body(), br.com.concordia.infrastructure.obra.dtos.EtapaResponse[].class))
                .extracting(br.com.concordia.infrastructure.obra.dtos.EtapaResponse::id)
                .containsExactly(etapa.id());
        var versao = cronogramas.consultar(obraId).cronograma().versao();
        var medicao = requestObra(
                "POST",
                "/etapas/" + etapa.id() + "/medicoes",
                Map.of("percentualExecutado", 25, "quantidadeExecutada", 2));
        assertThat(medicao.statusCode()).isEqualTo(200);
        var medida = json.ler(medicao.body(), br.com.concordia.infrastructure.obra.dtos.EtapaResponse.class);
        assertThat(medida.percentualExecutado()).isEqualByComparingTo("25");
        assertThat(cronogramas.consultar(obraId).cronograma().versao()).isGreaterThan(versao);
        assertThat(buscar(etapa.id()).inicio()).isNull();

        var registroAtraso =
                post("/atrasos", Map.of("etapaId", etapa.id(), "motivo", "Atraso no fornecedor", "diasAtraso", 3));
        assertThat(registroAtraso.statusCode()).isEqualTo(201);
        var atraso = json.ler(registroAtraso.body(), Atraso.class);
        assertThat(atraso.status()).isEqualTo("REGISTRADO");
        assertThat(atraso.motivo()).isEqualTo("Atraso no fornecedor");
        assertThat(atraso.diasAtraso()).isEqualTo(3);

        var analise = post("/atrasos/" + atraso.id() + "/analise", Map.of());
        assertThat(analise.statusCode()).isEqualTo(400);
        assertThat(analise.body()).contains("Todas as etapas precisam de datas e duração");
    }

    @Test
    void executaFluxoPelosEndpointsHttpEValidaCorpos() throws Exception {
        var response = post(
                "/etapas",
                Map.of("descricao", "Atrasada", "inicio", AGORA, "duracaoDias", 2, "predecessores", List.of()));
        assertThat(response.statusCode()).isEqualTo(201);
        var b = json.ler(response.body(), Etapa.class);
        var e = etapa("Elegível", 10, 1);
        var registro = post("/atrasos", Map.of("etapaId", b.id(), "motivo", "Chuva", "diasAtraso", 2));
        assertThat(registro.statusCode()).isEqualTo(201);
        var atraso = json.ler(registro.body(), Atraso.class);
        var analise = post("/atrasos/" + atraso.id() + "/analise", Map.of());
        assertThat(analise.statusCode()).isEqualTo(200);
        assertThat(json.ler(analise.body(), Atraso.class).sugestoes())
                .extracting(Sugestao::etapaId)
                .containsExactly(e.id());
        var path = "/atrasos/" + atraso.id();
        var request = Map.of("etapaIds", List.of(e.id()));
        assertThat(post(path + "/simulacao", request).statusCode()).isEqualTo(200);
        assertThat(buscar(e.id()).inicio()).isEqualTo(e.inicio());
        assertThat(post(path + "/aplicacao", request).statusCode()).isEqualTo(200);
        assertThat(buscar(e.id()).inicio()).isEqualTo(AGORA);
        assertThat(post("/atrasos", Map.of("etapaId", b.id(), "motivo", "", "diasAtraso", 0))
                        .statusCode())
                .isEqualTo(400);
    }

    @Test
    void conflitoDeVersaoRetornaHttp409() throws Exception {
        var b = etapa("B", 0, 2);
        var e = etapa("E", 10, 1);
        var a = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 1);
        analises.analisar(obraId, a.id());
        etapa("Outra", 20, 1);
        var response = post("/atrasos/" + a.id() + "/aplicacao", Map.of("etapaIds", List.of(e.id())));
        assertThat(response.statusCode()).isEqualTo(409);
        assertThat(response.body()).contains("Gere novas sugestões");
    }

    @Test
    void confirmacoesSimultaneasAplicamUmaUnicaReprogramacao() throws Exception {
        var b = etapa("B", 0, 2);
        var e = etapa("E", 10, 1);
        var a = cronogramas.registrarAtraso(obraId, b.id(), "Chuva", 1);
        analises.analisar(obraId, a.id());
        var versao = cronogramas.consultar(obraId).cronograma().versao();
        var iniciar = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Atraso> confirmar = () -> {
                iniciar.await();
                return cronogramas.aplicar(obraId, a.id(), List.of(e.id()));
            };
            var primeira = executor.submit(confirmar);
            var segunda = executor.submit(confirmar);
            iniciar.countDown();
            assertThat(primeira.get(10, TimeUnit.SECONDS)).isEqualTo(segunda.get(10, TimeUnit.SECONDS));
        }
        assertThat(cronogramas.consultar(obraId).cronograma().versao()).isEqualTo(versao + 1);
        assertThat(buscar(b.id()).fim()).isEqualTo(b.fim().plusDays(1));
    }
}
