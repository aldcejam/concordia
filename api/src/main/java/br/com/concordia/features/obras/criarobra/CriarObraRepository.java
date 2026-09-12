package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.entities.Obra;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface CriarObraRepository extends Repository<Obra, UUID> {
    Obra save(Obra obra);
}
