package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.enums.UnidadeFederativa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZoneId;
import java.util.UUID;

public record CriarObraRequest(
        @NotBlank String descricao,
        @NotNull UnidadeFederativa uf,
        @NotNull ZoneId fusoHorario,
        UUID id_empresa) {}
