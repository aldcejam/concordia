package br.com.concordia.features.obras.common;

import br.com.concordia.common.domain.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ObraMapper {
    @Mapping(target = "eap", ignore = true)
    @Mapping(target = "etapas", ignore = true)
    Obra toEntity(ObraRequest request, Empresa empresa);

    ObraResponse toResponseDto(Obra obra);
}
