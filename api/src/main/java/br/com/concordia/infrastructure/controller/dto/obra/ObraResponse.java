package br.com.concordia.infrastructure.controller.dto.obra;

import br.com.concordia.domain.obra.enums.StatusObra;
import br.com.concordia.domain.obra.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraResponse(
        UUID id, String descricao, StatusObra status, EmpresaDto empresa, UnidadeFederativa uf, ZoneId fusoHorario) {}
