package br.com.concordia.infrastructure.obra.repositories;

import br.com.concordia.domain.obra.entities.DependenciaEtapa;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataDependenciaEtapaRepository extends JpaRepository<DependenciaEtapa, UUID> {
    @EntityGraph(attributePaths = {"predecessora", "sucessora"})
    List<DependenciaEtapa> findByObraId(UUID obraId);
}
