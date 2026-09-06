package br.com.concordia.features.obras.criarobra;

import br.com.concordia.common.domain.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CriarObraMapper {
    @Mapping(target = "eap", ignore = true)
    @Mapping(target = "etapas", ignore = true)
    Obra toEntity(CriarObraRequest request, Empresa empresa);

    CriarObraResponse toResponseDto(Obra obra);
}
