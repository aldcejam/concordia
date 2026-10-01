package br.com.concordia.infrastructure.obra;

import br.com.concordia.domain.obra.ImportacaoObraService;
import br.com.concordia.domain.obra.ObraService;
import br.com.concordia.infrastructure.obra.csv.ObraCsvParser;
import br.com.concordia.infrastructure.obra.dtos.ImportacaoObraResponse;
import br.com.concordia.infrastructure.obra.dtos.ObraParcialRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraResponse;
import br.com.concordia.infrastructure.obra.dtos.EtapaRequest;
import br.com.concordia.infrastructure.obra.dtos.EtapaResponse;
import br.com.concordia.infrastructure.obra.dtos.MedicaoRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/obras")
@Tag(name = "Obras")
public class ObraController {

    private final ObraService service;
    private final ImportacaoObraService importacaoService;
    private final ObraCsvParser csvParser;
    private final ObraInfraMapper mapper;

    public ObraController(
            ObraService service,
            ImportacaoObraService importacaoService,
            ObraCsvParser csvParser,
            ObraInfraMapper mapper) {
        this.service = service;
        this.importacaoService = importacaoService;
        this.csvParser = csvParser;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<ObraResponse> criar(
            @RequestBody @Valid ObraRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criar(mapper.toInputDto(request));

        var uri = uriBuilder
                .path("/api/obras/{id}")
                .buildAndExpand(output.id())
                .encode()
                .toUri();

        return ResponseEntity.created(uri).body(mapper.toResponseDto(output));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObraResponse> consultar(@PathVariable @Valid UUID id) {
        return ResponseEntity.ok(mapper.toResponseDto(service.consultar(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizar(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizar(id, mapper.toInputDto(request))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ObraResponse> atualizarParcial(
            @PathVariable @Valid UUID id, @RequestBody @Valid ObraParcialRequest request) {
        return ResponseEntity.ok(mapper.toResponseDto(service.atualizarParcial(id, mapper.toInputDto(request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable @Valid UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ObraResponse>> listar() {
        return ResponseEntity.ok(mapper.toResponseDto(service.listar()));
    }

    @GetMapping("/{id}/etapas")
    public ResponseEntity<List<EtapaResponse>> listarEtapas(@PathVariable UUID id) {
        return ResponseEntity.ok(service.listarEtapas(id).stream().map(EtapaResponse::from).toList());
    }

    @GetMapping("/{id}/etapas/{etapaId}")
    public ResponseEntity<EtapaResponse> consultarEtapa(@PathVariable UUID id, @PathVariable UUID etapaId) {
        return ResponseEntity.ok(EtapaResponse.from(service.consultarEtapa(id, etapaId)));
    }

    @PostMapping("/{id}/etapas")
    public ResponseEntity<EtapaResponse> criarEtapa(
            @PathVariable UUID id, @RequestBody @Valid EtapaRequest request, UriComponentsBuilder uriBuilder) {
        var output = service.criarEtapa(
                id,
                new br.com.concordia.domain.obra.dtos.EtapaInput(
                        request.nome(),
                        request.descricao(),
                        request.inicio(),
                        request.prazoEsperadoDias(),
                        request.idItemPai(),
                        request.posicao(),
                        request.codigoEap(),
                        request.bancoOrcamento(),
                        request.codigoComposicao(),
                        request.tipoComposicao(),
                        request.macroetapa(),
                        request.unidadeOrcamento(),
                        request.quantidadeOrcada(),
                        request.valorUnitarioOrcado(),
                        request.valorUnitarioBase(),
                        request.percentualBdi(),
                        request.valorTotalOrcado()));
        var uri = uriBuilder
                .path("/api/obras/{id}/etapas/{etapaId}")
                .buildAndExpand(id, output.id())
                .encode()
                .toUri();
        return ResponseEntity.created(uri).body(EtapaResponse.from(output));
    }

    @PatchMapping("/{id}/etapas/{etapaId}/orcamento")
    public ResponseEntity<EtapaResponse> atualizarDadosOrcamento(
            @PathVariable UUID id,
            @PathVariable UUID etapaId,
            @RequestBody @Valid EtapaRequest request) {
        var output = service.atualizarOrcamentoEtapa(
                id,
                etapaId,
                new br.com.concordia.domain.obra.dtos.EtapaInput(
                        request.nome(),
                        request.descricao(),
                        request.inicio(),
                        request.prazoEsperadoDias(),
                        request.idItemPai(),
                        request.posicao(),
                        request.codigoEap(),
                        request.bancoOrcamento(),
                        request.codigoComposicao(),
                        request.tipoComposicao(),
                        request.macroetapa(),
                        request.unidadeOrcamento(),
                        request.quantidadeOrcada(),
                        request.valorUnitarioOrcado(),
                        request.valorUnitarioBase(),
                        request.percentualBdi(),
                        request.valorTotalOrcado()));
        return ResponseEntity.ok(EtapaResponse.from(output));
    }

    @PostMapping("/{id}/etapas/{etapaId}/medicoes")
    public ResponseEntity<EtapaResponse> registrarMedicao(
            @PathVariable UUID id, @PathVariable UUID etapaId, @RequestBody @Valid MedicaoRequest request) {
        var output = service.registrarMedicao(
                id,
                etapaId,
                new br.com.concordia.domain.obra.dtos.MedicaoInput(
                        request.percentualExecutado(),
                        request.quantidadeExecutada(),
                        request.observacao(),
                        request.motivoAtraso(),
                        request.diasAtraso()));
        return ResponseEntity.ok(EtapaResponse.from(output));
    }

    @PostMapping(value = "/{id}/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportacaoObraResponse> importar(
            @PathVariable @Valid UUID id, @RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        if (arquivo.isEmpty()) {
            throw new IllegalArgumentException("O arquivo CSV não foi enviado ou está vazio.");
        }
        var input = csvParser.ler(arquivo.getInputStream());
        return ResponseEntity.ok(mapper.toResponseDto(importacaoService.importar(id, input)));
    }
}
