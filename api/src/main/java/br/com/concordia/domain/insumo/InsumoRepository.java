package br.com.concordia.domain.insumo;

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
