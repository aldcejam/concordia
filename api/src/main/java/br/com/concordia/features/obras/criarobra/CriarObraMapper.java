package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.entities.Empresa;
import br.com.concordia.common.domain.entities.Obra;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CriarObraMapper {
    Obra toEntity(CriarObraRequest request, Empresa empresa);
}
