package br.com.concordia.infrastructure.empresa;

import br.com.concordia.domain.empresa.dtos.EmpresaInput;
import br.com.concordia.domain.empresa.dtos.EmpresaOutput;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaParcialRequest;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaRequest;
import br.com.concordia.infrastructure.empresa.dtos.EmpresaResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmpresaInfraMapper {
    EmpresaInput toInputDto(EmpresaRequest request);

    EmpresaInput toInputDto(EmpresaParcialRequest request);

    EmpresaResponse toResponseDto(EmpresaOutput output);

    List<EmpresaResponse> toResponseDto(List<EmpresaOutput> outputs);
}
