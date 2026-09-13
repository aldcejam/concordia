package br.com.concordia.features.empresas.deletarempresa;

import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DeletarEmpresaService {
    private final DeletarEmpresaRepository repository;

    public DeletarEmpresaService(DeletarEmpresaRepository repository) {
        this.repository = repository;
    }

    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id));
        }
        repository.deleteById(id);
    }
}
