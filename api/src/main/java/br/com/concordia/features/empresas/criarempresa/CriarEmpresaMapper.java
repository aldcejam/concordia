package br.com.concordia.features.empresas.criarempresa;

import br.com.concordia.common.domain.entities.Empresa;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CriarEmpresaMapper {
    Empresa toEntity(CriarEmpresaRequest request);

    CriarEmpresaResponse toResponseDto(Empresa empresa);
}
