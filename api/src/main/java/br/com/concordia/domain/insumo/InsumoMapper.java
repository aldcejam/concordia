package br.com.concordia.domain.insumo;

import br.com.concordia.domain.insumo.dtos.InsumoInput;
import br.com.concordia.domain.insumo.dtos.InsumoOutput;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface InsumoMapper {
    Insumo toEntity(InsumoInput input);

    InsumoOutput toOutputDto(Insumo insumo);

    List<InsumoOutput> toOutputDto(List<Insumo> insumos);
}
