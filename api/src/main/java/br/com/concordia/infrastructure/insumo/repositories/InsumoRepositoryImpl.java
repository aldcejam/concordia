package br.com.concordia.infrastructure.insumo.repositories;

import br.com.concordia.domain.insumo.Insumo;
import br.com.concordia.domain.insumo.InsumoRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class InsumoRepositoryImpl implements InsumoRepository {
    private final SpringDataInsumoRepository repository;

    public InsumoRepositoryImpl(SpringDataInsumoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Insumo> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsByCodigo(String codigo) {
        return repository.existsByCodigo(codigo);
    }

    @Override
    public List<Insumo> findAll() {
        return repository.findAll();
    }

    @Override
    public Insumo save(Insumo insumo) {
        return repository.save(insumo);
    }
}
