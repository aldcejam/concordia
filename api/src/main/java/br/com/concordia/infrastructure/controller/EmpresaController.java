package br.com.concordia.infrastructure.controller;

import br.com.concordia.domain.empresa.EmpresaService;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaParcialRequest;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaRequest;
import br.com.concordia.infrastructure.controller.dto.empresa.EmpresaResponse;
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

    public EmpresaController(EmpresaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @RequestBody @Valid EmpresaRequest request, UriComponentsBuilder uriBuilder) {
        var response = service.criar(request);

        var uri = uriBuilder
                .path("/api/empresas/{id}")
                .buildAndExpand(response.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(service.consultar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaParcialRequest request) {
        return ResponseEntity.ok(service.atualizarParcial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }
}
