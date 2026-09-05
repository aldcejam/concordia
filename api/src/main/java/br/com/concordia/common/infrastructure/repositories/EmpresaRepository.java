package br.com.concordia.common.infrastructure.repositories;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {}
