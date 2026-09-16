package br.com.concordia.domain.empresa;

import br.com.concordia.domain.empresa.entities.Empresa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepository {
    Empresa save(Empresa empresa);

    Optional<Empresa> findById(UUID id);

    List<Empresa> findAll();

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
