package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.domain.entities.Obra;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

@org.springframework.stereotype.Repository
public interface ConsultarObraRepository extends Repository<Obra, UUID> {
    Optional<Obra> findById(UUID id);
}
