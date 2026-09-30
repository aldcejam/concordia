package br.com.concordia.domain.obra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.obra.dtos.ImportacaoObraInput;
import br.com.concordia.domain.obra.dtos.LinhaImportacao;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ImportacaoObraServiceTest {
    private static final UUID ID_OBRA = UUID.randomUUID();

    private Obra obra;
    private ImportacaoObraService service;

    @BeforeEach
    void setUp() {
        obra = new Obra("Obra teste", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);
        service = new ImportacaoObraService(new ObraRepositoryFake());
    }

    private static LinhaImportacao agrupamento(int linha, String item, String descricao) {
        return new LinhaImportacao(linha, item, null, descricao, null, null);
    }

    @Test
    void montaArvoreDaEapPelaNumeracao() {
        var input = new ImportacaoObraInput(List.of(
                agrupamento(2, "1", "SERVIÇOS PRELIMINARES"),
                agrupamento(3, "1.1", "CANTEIRO"),
                new LinhaImportacao(4, "1.1.1", "103689", "PLACA", "M2", new BigDecimal("4.5")),
                agrupamento(5, "2", "INSTALAÇÕES")));

        var output = service.importar(ID_OBRA, input);

        assertThat(output.itensEapCriados()).isEqualTo(4);
        assertThat(obra.getEap())
                .extracting(ItemEap::getNome)
                .containsExactly("SERVIÇOS PRELIMINARES", "CANTEIRO", "PLACA", "INSTALAÇÕES");

        var raiz = obra.getEap().get(0);
        var canteiro = obra.getEap().get(1);
        var placa = obra.getEap().get(2);
        assertThat(raiz.getPai()).isNull();
        assertThat(canteiro.getPai()).isSameAs(raiz);
        assertThat(placa.getPai()).isSameAs(canteiro);
        assertThat(raiz.getFilhos()).containsExactly(canteiro);
        assertThat(obra.getEap().get(3).getPai()).isNull();
        assertThat(obra.getEap()).extracting(ItemEap::getPosicao).isSorted();
    }

    @Test
    void rejeitaItemSemPaiAnterior() {
        var input = new ImportacaoObraInput(List.of(agrupamento(2, "1.1", "CANTEIRO")));

        assertThatThrownBy(() -> service.importar(ID_OBRA, input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Linha 2: item pai 1 do item 1.1 não foi encontrado antes dele.");
    }

    @Test
    void rejeitaItemDuplicado() {
        var input = new ImportacaoObraInput(List.of(agrupamento(2, "1", "A"), agrupamento(3, "1", "B")));

        assertThatThrownBy(() -> service.importar(ID_OBRA, input)).hasMessage("Linha 3: item 1 está duplicado.");
    }

    @Test
    void rejeitaObraQueJaPossuiEap() {
        obra.adicionarItemEap(new ItemEap(obra, "EXISTENTE", null, null));
        var input = new ImportacaoObraInput(List.of(agrupamento(2, "1", "A")));

        assertThatThrownBy(() -> service.importar(ID_OBRA, input)).isInstanceOf(ConflitoException.class);
    }

    @Test
    void rejeitaObraInexistente() {
        var input = new ImportacaoObraInput(List.of());

        assertThatThrownBy(() -> service.importar(UUID.randomUUID(), input))
                .isInstanceOf(EntityNotFoundException.class);
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
}
