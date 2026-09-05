package br.com.concordia.features.obras.consultarobra;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ConsultarObraController {
    private final ConsultarObraService service;

    public ConsultarObraController(ConsultarObraService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultarObraResponse> consultarObra(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(service.consultarObra(id));
    }
}
