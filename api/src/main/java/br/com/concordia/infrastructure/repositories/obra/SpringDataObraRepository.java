package br.com.concordia.infrastructure.repositories.obra;

import br.com.concordia.domain.obra.entities.Obra;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataObraRepository extends JpaRepository<Obra, UUID> {}
