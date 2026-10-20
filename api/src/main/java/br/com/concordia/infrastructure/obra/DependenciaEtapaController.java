package br.com.concordia.infrastructure.obra;

import br.com.concordia.domain.obra.dependencia.DependenciaEtapaService;
import br.com.concordia.domain.obra.dependencia.DependenciaInput;
import br.com.concordia.infrastructure.obra.dtos.DependenciaParcialRequest;
import br.com.concordia.infrastructure.obra.dtos.DependenciaRequest;
import br.com.concordia.infrastructure.obra.dtos.DependenciaResponse;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

/** UC06 — Configurar Dependências Construtivas. */
@RestController
@RequestMapping("/api/obras/{id}/dependencias")
@Tag(name = "Dependências")
public class DependenciaEtapaController {

    private final DependenciaEtapaService service;

    public DependenciaEtapaController(DependenciaEtapaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DependenciaResponse>> listarDependencias(@PathVariable UUID id) {
        return ResponseEntity.ok(
                service.listar(id).stream().map(DependenciaResponse::from).toList());
    }

    @Operation(
            summary = "Cria um vínculo de precedência entre duas etapas",
            description = "Responde 409 quando o vínculo já existe ou criaria um ciclo na EAP.")
    @PostMapping
    public ResponseEntity<DependenciaResponse> criarDependencia(
            @PathVariable UUID id, @RequestBody @Valid DependenciaRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(
                id,
                new DependenciaInput(
                        request.predecessoraId(),
                        request.sucessoraId(),
                        request.tipo(),
                        request.desfasamentoDias(),
                        request.obrigatoria()));
        var uri = uriBuilder
                .path("/api/obras/{id}/dependencias/{dependenciaId}")
                .buildAndExpand(id, output.id())
                .encode()
                .toUri();
        return ResponseEntity.created(uri).body(DependenciaResponse.from(output));
    }

    @PatchMapping("/{dependenciaId}")
    public ResponseEntity<DependenciaResponse> atualizarDependencia(
            @PathVariable UUID id,
            @PathVariable UUID dependenciaId,
            @RequestBody @Valid DependenciaParcialRequest request) {
        var output = service.atualizar(
                id,
                dependenciaId,
                new DependenciaInput(null, null, request.tipo(), request.desfasamentoDias(), request.obrigatoria()));
        return ResponseEntity.ok(DependenciaResponse.from(output));
    }

    @DeleteMapping("/{dependenciaId}")
    public ResponseEntity<Void> removerDependencia(@PathVariable UUID id, @PathVariable UUID dependenciaId) {
        service.remover(id, dependenciaId);
        return ResponseEntity.noContent().build();
    }
}
