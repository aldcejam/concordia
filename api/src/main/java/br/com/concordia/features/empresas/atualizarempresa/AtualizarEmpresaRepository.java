package br.com.concordia.features.empresas.atualizarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface AtualizarEmpresaRepository extends Repository<Empresa, UUID> {
    Optional<Empresa> findById(UUID id);
}
