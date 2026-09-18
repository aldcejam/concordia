package br.com.concordia.infrastructure.insumo.repositories;

import br.com.concordia.domain.insumo.Insumo;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataInsumoRepository extends JpaRepository<Insumo, UUID> {
    boolean existsByCodigo(String codigo);
}
