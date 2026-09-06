package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.common.infrastructure.repositories.EmpresaRepository;
import br.com.concordia.common.infrastructure.repositories.ObraRepository;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriarObraService {
    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public CriarObraService(ObraRepository repository, EmpresaRepository empresaRepository, ObraMapper mapper) {
        this.obraRepository = repository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ObraResponse criarObra(ObraRequest request) {
        Empresa empresa = null;
        if (request.idEmpresa() != null) {
            empresa = empresaRepository
                    .findById(request.idEmpresa())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.idEmpresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toResponseDto(obraRepository.save(obra));
    }
}
