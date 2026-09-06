package br.com.concordia.features.empresas.criarempresa;

import br.com.concordia.common.infrastructure.repositories.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriarEmpresaService {
    private final EmpresaRepository repository;
    private final CriarEmpresaMapper mapper;

    public CriarEmpresaService(EmpresaRepository repository, CriarEmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public CriarEmpresaResponse criarEmpresa(CriarEmpresaRequest request) {
        var empresa = mapper.toEntity(request);
        return mapper.toResponseDto(repository.save(empresa));
    }
}
