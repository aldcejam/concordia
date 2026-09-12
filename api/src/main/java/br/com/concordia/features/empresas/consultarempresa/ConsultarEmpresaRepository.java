package br.com.concordia.features.empresas.consultarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface ConsultarEmpresaRepository extends Repository<Empresa, UUID> {
    Optional<Empresa> findById(java.util.UUID id);
}
