package br.com.concordia.features.empresas.criarempresa;

import br.com.concordia.features.empresas.common.EmpresaMapper;
import br.com.concordia.features.empresas.common.EmpresaRequest;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriarEmpresaService {
    private final CriarEmpresaRepository repository;
    private final EmpresaMapper mapper;

    public CriarEmpresaService(CriarEmpresaRepository repository, EmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public EmpresaResponse criar(EmpresaRequest request) {
        var empresa = mapper.toEntity(request);
        return mapper.toResponseDto(repository.save(empresa));
    }
}
