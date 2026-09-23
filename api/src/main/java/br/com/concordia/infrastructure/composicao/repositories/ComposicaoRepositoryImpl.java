package br.com.concordia.infrastructure.composicao.repositories;

import br.com.concordia.domain.composicao.ComposicaoRepository;
import br.com.concordia.domain.composicao.entities.Composicao;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ComposicaoRepositoryImpl implements ComposicaoRepository {
    private final SpringDataComposicaoRepository repository;

    public ComposicaoRepositoryImpl(SpringDataComposicaoRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }

    @Override
    public Optional<Composicao> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public List<Composicao> findAll() {
        return repository.findAll();
    }

    @Override
    public Composicao save(Composicao composicao) {
        return repository.save(composicao);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
