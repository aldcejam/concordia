package br.com.concordia.features.obras.consultarobra;

import br.com.concordia.common.domain.entities.Obra;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConsultarObraMapper {
    ConsultarObraResponse toResponseDto(Obra obra);
}
