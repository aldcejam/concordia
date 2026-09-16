package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.obra.enums.StatusObra;
import br.com.concordia.domain.obra.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraResponse(
        UUID id, String descricao, StatusObra status, UUID id_empresa, UnidadeFederativa uf, ZoneId fusoHorario) {}
