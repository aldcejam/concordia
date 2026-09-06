package br.com.concordia.features.obras.common;

import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraResponse(
        UUID id, String descricao, StatusObra status, EmpresaDto empresa, UnidadeFederativa uf, ZoneId fusoHorario) {}
