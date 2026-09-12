package br.com.concordia.features.empresas.atualizarempresa;

import br.com.concordia.features.empresas.common.EmpresaParcialRequest;
import br.com.concordia.features.empresas.common.EmpresaRequest;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresas")
@Tag(name = "Empresas")
public class AtualizarEmpresaController {
    private final AtualizarEmpresaService service;

    public AtualizarEmpresaController(AtualizarEmpresaService service) {
        this.service = service;
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid EmpresaParcialRequest request) {
        return ResponseEntity.ok(service.atualizarParcial(id, request));
    }
}
