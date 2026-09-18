package br.com.concordia.infrastructure.insumo;

import br.com.concordia.domain.insumo.InsumoService;
import br.com.concordia.infrastructure.insumo.dtos.InsumoParcialRequest;
import br.com.concordia.infrastructure.insumo.dtos.InsumoRequest;
import br.com.concordia.infrastructure.insumo.dtos.InsumoResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/insumos")
@Tag(name = "Insumos")
public class InsumoController {
    private final InsumoService service;
    private final InsumoInfraMapper mapper;

    public InsumoController(InsumoService service, InsumoInfraMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<InsumoResponse> criar(
            @RequestBody @Valid InsumoRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(mapper.toInputDto(request));

        var uri = uriBuilder
                .path("/api/Insumos/{id}")
                .buildAndExpand(output.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(mapper.toResponseDto(output));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(mapper.toResponseDto(service.consultar(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid InsumoRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizar(id, mapper.toInputDto(request))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InsumoResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid InsumoParcialRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizarParcial(id, mapper.toInputDto(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<InsumoResponse>> listar() {
        return ResponseEntity.ok(mapper.toResponseDto(service.listar()));
    }
}
