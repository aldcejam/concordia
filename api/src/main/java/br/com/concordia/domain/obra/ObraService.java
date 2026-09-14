package br.com.concordia.domain.obra;

import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.entities.Obra;
import br.com.concordia.infrastructure.controller.dto.obra.ObraMapper;
import br.com.concordia.infrastructure.controller.dto.obra.ObraParcialRequest;
import br.com.concordia.infrastructure.controller.dto.obra.ObraRequest;
import br.com.concordia.infrastructure.controller.dto.obra.ObraResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObraService {

    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public ObraService(ObraRepository obraRepository, EmpresaRepository empresaRepository, ObraMapper mapper) {
        this.obraRepository = obraRepository;
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

    @Transactional(readOnly = true)
    public ObraResponse consultar(UUID id) {
        var obra = obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
        return mapper.toResponseDto(obra);
    }

    @Transactional
    public ObraResponse atualizar(UUID id, ObraRequest request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizar(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toResponseDto(obra);
    }

    @Transactional
    public ObraResponse atualizarParcial(UUID id, ObraParcialRequest request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizarParcial(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toResponseDto(obra);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!obraRepository.existsById(id)) {
            throw new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id));
        }
        obraRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ObraResponse> listar() {
        var obras = obraRepository.findAll();
        return mapper.toResponseDto(obras);
    }

    private @NonNull Obra obterObra(UUID id) {
        return obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
    }

    private @Nullable Empresa obterEmpresa(UUID id) {
        Empresa empresa = null;
        if (id != null) {
            empresa = empresaRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new EntityNotFoundException("Empresa com ID %s não foi encontrada no banco".formatted(id)));
        }
        return empresa;
    }
}
