package br.com.concordia.common.infrastructure.repositories;

import br.com.concordia.common.domain.entities.Obra;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObraRepository extends JpaRepository<Obra, UUID> {}
