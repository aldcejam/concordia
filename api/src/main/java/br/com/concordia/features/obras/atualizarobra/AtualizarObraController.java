package br.com.concordia.features.obras.atualizarobra;

import br.com.concordia.features.obras.common.ObraParcialRequest;
import br.com.concordia.features.obras.common.ObraRequest;
import br.com.concordia.features.obras.common.ObraResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class AtualizarObraController {
    private final AtualizarObraService service;

    public AtualizarObraController(AtualizarObraService service) {
        this.service = service;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizarObra(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraRequest request) {
        return ResponseEntity.ok(service.atualizarObra(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizarParcialObra(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraParcialRequest request) {
        return ResponseEntity.ok(service.atualizarParcialObra(id, request));
    }
}
