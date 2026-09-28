package br.com.concordia.infrastructure.composicao;

import br.com.concordia.domain.composicao.dtos.ComposicaoInput;
import br.com.concordia.domain.composicao.dtos.ComposicaoOutput;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoParcialRequest;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoRequest;
import br.com.concordia.infrastructure.composicao.dtos.ComposicaoResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ComposicaoInfraMapper {
    ComposicaoInput toInputDto(ComposicaoRequest request);

    ComposicaoInput toInputDto(ComposicaoParcialRequest request);

    ComposicaoResponse toResponseDto(ComposicaoOutput output);

    List<ComposicaoResponse> toResponseDto(List<ComposicaoOutput> outputs);
}
