package br.com.concordia.domain.cronograma;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AtrasoRepository {
    AtrasoEtapa save(AtrasoEtapa atraso);

    Optional<AtrasoEtapa> findById(UUID id);

    List<AtrasoEtapa> findByObraId(UUID obraId);
}
