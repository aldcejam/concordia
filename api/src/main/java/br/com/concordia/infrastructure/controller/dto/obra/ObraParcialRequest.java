package br.com.concordia.infrastructure.controller.dto.obra;

import br.com.concordia.domain.obra.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraParcialRequest(String descricao, UnidadeFederativa uf, ZoneId fusoHorario, UUID idEmpresa) {}
