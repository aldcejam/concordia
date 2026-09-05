package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.entities.Obra;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class CriarObraController {
    private final CriarObraService service;

    public CriarObraController(CriarObraService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Obra> criarObra(
            @RequestBody @Valid CriarObraRequest request, UriComponentsBuilder uriBuilder) {
        Obra obra = service.criarObra(request);

        URI uri = uriBuilder
                .path("/api/obras/{id}")
                .buildAndExpand(obra.getId())
                .encode()
                .toUri();
        return ResponseEntity.created(uri).body(obra);
    }
}
