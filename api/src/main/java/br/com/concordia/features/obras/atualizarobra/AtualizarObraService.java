package br.com.concordia.features.obras.atualizarobra;

import br.com.concordia.common.application.exceptions.RecursoNaoEncontradoException;
import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.common.domain.entities.Obra;
import br.com.concordia.features.obras.common.ObraMapper;
import br.com.concordia.features.obras.common.ObraParcialRequest;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import java.util.UUID;

import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AtualizarObraService {
    private final AtualizarObraRepository obraRepository;
    private final AtualizarObraEmpresaRepository empresaRepository;
    private final ObraMapper mapper;

    public AtualizarObraService(
            AtualizarObraRepository obraRepository,
            AtualizarObraEmpresaRepository empresaRepository,
            ObraMapper mapper) {
        this.obraRepository = obraRepository;
        this.empresaRepository = empresaRepository;
        this.mapper = mapper;
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

    private @NonNull Obra obterObra(UUID id) {
        return obraRepository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNaoEncontradoException("Obra com ID %s não foi encontrada".formatted(id)));
    }

    private @Nullable Empresa obterEmpresa(UUID id) {
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
