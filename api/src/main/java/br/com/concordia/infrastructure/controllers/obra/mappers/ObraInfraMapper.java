package br.com.concordia.infrastructure.controllers.obra.mappers;

import br.com.concordia.domain.obra.dtos.ImportacaoObraOutput;
import br.com.concordia.domain.obra.dtos.ObraInput;
import br.com.concordia.domain.obra.dtos.ObraOutput;
import br.com.concordia.infrastructure.controllers.obra.dtos.ImportacaoObraResponse;
import br.com.concordia.infrastructure.controllers.obra.dtos.ObraParcialRequest;
import br.com.concordia.infrastructure.controllers.obra.dtos.ObraRequest;
import br.com.concordia.infrastructure.controllers.obra.dtos.ObraResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ObraInfraMapper {
    ObraInput toInputDto(ObraRequest request);

    ObraInput toInputDto(ObraParcialRequest request);

    ObraResponse toResponseDto(ObraOutput output);

    List<ObraResponse> toResponseDto(List<ObraOutput> outputs);

    ImportacaoObraResponse toResponseDto(ImportacaoObraOutput output);
}
