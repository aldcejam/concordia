package br.com.concordia.infrastructure.repositories.composicao;

import br.com.concordia.domain.composicao.entities.Composicao;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataComposicaoRepository extends JpaRepository<Composicao, UUID> {}
