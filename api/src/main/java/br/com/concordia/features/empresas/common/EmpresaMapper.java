package br.com.concordia.features.empresas.common;

import br.com.concordia.common.domain.entities.Empresa;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmpresaMapper {
    Empresa toEntity(EmpresaRequest request);

    EmpresaResponse toResponseDto(Empresa empresa);

    List<EmpresaResponse> toResponseDto(List<Empresa> empresas);
}
