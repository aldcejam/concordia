package br.com.concordia.infrastructure.cronograma;

import br.com.concordia.domain.cronograma.*;
import br.com.concordia.domain.cronograma.CronogramaDados.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/obras/{obraId}/cronograma")
public class CronogramaController {
    private final CronogramaService service;
    private final AnaliseAtrasoService analise;

    public CronogramaController(CronogramaService service, AnaliseAtrasoService analise) {
        this.service = service;
        this.analise = analise;
    }

    public record EtapaRequest(
            @NotBlank @Size(max = 500) String descricao,
            @NotNull OffsetDateTime inicio,
            @Min(1) @Max(3650) int duracaoDias,
            @NotNull List<@NotNull UUID> predecessores) {}

    public record AtrasoRequest(
            @NotNull UUID etapaId,
            @NotBlank @Size(max = 2000) String motivo,
            @Min(1) @Max(3650) int diasAtraso) {}

    public record SelecaoRequest(@NotNull List<@NotNull UUID> etapaIds) {}

    public record DependenciasRequest(@NotNull List<@NotNull UUID> predecessores) {}

    public record ExecucaoRequest(
            @NotNull StatusEtapa status, @NotNull OffsetDateTime inicioReal, OffsetDateTime fimReal) {}

    @GetMapping
    public Cronograma consultar(@PathVariable UUID obraId) {
        return service.consultar(obraId);
    }

    @PostMapping("/etapas")
    @ResponseStatus(HttpStatus.CREATED)
    public Etapa criarEtapa(@PathVariable UUID obraId, @Valid @RequestBody EtapaRequest request) {
        return service.criarEtapa(
                obraId, request.descricao(), request.inicio(), request.duracaoDias(), request.predecessores());
    }

    @PutMapping("/etapas/{etapaId}/dependencias")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dependencias(
            @PathVariable UUID obraId, @PathVariable UUID etapaId, @Valid @RequestBody DependenciasRequest request) {
        service.alterarDependencias(obraId, etapaId, request.predecessores());
    }

    @PatchMapping("/etapas/{etapaId}/execucao")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void execucao(
            @PathVariable UUID obraId, @PathVariable UUID etapaId, @Valid @RequestBody ExecucaoRequest request) {
        service.registrarExecucao(obraId, etapaId, request.status(), request.inicioReal(), request.fimReal());
    }

    @PostMapping("/atrasos")
    @ResponseStatus(HttpStatus.CREATED)
    public Atraso atraso(@PathVariable UUID obraId, @Valid @RequestBody AtrasoRequest request) {
        return service.registrarAtraso(obraId, request.etapaId(), request.motivo(), request.diasAtraso());
    }

    @PostMapping("/atrasos/{atrasoId}/analise")
    public Atraso analisar(@PathVariable UUID obraId, @PathVariable UUID atrasoId) {
        return analise.analisar(obraId, atrasoId);
    }

    @PostMapping("/atrasos/{atrasoId}/simulacao")
    public Simulacao simular(
            @PathVariable UUID obraId, @PathVariable UUID atrasoId, @Valid @RequestBody SelecaoRequest request) {
        return service.simular(obraId, atrasoId, request.etapaIds());
    }

    @PostMapping("/atrasos/{atrasoId}/aplicacao")
    public Atraso aplicar(
            @PathVariable UUID obraId,
            @PathVariable UUID atrasoId,
            @Valid @RequestBody SelecaoRequest request,
            Principal principal) {
        return service.aplicar(
                obraId, atrasoId, request.etapaIds(), principal == null ? "anonimo" : principal.getName());
    }
}
