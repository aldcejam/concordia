package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsultarObraService {
    private final ConsultarObraRepository repository;
    private final ObraMapper mapper;

    public ConsultarObraService(ConsultarObraRepository repository, ObraMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public ObraResponse consultarObra(UUID id) {
        var obra = repository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));
        return mapper.toResponseDto(obra);
    }
}
