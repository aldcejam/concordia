package br.com.concordia.domain.composicao;

import br.com.concordia.domain.composicao.dtos.ComposicaoInput;
import br.com.concordia.domain.composicao.dtos.ComposicaoOutput;
import br.com.concordia.domain.composicao.entities.Composicao;
import br.com.concordia.domain.composicao.entities.ItemComposicao;
import br.com.concordia.domain.insumo.InsumoRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComposicaoService {
    private final ComposicaoRepository repository;
    private final InsumoRepository insumoRepository;
    private final ComposicaoMapper mapper;

    public ComposicaoService(
            ComposicaoRepository repository, InsumoRepository insumoRepository, ComposicaoMapper mapper) {
        this.repository = repository;
        this.insumoRepository = insumoRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ComposicaoOutput criar(ComposicaoInput input) {
        var composicao = mapper.toEntity(input);
        return mapper.toOutputDto(repository.save(composicao));
    }

    @Transactional(readOnly = true)
    public ComposicaoOutput consultar(UUID id) {
        var composicao = findComposicao(id);
        return mapper.toOutputDto(composicao);
    }

    @Transactional
    public ComposicaoOutput atualizar(UUID id, ComposicaoInput input) {
        var composicao = findComposicao(id);
        composicao.atualizar(input.codigo(), input.descricao(), input.unidade(), input.preco());
        return mapper.toOutputDto(composicao);
    }

    @Transactional
    public ComposicaoOutput atualizarParcial(UUID id, ComposicaoInput input) {
        var composicao = findComposicao(id);
        composicao.atualizarParcial(input.codigo(), input.descricao(), input.unidade(), input.preco());
        return mapper.toOutputDto(composicao);
    }

    @Transactional
    public void deletar(UUID id) {
        composicaoExistsById(id);
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ComposicaoOutput> listar() {
        var composicoes = repository.findAll();
        return mapper.toOutputDto(composicoes);
    }

    @Transactional
    public ComposicaoOutput adicionarItem(UUID idComposicao, UUID idItem) {
        var composicao = findComposicao(idComposicao);
        var item = findItemComposicao(idItem);
        return mapper.toOutputDto(composicao.adicionarItem(item));
    }

    @Transactional
    public void deletarItem(UUID idComposicao, UUID idItem) {
        var composicao = findComposicao(idComposicao);
        var item = findItemComposicao(idItem);
        composicao.removerItem(item);
    }

    private @NonNull Composicao findComposicao(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("Composição com ID %s não foi encontrada".formatted(id)));
    }

    private ItemComposicao findItemComposicao(UUID id) {
        var insumo = insumoRepository.findById(id);
        if (insumo.isPresent()) {
            return insumo.get();
        }

        var composicao = repository.findById(id);
        if (composicao.isPresent()) {
            return composicao.get();
        }

        throw new EntityNotFoundException("Insumo ou Composição com ID %s não foi encontrado".formatted(id));
    }

    private void composicaoExistsById(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Composição com ID %s não foi encontrada".formatted(id));
        }
    }
}
