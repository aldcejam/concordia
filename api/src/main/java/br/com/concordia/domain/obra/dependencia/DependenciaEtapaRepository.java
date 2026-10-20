package br.com.concordia.domain.obra.dependencia;

import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DependenciaEtapaRepository {
    DependenciaEtapa save(DependenciaEtapa dependencia);

    List<DependenciaEtapa> findByObraId(UUID obraId);

    Optional<DependenciaEtapa> findById(UUID id);

    void delete(DependenciaEtapa dependencia);
}
