package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
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
