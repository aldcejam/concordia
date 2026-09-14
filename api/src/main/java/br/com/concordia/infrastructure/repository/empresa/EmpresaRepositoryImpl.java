package br.com.concordia.infrastructure.repository.empresa;

import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.empresa.entities.Empresa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class EmpresaRepositoryImpl implements EmpresaRepository {

    private final SpringDataEmpresaRepository repository;

    public EmpresaRepositoryImpl(SpringDataEmpresaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Empresa save(Empresa empresa) {
        return repository.save(empresa);
    }

    @Override
    public Optional<Empresa> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    public List<Empresa> findAll() {
        return repository.findAll();
    }

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
