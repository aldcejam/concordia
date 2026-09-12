package br.com.concordia.features.empresas.listarempresas;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.Repository;

public interface ListarEmpresasRepository extends Repository<Empresa, UUID> {
    List<Empresa> findAll();
}
