package br.com.concordia.features.empresas.criarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.UUID;
import org.springframework.data.repository.Repository;

@org.springframework.stereotype.Repository
public interface CriarEmpresaRepository extends Repository<Empresa, UUID> {
    Empresa save(Empresa empresa);
}
