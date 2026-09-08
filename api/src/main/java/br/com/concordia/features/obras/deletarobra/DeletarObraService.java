package br.com.concordia.features.obras.deletarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeletarObraService {
    private final DeletarObraRepository repository;

    public DeletarObraService(DeletarObraRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void deletarObra(UUID id) {
        var obra = repository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));

        repository.delete(obra);
    }
}
