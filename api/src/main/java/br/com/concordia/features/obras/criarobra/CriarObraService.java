package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.application.exceptions.RegraDeNegocioException;
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

    public CriarObraService(ObraRepository repository, EmpresaRepository empresaRepository) {
        this.obraRepository = repository;
        this.empresaRepository = empresaRepository;
    }

    @Transactional
    public Obra criarObra(CriarObraRequest request) {
        Empresa empresa = null;
        if (request.id_empresa() != null) {
            empresa = empresaRepository
                    .findById(request.id_empresa())
                    .orElseThrow(() -> new RegraDeNegocioException(
                            "Empresa com ID %s não foi encontrada no banco".formatted(request.id_empresa())));
        }
        var obra = new Obra(request.descricao(), request.uf(), request.fusoHorario(), empresa);
        return obraRepository.save(obra);
    }
}
