package br.com.concordia.infrastructure.obra.repositories;

import br.com.concordia.domain.obra.ObraRepository;
import br.com.concordia.domain.obra.entities.Obra;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ObraRepositoryImpl implements ObraRepository {

    private final SpringDataObraRepository repository;

    public ObraRepositoryImpl(SpringDataObraRepository repository) {
        this.repository = repository;
    }

    @Override
    public Obra save(Obra obra) {
        return repository.save(obra);
    }

    @Override
    public Optional<Obra> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public List<Obra> findAll() {
        return repository.findAll();
    }

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
