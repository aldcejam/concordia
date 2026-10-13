package br.com.concordia.infrastructure.cronograma;

import br.com.concordia.domain.cronograma.AtrasoEtapa;
import br.com.concordia.domain.cronograma.AtrasoRepository;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

interface SpringDataAtrasoRepository extends JpaRepository<AtrasoEtapa, UUID> {
    List<AtrasoEtapa> findByObraIdOrderByCriadoEmDesc(UUID obraId);
}

@Repository
public class AtrasoRepositoryImpl implements AtrasoRepository {
    private final SpringDataAtrasoRepository repository;

    public AtrasoRepositoryImpl(SpringDataAtrasoRepository repository) {
        this.repository = repository;
    }

    public AtrasoEtapa save(AtrasoEtapa atraso) {
        return repository.save(atraso);
    }

    public Optional<AtrasoEtapa> findById(UUID id) {
        return repository.findById(id);
    }

    public List<AtrasoEtapa> findByObraId(UUID obraId) {
        return repository.findByObraIdOrderByCriadoEmDesc(obraId);
    }
}
