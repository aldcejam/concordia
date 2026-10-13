package br.com.concordia.infrastructure.obra.repositories;

import br.com.concordia.domain.obra.entities.Obra;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface SpringDataObraRepository extends JpaRepository<Obra, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Obra o where o.id = :id")
    Optional<Obra> findByIdForUpdate(UUID id);
}
