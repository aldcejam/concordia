package br.com.concordia.features.empresas.atualizarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.features.empresas.common.EmpresaMapper;
import br.com.concordia.features.empresas.common.EmpresaParcialRequest;
import br.com.concordia.features.empresas.common.EmpresaRequest;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

@Service
public class AtualizarEmpresaService {
    private final AtualizarEmpresaRepository repository;
    private final EmpresaMapper mapper;

    public AtualizarEmpresaService(AtualizarEmpresaRepository repository, EmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public EmpresaResponse atualizar(UUID id, EmpresaRequest request) {
        var empresa = findEmpresa(id);
        empresa.atualizar(request.nome(), request.cnpj(), request.razaoSocial());
        return mapper.toResponseDto(empresa);
    }

    public EmpresaResponse atualizarParcial(UUID id, EmpresaParcialRequest request) {
        var empresa = findEmpresa(id);
        empresa.atualizarParcial(request.nome(), request.cnpj(), request.razaoSocial());
        return mapper.toResponseDto(empresa);
    }

    private @NonNull Empresa findEmpresa(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
    }
}
