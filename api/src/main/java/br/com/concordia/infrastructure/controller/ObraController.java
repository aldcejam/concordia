package br.com.concordia.infrastructure.controller;

import br.com.concordia.domain.obra.ObraService;
import br.com.concordia.infrastructure.controller.dto.obra.ObraParcialRequest;
import br.com.concordia.infrastructure.controller.dto.obra.ObraRequest;
import br.com.concordia.infrastructure.controller.dto.obra.ObraResponse;
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
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ObraController {

    private final ObraService service;

    public ObraController(ObraService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ObraResponse> criar(
            @RequestBody @Valid ObraRequest request, UriComponentsBuilder uriBuilder) {
        var response = service.criar(request);

        var uri = uriBuilder
                .path("/api/obras/{id}")
                .buildAndExpand(response.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObraResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(service.consultar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraParcialRequest request) {
        return ResponseEntity.ok(service.atualizarParcial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ObraResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }
}
