package br.com.concordia.infrastructure.repositories.insumo;

import br.com.concordia.domain.insumo.entities.Insumo;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataInsumoRepository extends JpaRepository<Insumo, UUID> {
    boolean existsByCodigo(String codigo);
}
