package br.com.concordia.features.obras.deletarobra;

import br.com.concordia.common.domain.entities.Obra;
import java.util.UUID;
import org.springframework.data.repository.Repository;

@org.springframework.stereotype.Repository
public interface DeletarObraRepository extends Repository<Obra, UUID> {
    boolean existsById(UUID id);

    void deleteById(UUID id);
    ;
}
