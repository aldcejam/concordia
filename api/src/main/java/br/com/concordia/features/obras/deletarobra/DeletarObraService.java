package br.com.concordia.features.obras.deletarobra;

import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeletarObraService {
    private final DeletarObraRepository repository;

    public DeletarObraService(DeletarObraRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id));
        }
        repository.deleteById(id);
    }
}
