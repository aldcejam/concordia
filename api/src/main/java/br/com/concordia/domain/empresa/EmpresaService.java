package br.com.concordia.domain.empresa;

import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaMapper;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaParcialRequest;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaRequest;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmpresaService {

    private final EmpresaRepository repository;
    private final EmpresaMapper mapper;

    public EmpresaService(EmpresaRepository repository, EmpresaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public EmpresaResponse criar(EmpresaRequest request) {
        var empresa = mapper.toEntity(request);
        return mapper.toResponseDto(repository.save(empresa));
    }

    public EmpresaResponse consultar(UUID id) {
        var empresa = repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
        return mapper.toResponseDto(empresa);
    }

    @Transactional
    public EmpresaResponse atualizar(UUID id, EmpresaRequest request) {
        var empresa = findEmpresa(id);
        empresa.atualizar(request.nome(), request.cnpj(), request.razaoSocial());
        return mapper.toResponseDto(empresa);
    }

    @Transactional
    public EmpresaResponse atualizarParcial(UUID id, EmpresaParcialRequest request) {
        var empresa = findEmpresa(id);
        empresa.atualizarParcial(request.nome(), request.cnpj(), request.razaoSocial());
        return mapper.toResponseDto(empresa);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id));
        }
        repository.deleteById(id);
    }

    public List<EmpresaResponse> listar() {
        var empresas = repository.findAll();
        return mapper.toResponseDto(empresas);
    }

    private @NonNull Empresa findEmpresa(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
    }
}
