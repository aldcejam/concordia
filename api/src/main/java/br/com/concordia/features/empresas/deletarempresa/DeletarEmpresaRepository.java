package br.com.concordia.features.empresas.deletarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface DeletarEmpresaRepository extends Repository<Empresa, UUID> {
    Boolean existsById(UUID id);

    void deleteById(UUID id);
}
