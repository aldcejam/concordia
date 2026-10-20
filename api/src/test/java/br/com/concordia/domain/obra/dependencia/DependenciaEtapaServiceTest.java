package br.com.concordia.domain.obra.dependencia;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.obra.ObraMapper;
import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.ObraService;
import br.com.concordia.domain.obra.dtos.EtapaOutput;
import br.com.concordia.domain.obra.dtos.MedicaoInput;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.domain.obra.enums.TipoDependencia;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

class DependenciaEtapaServiceTest {
    private static final UUID ID_OBRA = UUID.randomUUID();

    private Obra obra;
    private EtapaObra fundacao;
    private EtapaObra estrutura;
    private EtapaObra alvenaria;
    private EtapaObra drenagem;
    private final List<DependenciaEtapa> dependencias = new ArrayList<>();
    private DependenciaEtapaService service;
    private ObraService obraService;

    @BeforeEach
    void setUp() {
        obra = new Obra("Obra teste", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);
        ReflectionTestUtils.setField(obra, "id", ID_OBRA);
        fundacao = etapa("2.1", "FUNDAÇÃO", 1000.0);
        estrutura = etapa("3.1", "SUPERESTRUTURA", 2000.0);
        alvenaria = etapa("4.1", "ALVENARIA", 3000.0);
        drenagem = etapa("5.1", "DRENAGEM EXTERNA", 4000.0);

        var obraRepository = new ObraRepositoryFake();
        var dependenciaRepository = new DependenciaRepositoryFake();
        service = new DependenciaEtapaService(obraRepository, dependenciaRepository);
        obraService = new ObraService(
                obraRepository,
                Mockito.mock(EmpresaRepository.class),
                Mockito.mock(ObraMapper.class),
                dependenciaRepository);
    }

    private EtapaObra etapa(String codigo, String nome, double posicao) {
        var etapa = new EtapaObra(nome, null, null);
        ReflectionTestUtils.setField(etapa, "id", UUID.randomUUID());
        var item = new ItemEap(obra, nome, posicao, etapa);
        item.atualizarDadosOrcamento(
                nome, codigo, "SINAPI", "1", null, "MACRO", "m²", BigDecimal.ONE, null, null, null, BigDecimal.TEN);
        obra.adicionarEtapa(etapa);
        obra.adicionarItemEap(item);
        return etapa;
    }

    private DependenciaOutput vincular(EtapaObra predecessora, EtapaObra sucessora, TipoDependencia tipo) {
        return service.criar(ID_OBRA, new DependenciaInput(predecessora.getId(), sucessora.getId(), tipo, null, null));
    }

