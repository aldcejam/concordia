package br.com.concordia.features.obras.listarobras;

import br.com.concordia.features.obras.common.ObraResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ListarObrasController {
    private final ListarObrasService service;

    public ListarObrasController(ListarObrasService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ObraResponse>> listarObras() {
        return ResponseEntity.ok(service.listarObras());
    }
}
