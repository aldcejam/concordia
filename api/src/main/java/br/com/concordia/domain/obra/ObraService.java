package br.com.concordia.domain.obra;

import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.domain.obra.entities.Obra;
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
    public ObraOutput criar(ObraInput request) {
        Empresa empresa = null;
        if (request.idEmpresa() != null) {
            empresa = empresaRepository
                    .findById(request.idEmpresa())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.idEmpresa())));
        }
        var obra = mapper.toEntity(request, empresa);
        return mapper.toOutputDto(obraRepository.save(obra));
    }

    @Transactional(readOnly = true)
    public ObraOutput consultar(UUID id) {
        var obra = obraRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id)));
        return mapper.toOutputDto(obra);
    }

    @Transactional
    public ObraOutput atualizar(UUID id, ObraInput request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizar(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toOutputDto(obra);
    }

    @Transactional
    public ObraOutput atualizarParcial(UUID id, ObraInput request) {
        var obra = obterObra(id);
        Empresa empresa = obterEmpresa(request.idEmpresa());
        obra.atualizarParcial(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toOutputDto(obra);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!obraRepository.existsById(id)) {
            throw new EntityNotFoundException("Obra com ID %s não foi encontrada".formatted(id));
        }
        obraRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ObraOutput> listar() {
        var obras = obraRepository.findAll();
        return mapper.toOutputDto(obras);
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
