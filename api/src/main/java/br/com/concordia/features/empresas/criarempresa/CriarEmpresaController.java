package br.com.concordia.features.empresas.criarempresa;

import br.com.concordia.features.empresas.common.EmpresaRequest;
import br.com.concordia.features.empresas.common.EmpresaResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/empresas")
@Tag(name = "Empresas")
public class CriarEmpresaController {
    private final CriarEmpresaService service;

    public CriarEmpresaController(CriarEmpresaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @RequestBody @Valid EmpresaRequest request, UriComponentsBuilder uriBuilder) {
        var response = service.criar(request);

        var uri = uriBuilder
                .path("/api/empresas/{id}")
                .buildAndExpand(response.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }
}
