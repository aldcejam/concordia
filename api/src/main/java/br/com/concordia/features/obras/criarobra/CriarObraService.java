package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.common.domain.entities.Obra;
import br.com.concordia.common.infrastructure.repositories.EmpresaRepository;
import br.com.concordia.common.infrastructure.repositories.ObraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriarObraService {
    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final CriarObraMapper mapper;

    public CriarObraService(ObraRepository repository, EmpresaRepository empresaRepository, CriarObraMapper mapper) {
        this.obraRepository = repository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CriarObraResponse criarObra(CriarObraRequest request) {
        Empresa empresa = null;
        if (request.id_empresa() != null) {
            empresa = empresaRepository
                    .findById(request.id_empresa())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.id_empresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toResponseDto(obraRepository.save(obra));
    }
}
