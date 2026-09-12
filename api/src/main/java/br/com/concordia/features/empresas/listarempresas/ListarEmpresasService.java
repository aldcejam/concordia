package br.com.concordia.features.empresas.listarempresas;

import br.com.concordia.features.empresas.common.EmpresaMapper;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListarEmpresasService {
    private final ListarEmpresasRepository repository;
    private final EmpresaMapper mapper;

    public ListarEmpresasService(ListarEmpresasRepository repository, EmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<EmpresaResponse> listarEmpresas() {
        var empresas = repository.findAll();
        return mapper.toResponseDto(empresas);
    }
}
