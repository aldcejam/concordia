package br.com.concordia.infrastructure.controllers.empresa.mappers;

import br.com.concordia.domain.empresa.dtos.EmpresaInput;
import br.com.concordia.domain.empresa.dtos.EmpresaOutput;
import br.com.concordia.infrastructure.controllers.empresa.dtos.EmpresaParcialRequest;
import br.com.concordia.infrastructure.controllers.empresa.dtos.EmpresaRequest;
import br.com.concordia.infrastructure.controllers.empresa.dtos.EmpresaResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmpresaInfraMapper {
    EmpresaInput toInputDto(EmpresaRequest request);

    EmpresaInput toInputDto(EmpresaParcialRequest request);

    EmpresaResponse toResponseDto(EmpresaOutput output);

    List<EmpresaResponse> toResponseDto(List<EmpresaOutput> outputs);
}
