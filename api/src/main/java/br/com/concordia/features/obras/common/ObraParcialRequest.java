package br.com.concordia.features.obras.common;

import br.com.concordia.common.domain.enums.UnidadeFederativa;
import jakarta.annotation.Nullable;
import java.time.ZoneId;
import java.util.UUID;

public record ObraParcialRequest(
        @Nullable String descricao,
        @Nullable UnidadeFederativa uf,
        @Nullable ZoneId fusoHorario,
        @Nullable UUID idEmpresa) {}
