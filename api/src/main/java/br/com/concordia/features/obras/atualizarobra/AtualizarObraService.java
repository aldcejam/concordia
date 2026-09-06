package br.com.concordia.features.obras.atualizarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.common.infrastructure.repositories.EmpresaRepository;
import br.com.concordia.common.infrastructure.repositories.ObraRepository;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraParcialRequest;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import java.util.UUID;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtualizarObraService {
    private final ObraRepository obraRepository;
    private final EmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public AtualizarObraService(ObraRepository obraRepository, EmpresaRepository empresaRepository, ObraMapper mapper) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ObraResponse atualizarObra(UUID id, ObraRequest request) {
        var obra = obraRepository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));
        Empresa empresa = getEmpresa(request.idEmpresa());
        obra.atualizar(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toResponseDto(obra);
    }

    @Transactional
    public ObraResponse atualizarParcialObra(UUID id, ObraParcialRequest request) {
        var obra = obraRepository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));
        Empresa empresa = getEmpresa(request.idEmpresa());
        obra.atualizarParcial(request.descricao(), request.uf(), request.fusoHorario(), empresa);

        return mapper.toResponseDto(obra);
    }

    private @Nullable Empresa getEmpresa(UUID id) {
        Empresa empresa = null;
        if (id != null) {
            empresa = empresaRepository
                    .findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(id)));
        }
        return empresa;
    }
}
