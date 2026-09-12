package br.com.concordia.features.obras.listarobras;

import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ListarObrasService {
    private final ListarObrasRepository repository;
    private final ObraMapper mapper;

    public ListarObrasService(ListarObrasRepository repository, ObraMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ObraResponse> listarObras() {
        var obras = repository.findAll();
        return mapper.toResponseDto(obras);
    }
}
