package br.com.concordia.features.obras.common;

import br.com.concordia.common.domain.enums.UnidadeFederativa;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZoneId;
import java.util.UUID;

public record ObraRequest(
        @NotBlank String descricao,
        @NotNull UnidadeFederativa uf,
        @NotNull ZoneId fusoHorario,
        @Nullable UUID idEmpresa) {}
