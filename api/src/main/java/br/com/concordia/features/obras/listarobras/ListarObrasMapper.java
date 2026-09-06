package br.com.concordia.features.obras.listarobras;

import br.com.concordia.common.domain.entities.Obra;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ListarObrasMapper {
    List<ListarObrasResponse> toResponseDto(List<Obra> obras);
}
