package br.com.concordia.features.empresas.listarempresas;

import br.com.concordia.features.empresas.common.EmpresaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresas")
@Tag(name = "Empresas")
public class ListarEmpresasController {
    private final ListarEmpresasService service;

    public ListarEmpresasController(ListarEmpresasService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }
}
