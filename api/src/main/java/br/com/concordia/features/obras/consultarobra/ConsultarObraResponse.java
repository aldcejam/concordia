package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.domain.entities.EtapaObra;
import br.com.concordia.common.domain.entities.ItemEap;
import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;

import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

public record ConsultarObraResponse (String descricao, StatusObra status, UUID idEmpresa, UnidadeFederativa uf, ZoneId fusoHorario, List<EtapaObra> etapas, List<ItemEap> eap){
}
