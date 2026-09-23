package br.com.concordia.infrastructure.composicao;

import br.com.concordia.domain.composicao.ComposicaoService;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoParcialRequest;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoRequest;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/composicoes")
@Tag(name = "Composições")
public class ComposicaoController {
    private final ComposicaoService service;
    private final ComposicaoInfraMapper mapper;

    public ComposicaoController(ComposicaoService service, ComposicaoInfraMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<ComposicaoResponse> criar(
            @RequestBody @Valid ComposicaoRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(mapper.toInputDto(request));

        var uri = uriBuilder
                .path("/api/composicoes/{id}")
                .buildAndExpand(output.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(mapper.toResponseDto(output));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComposicaoResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(mapper.toResponseDto(service.consultar(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComposicaoResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid ComposicaoRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizar(id, mapper.toInputDto(request))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ComposicaoResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid ComposicaoParcialRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizarParcial(id, mapper.toInputDto(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ComposicaoResponse>> listar() {
        return ResponseEntity.ok(mapper.toResponseDto(service.listar()));
    }

    @PostMapping("/{idComposicao}/itens")
    public ResponseEntity<ComposicaoResponse> adicionarItem(
            @PathVariable @Valid UUID idComposicao, @Valid UUID idItem) {
        return ResponseEntity.ok(mapper.toResponseDto(service.adicionarItem(idComposicao, idItem)));
    }

    @DeleteMapping("/{idComposicao}/itens")
    public ResponseEntity<ComposicaoResponse> removerItem(@PathVariable @Valid UUID idComposicao, @Valid UUID idItem) {
        return ResponseEntity.ok(mapper.toResponseDto(service.removerItem(idComposicao, idItem)));
    }
}
