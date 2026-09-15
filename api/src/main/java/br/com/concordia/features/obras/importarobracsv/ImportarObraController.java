package br.com.concordia.features.obras.importarobrascsv;

import br.com.concordia.features.obras.common.ObraResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ImportarObrasCsvController {

    private final ImportarObrasCsvService service;

    public ImportarObrasCsvController(ImportarObrasCsvService service) {
        this.service = service;
    }

    @PostMapping("/importar-csv")
    public ResponseEntity<List<ObraResponse>> importar(
            @RequestParam("arquivo") MultipartFile arquivo) {
        var response = service.importar(arquivo);
        return ResponseEntity.ok(response);
    }
}