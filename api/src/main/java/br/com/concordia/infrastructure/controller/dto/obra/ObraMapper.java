package br.com.concordia.infrastructure.controller.dto.obra;

import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.entities.Obra;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ObraMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "etapas", ignore = true)
    @Mapping(target = "eap", ignore = true)
    Obra toEntity(ObraRequest request, Empresa empresa);

    ObraResponse toResponseDto(Obra obra);

    List<ObraResponse> toResponseDto(List<Obra> obras);
}
