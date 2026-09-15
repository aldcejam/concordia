package br.com.concordia.infrastructure.empresa;

import br.com.concordia.domain.empresa.EmpresaService;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaParcialRequest;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaRequest;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/empresas")
@Tag(name = "Empresas")
public class EmpresaController {

    private final EmpresaService service;
    private final EmpresaInfraMapper mapper;

    public EmpresaController(EmpresaService service, EmpresaInfraMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @RequestBody @Valid EmpresaRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(mapper.toInputDto(request));

        var uri = uriBuilder
                .path("/api/empresas/{id}")
                .buildAndExpand(output.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(mapper.toResponseDto(output));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(mapper.toResponseDto(service.consultar(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizar(id, mapper.toInputDto(request))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaParcialRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizarParcial(id, mapper.toInputDto(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listar() {
        return ResponseEntity.ok(mapper.toResponseDto(service.listar()));
    }
}
