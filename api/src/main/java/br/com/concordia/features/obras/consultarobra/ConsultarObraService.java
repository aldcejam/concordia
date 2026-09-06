package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.common.infrastructure.repositories.ObraRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsultarObraService {
    private final ObraRepository repository;
    private final ConsultarObraMapper mapper;

    public ConsultarObraService(ObraRepository repository, ConsultarObraMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public ConsultarObraResponse consultarObra(UUID id) {
        var obra = repository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));
        return mapper.toResponseDto(obra);
    }
}
