package br.com.concordia.domain.obra;

import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.domain.obra.entities.Obra;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ObraMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "etapas", ignore = true)
    @Mapping(target = "eap", ignore = true)
    Obra toEntity(ObraInput request, Empresa empresa);

    ObraOutput toOutputDto(Obra obra);

    List<ObraOutput> toOutputDto(List<Obra> obras);
}
