package br.com.concordia.infrastructure.repository.empresa;

import br.com.concordia.domain.empresa.entities.Empresa;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataEmpresaRepository extends JpaRepository<Empresa, UUID> {}
