package br.com.concordia.domain.insumo;

import br.com.concordia.domain.insumo.entities.Insumo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InsumoRepository {
    Optional<Insumo> findById(UUID id);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByCodigo(String codigo);

    List<Insumo> findAll();

    Insumo save(Insumo insumo);
}
