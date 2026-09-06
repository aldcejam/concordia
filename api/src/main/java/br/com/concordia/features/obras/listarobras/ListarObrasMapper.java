package br.com.concordia.features.obras.listarobras;

import br.com.concordia.common.domain.entities.Obra;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ListarObrasMapper {
    List<ListarObrasResponse> toResponseDto(List<Obra> obras);
}
