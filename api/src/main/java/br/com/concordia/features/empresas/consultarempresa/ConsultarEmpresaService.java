package br.com.concordia.features.empresas.consultarempresa;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.features.empresas.common.EmpresaMapper;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ConsultarEmpresaService {
    private final ConsultarEmpresaRepository repository;
    private final EmpresaMapper mapper;

    public ConsultarEmpresaService(ConsultarEmpresaRepository repository, EmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public EmpresaResponse consultar(UUID id) {
        var empresa = repository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Empresa com ID %s não foi encontrada".formatted(id)));
        return mapper.toResponseDto(empresa);
    }
}
