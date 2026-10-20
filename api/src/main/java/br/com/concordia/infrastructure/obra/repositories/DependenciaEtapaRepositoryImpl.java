package br.com.concordia.infrastructure.obra.repositories;

import br.com.concordia.domain.obra.dependencia.DependenciaEtapaRepository;
import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class DependenciaEtapaRepositoryImpl implements DependenciaEtapaRepository {

    private final SpringDataDependenciaEtapaRepository repository;

    public DependenciaEtapaRepositoryImpl(SpringDataDependenciaEtapaRepository repository) {
        this.repository = repository;
    }

    @Override
    public DependenciaEtapa save(DependenciaEtapa dependencia) {
        return repository.save(dependencia);
    }

    @Override
    public List<DependenciaEtapa> findByObraId(UUID obraId) {
        return repository.findByObraId(obraId);
    }

    @Override
    public Optional<DependenciaEtapa> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public void delete(DependenciaEtapa dependencia) {
        repository.delete(dependencia);
    }
}
