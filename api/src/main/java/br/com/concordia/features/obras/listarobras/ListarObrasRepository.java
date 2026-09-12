package br.com.concordia.features.obras.listarobras;

import br.com.concordia.common.domain.entities.Obra;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface ListarObrasRepository extends Repository<Obra, UUID> {
    List<Obra> findAll();
}
