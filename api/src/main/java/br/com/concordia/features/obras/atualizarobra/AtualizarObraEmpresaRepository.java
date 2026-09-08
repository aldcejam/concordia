package br.com.concordia.features.obras.atualizarobra;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

@org.springframework.stereotype.Repository
public interface AtualizarObraEmpresaRepository extends Repository<Empresa, UUID> {
    Optional<Empresa> findById(UUID id);
}
