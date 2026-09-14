package br.com.concordia.infrastructure.controller.dto.empresa;

import br.com.concordia.domain.empresa.entities.Empresa;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EmpresaMapper {
    Empresa toEntity(EmpresaRequest request);

    EmpresaResponse toResponseDto(Empresa empresa);

    List<EmpresaResponse> toResponseDto(List<Empresa> empresas);

    void updateFromRequest(EmpresaRequest request, @MappingTarget Empresa entity);
}
