package br.com.concordia.features.obras.listarobras;


import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;
import br.com.concordia.features.obras.common.EmpresaDto;

import java.time.ZoneId;
import java.util.UUID;

public record ListarObrasResponse(UUID id, String descricao, StatusObra status, EmpresaDto empresa, UnidadeFederativa uf, ZoneId fusoHorario) {
}