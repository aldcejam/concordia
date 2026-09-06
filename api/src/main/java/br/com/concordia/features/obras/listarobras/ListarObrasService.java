package br.com.concordia.features.obras.listarobras;

import br.com.concordia.common.infrastructure.repositories.ObraRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ListarObrasService {
    private final ObraRepository repository;
    private final ListarObrasMapper mapper;

    public ListarObrasService(ObraRepository repository, ListarObrasMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ListarObrasResponse> listarObras() {
        var obra = repository.findAll();
        return mapper.toResponseDto(obra);
    }
}
