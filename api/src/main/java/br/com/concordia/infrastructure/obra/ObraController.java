package br.com.concordia.infrastructure.obra;

import br.com.concordia.domain.obra.ObraService;
import br.com.concordia.infrastructure.obra.dtos.ObraParcialRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraResponse;
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
    private final ObraInfraMapper mapper;

    public ObraController(ObraService service, ObraInfraMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<ObraResponse> criar(
            @RequestBody @Valid ObraRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(mapper.toInputDto(request));

        var uri = uriBuilder
                .path("/api/obras/{id}")
                .buildAndExpand(output.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(mapper.toResponseDto(output));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObraResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(mapper.toResponseDto(service.consultar(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizar(id, mapper.toInputDto(request))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraParcialRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizarParcial(id, mapper.toInputDto(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ObraResponse>> listar() {
        return ResponseEntity.ok(mapper.toResponseDto(service.listar()));
    }
}
