package br.com.concordia.features.obras.deletarobra;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class DeletarObraController {
    private final DeletarObraService service;

    public DeletarObraController(DeletarObraService service) {
        this.service = service;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarObra(@PathVariable UUID id) {
        service.deletarObra(id);
        return ResponseEntity.noContent().build();
    }
}
