package br.com.concordia.domain.obra;

import br.com.concordia.domain.obra.entities.Obra;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ObraRepository {
    Obra save(Obra obra);

    void flush();

    Optional<Obra> findById(UUID id);

    Optional<Obra> findByIdForUpdate(UUID id);

    List<Obra> findAll();

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