    private EtapaOutput etapaListada(EtapaObra etapa) {
        return obraService.listarEtapas(ID_OBRA).stream()
                .filter(output -> output.id().equals(etapa.getId()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void criaVinculoComPadroesFimInicioObrigatorio() {
        var criada = vincular(fundacao, estrutura, null);

        assertThat(criada.tipo()).isEqualTo(TipoDependencia.FI);
        assertThat(criada.desfasamentoDias()).isZero();
        assertThat(criada.obrigatoria()).isTrue();
        assertThat(criada.satisfeita()).isFalse();
        assertThat(criada.predecessora().codigoEap()).isEqualTo("2.1");
        assertThat(service.listar(ID_OBRA)).hasSize(1);
    }

    @Test
    void recusaCicloInformandoOCaminho() {
        vincular(fundacao, estrutura, TipoDependencia.FI);
        vincular(estrutura, alvenaria, TipoDependencia.FI);

        assertThatThrownBy(() -> vincular(alvenaria, fundacao, TipoDependencia.II))
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("ciclo na EAP (4.1 → 2.1 → 3.1 → 4.1)");
        assertThat(dependencias).hasSize(2);
    }

    @Test
    void recusaVinculoDuplicadoEAutoDependencia() {
        vincular(fundacao, estrutura, TipoDependencia.FI);

        assertThatThrownBy(() -> vincular(fundacao, estrutura, TipoDependencia.II))
                .isInstanceOf(ConflitoException.class)
                .hasMessage("Já existe um vínculo em que 3.1 depende de 2.1.");
        assertThatThrownBy(() -> vincular(fundacao, fundacao, TipoDependencia.FI))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void recusaEtapaDeOutraObra() {
        var input = new DependenciaInput(fundacao.getId(), UUID.randomUUID(), TipoDependencia.FI, 0, true);

        assertThatThrownBy(() -> service.criar(ID_OBRA, input)).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void recusaDesfasamentoForaDoLimite() {
        var input = new DependenciaInput(fundacao.getId(), estrutura.getId(), TipoDependencia.FI, 400, true);

        assertThatThrownBy(() -> service.criar(ID_OBRA, input)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void atualizaERemoveVinculo() {
        var criada = vincular(fundacao, estrutura, TipoDependencia.FI);

        var atualizada = service.atualizar(
                ID_OBRA, criada.id(), new DependenciaInput(null, null, TipoDependencia.II, -2, false));
        assertThat(atualizada.tipo()).isEqualTo(TipoDependencia.II);
        assertThat(atualizada.desfasamentoDias()).isEqualTo(-2);
        assertThat(atualizada.obrigatoria()).isFalse();

        service.remover(ID_OBRA, criada.id());
        assertThat(service.listar(ID_OBRA)).isEmpty();
    }

    @Test
    void bloqueiaSucessoraAteAPredecessoraConcluir() {
        vincular(fundacao, estrutura, TipoDependencia.FI);

        var bloqueada = etapaListada(estrutura);
        assertThat(bloqueada.bloqueada()).isTrue();
        assertThat(bloqueada.predecessoras()).singleElement().satisfies(v -> {
            assertThat(v.codigoEap()).isEqualTo("2.1");
            assertThat(v.satisfeita()).isFalse();
        });
        assertThat(etapaListada(fundacao).sucessoras()).hasSize(1);
        assertThat(etapaListada(drenagem).bloqueada()).isFalse();

        fundacao.registrarMedicao(new BigDecimal("100"), BigDecimal.ONE, null, null, null);
        assertThat(etapaListada(estrutura).bloqueada()).isFalse();
    }

    @Test
    void inicioInicioLiberaQuandoAPredecessoraComeca() {
        vincular(alvenaria, drenagem, TipoDependencia.II);
        assertThat(etapaListada(drenagem).bloqueada()).isTrue();

        alvenaria.registrarMedicao(new BigDecimal("10"), BigDecimal.ONE, null, null, null);
        assertThat(etapaListada(drenagem).bloqueada()).isFalse();
    }

    @Test
    void vinculoNaoObrigatorioNaoBloqueia() {
        var criada = vincular(fundacao, estrutura, TipoDependencia.FI);
        service.atualizar(ID_OBRA, criada.id(), new DependenciaInput(null, null, null, null, false));

        assertThat(etapaListada(estrutura).bloqueada()).isFalse();
    }

    @Test
    void recusaMedicaoDeEtapaBloqueada() {
        vincular(fundacao, estrutura, TipoDependencia.FI);
        var medicao = new MedicaoInput(new BigDecimal("30"), BigDecimal.ONE, null, null, null);

        assertThatThrownBy(() -> obraService.registrarMedicao(ID_OBRA, estrutura.getId(), medicao))
                .isInstanceOf(ConflitoException.class)
                .hasMessageStartingWith("Etapa bloqueada: aguarda 2.1.");
    }

    @Test
    void calculaPesoPercentualDaEtapa() {
        assertThat(etapaListada(fundacao).pesoPercentual()).isEqualByComparingTo("25");
    }

    private class ObraRepositoryFake implements ObraRepository {
        @Override
        public Obra save(Obra o) {
            return o;
        }

        @Override
        public Optional<Obra> findById(UUID id) {
            return ID_OBRA.equals(id) ? Optional.of(obra) : Optional.empty();
        }

        @Override
        public List<Obra> findAll() {
            return List.of(obra);
        }

        @Override
        public boolean existsById(UUID id) {
            return ID_OBRA.equals(id);
        }

        @Override
        public void deleteById(UUID id) {}
    }

    private class DependenciaRepositoryFake implements DependenciaEtapaRepository {
        @Override
        public DependenciaEtapa save(DependenciaEtapa dependencia) {
            if (dependencia.getId() == null) {
                ReflectionTestUtils.setField(dependencia, "id", UUID.randomUUID());
                dependencias.add(dependencia);
            }
            return dependencia;
        }

        @Override
        public List<DependenciaEtapa> findByObraId(UUID obraId) {
            return List.copyOf(dependencias);
        }

        @Override
        public Optional<DependenciaEtapa> findById(UUID id) {
            return dependencias.stream().filter(d -> d.getId().equals(id)).findFirst();
        }

        @Override
        public void delete(DependenciaEtapa dependencia) {
            dependencias.remove(dependencia);
        }
    }
}
