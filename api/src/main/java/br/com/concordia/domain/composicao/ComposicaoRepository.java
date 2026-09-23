package br.com.concordia.domain.composicao;

import br.com.concordia.domain.composicao.entities.Composicao;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ComposicaoRepository {
    boolean existsById(UUID id);

    Optional<Composicao> findById(UUID id);

    List<Composicao> findAll();

    Composicao save(Composicao composicao);

    void deleteById(UUID id);
}
