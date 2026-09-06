package br.com.concordia.features.obras.listarobras;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ListarObrasController {
    private final ListarObrasService service;

    public ListarObrasController(ListarObrasService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ListarObrasResponse>> listarObras() {
        return ResponseEntity.ok(service.listarObras());
    }
}
