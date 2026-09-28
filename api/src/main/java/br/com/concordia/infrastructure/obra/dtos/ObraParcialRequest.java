package br.com.concordia.infrastructure.obra.dtos;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraParcialRequest(String descricao, UnidadeFederativa uf, ZoneId fusoHorario, UUID idEmpresa) {}
