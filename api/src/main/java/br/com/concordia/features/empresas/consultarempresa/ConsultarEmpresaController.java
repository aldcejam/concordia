package br.com.concordia.features.empresas.consultarempresa;

import br.com.concordia.features.empresas.common.EmpresaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresas")
@Tag(name = "Empresas")
public class ConsultarEmpresaController {
    private final ConsultarEmpresaService service;

    public ConsultarEmpresaController(ConsultarEmpresaService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(service.consultar(id));
    }
}
