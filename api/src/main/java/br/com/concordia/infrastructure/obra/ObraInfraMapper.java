package br.com.concordia.infrastructure.obra;

import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.infrastructure.obra.dtos.ObraParcialRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraRequest;
import br.com.concordia.infrastructure.obra.dtos.ObraResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ObraInfraMapper {
    ObraInput toInputDto(ObraRequest request);

    ObraInput toInputDto(ObraParcialRequest request);

    ObraResponse toResponseDto(ObraOutput output);

    List<ObraResponse> toResponseDto(List<ObraOutput> outputs);
}
