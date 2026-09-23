package br.com.concordia.domain.obra.dtos;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import java.time.ZoneId;
import java.util.UUID;

public record ObraInput(String descricao, UnidadeFederativa uf, ZoneId fusoHorario, UUID idEmpresa) {}
