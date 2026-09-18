package br.com.concordia.domain.insumo;

import br.com.concordia.domain.common.exceptions.ConflitoException;
import br.com.concordia.domain.insumo.dtos.InsumoInput;
import br.com.concordia.domain.insumo.dtos.InsumoOutput;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InsumoService {
    private final InsumoMapper mapper;
    private final InsumoRepository repository;

    public InsumoService(InsumoMapper mapper, InsumoRepository repository) {
        this.mapper = mapper;
        this.repository = repository;
    }

    @Transactional
    public InsumoOutput criar(InsumoInput input) {
        if (repository.existsByCodigo(input.codigo())) {
            throw new ConflitoException("Insumo com esse código já existe.");
        }
        var insumo = mapper.toEntity(input);
        return mapper.toOutputDto(repository.save(insumo));
    }

    @Transactional(readOnly = true)
    public InsumoOutput consultar(UUID id) {
        var insumo = repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
        return mapper.toOutputDto(insumo);
    }

    @Transactional
    public InsumoOutput atualizar(UUID id, InsumoInput input) {
        var insumo = findInsumo(id);
        insumo.atualizar(input.codigo(), input.descricao(), input.unidade(), input.preco());
        return mapper.toOutputDto(insumo);
    }

    @Transactional
    public InsumoOutput atualizarParcial(UUID id, InsumoInput input) {
        var insumo = findInsumo(id);
        insumo.atualizarParcial(input.codigo(), input.descricao(), input.unidade(), input.preco());
        return mapper.toOutputDto(insumo);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id));
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<InsumoOutput> listar() {
        var insumos = repository.findAll();
        return mapper.toOutputDto(insumos);
    }

    private @NonNull Insumo findInsumo(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
    }
}
