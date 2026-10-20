package br.com.concordia.infrastructure.obra;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.obra.importacao.DadosObraImportacao;
import br.com.concordia.domain.obra.importacao.ImportacaoPlanilhaService;
import br.com.concordia.domain.obra.importacao.PlanilhaOrcamento;
import br.com.concordia.infrastructure.obra.dtos.ImportacaoPlanilhaResponse;
import br.com.concordia.infrastructure.obra.dtos.ResumoImportacaoResponse;
import br.com.concordia.infrastructure.obra.planilha.OrcamentoPlanilhaParser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.time.ZoneId;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** UC01 — Importar Planilha Orçamentária (Excel). */
@RestController
@RequestMapping("/api/obras/importacoes")
@Tag(name = "Importação de Orçamento")
public class ImportacaoOrcamentoController {

    private final OrcamentoPlanilhaParser parser;
    private final ImportacaoPlanilhaService service;

    public ImportacaoOrcamentoController(OrcamentoPlanilhaParser parser, ImportacaoPlanilhaService service) {
        this.parser = parser;
        this.service = service;
    }

    @Operation(
            operationId = "preVisualizarPlanilha",
            summary = "Valida a planilha e devolve o resumo da EAP sem persistir",
            description = "Sempre responde 200; erros de parsing vêm em `erros` e `valida` indica se pode importar.")
    @PostMapping(value = "/pre-visualizacao", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumoImportacaoResponse> preVisualizar(@RequestPart("arquivo") MultipartFile arquivo)
            throws IOException {
        return ResponseEntity.ok(ResumoImportacaoResponse.from(service.resumir(ler(arquivo))));
    }

    @Operation(
            operationId = "importarPlanilha",
            summary = "Cria a obra a partir da planilha orçamentária",
            description = "Responde 422 com o relatório `erros` quando a planilha é inválida.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportacaoPlanilhaResponse> importar(
            @RequestPart("arquivo") MultipartFile arquivo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestParam("uf") UnidadeFederativa uf,
            @RequestParam(value = "fusoHorario", defaultValue = "America/Sao_Paulo") String fusoHorario,
            @RequestParam(value = "idEmpresa", required = false) UUID idEmpresa)
            throws IOException {
        var dados = new DadosObraImportacao(descricao, uf, zona(fusoHorario), idEmpresa);
        var resultado = service.importar(ler(arquivo), dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(ImportacaoPlanilhaResponse.from(resultado));
    }

    private PlanilhaOrcamento ler(MultipartFile arquivo) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Selecione um arquivo Excel (.xlsx ou .xls) com o orçamento.");
        }
        var nome = arquivo.getOriginalFilename() == null
                ? ""
                : arquivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!nome.endsWith(".xlsx") && !nome.endsWith(".xls")) {
            throw new IllegalArgumentException(
                    "Formato de arquivo não suportado: envie uma planilha Excel (.xlsx ou .xls).");
        }
        try (var conteudo = arquivo.getInputStream()) {
            return parser.ler(conteudo);
        }
    }

    private static ZoneId zona(String fusoHorario) {
        try {
            return ZoneId.of(fusoHorario);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Fuso horário inválido: %s".formatted(fusoHorario));
        }
    }
}
