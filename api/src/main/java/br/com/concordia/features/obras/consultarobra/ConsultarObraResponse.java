package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.domain.entities.EtapaObra;
import br.com.concordia.common.domain.entities.ItemEap;
import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;
import br.com.concordia.features.obras.common.EmpresaDto;
import java.time.ZoneId;
import java.util.List;

public record ConsultarObraResponse(
        String descricao,
        StatusObra status,
        EmpresaDto empresa,
        UnidadeFederativa uf,
        ZoneId fusoHorario,
        List<EtapaObra> etapas,
        List<ItemEap> eap) {}
