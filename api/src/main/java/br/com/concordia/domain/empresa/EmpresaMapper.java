package br.com.concordia.domain.empresa;

import br.com.concordia.domain.empresa.dtos.EmpresaInput;
import br.com.concordia.domain.empresa.dtos.EmpresaOutput;
import br.com.concordia.domain.empresa.entities.Empresa;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EmpresaMapper {
    Empresa toEntity(EmpresaInput request);

    EmpresaOutput toOutputDto(Empresa empresa);

    List<EmpresaOutput> toOutputDto(List<Empresa> empresa);
}
