package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;
import br.com.concordia.features.obras.common.EmpresaDto;

import java.time.ZoneId;
import java.util.UUID;

public record CriarObraResponse(UUID id, String descricao, StatusObra status, EmpresaDto empresa, UnidadeFederativa uf, ZoneId fusoHorario) {
}
