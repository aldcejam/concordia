package br.com.concordia.domain.empresa;

import br.com.concordia.domain.empresa.dtos.EmpresaInput;
import br.com.concordia.domain.empresa.dtos.EmpresaOutput;
import br.com.concordia.domain.empresa.entities.Empresa;
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
    public EmpresaOutput criar(EmpresaInput input) {
        var empresa = mapper.toEntity(input);
        return mapper.toOutputDto(repository.save(empresa));
    }

    @Transactional(readOnly = true)
    public EmpresaOutput consultar(UUID id) {
        var empresa = repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
        return mapper.toOutputDto(empresa);
    }

    @Transactional
    public EmpresaOutput atualizar(UUID id, EmpresaInput input) {
        var empresa = findEmpresa(id);
        empresa.atualizar(input.nome(), input.cnpj(), input.razaoSocial());
        return mapper.toOutputDto(empresa);
    }

    @Transactional
    public EmpresaOutput atualizarParcial(UUID id, EmpresaInput input) {
        var empresa = findEmpresa(id);
        empresa.atualizarParcial(input.nome(), input.cnpj(), input.razaoSocial());
        return mapper.toOutputDto(empresa);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id));
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EmpresaOutput> listar() {
        var empresas = repository.findAll();
        return mapper.toOutputDto(empresas);
    }

    private @NonNull Empresa findEmpresa(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa com ID %s não foi encontrada".formatted(id)));
    }
}
