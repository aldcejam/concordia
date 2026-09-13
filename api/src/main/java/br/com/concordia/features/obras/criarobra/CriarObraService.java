package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CriarObraService {
    private final CriarObraRepository obraRepository;
    private final CriarObraEmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public CriarObraService(
            CriarObraRepository repository, CriarObraEmpresaRepository empresaRepository, ObraMapper mapper) {
        this.obraRepository = repository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ObraResponse criar(ObraRequest request) {
        Empresa empresa = null;
        if (request.idEmpresa() != null) {
            empresa = empresaRepository
                    .findById(request.idEmpresa())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.idEmpresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toResponseDto(obraRepository.save(obra));
    }
}
