package br.com.concordia.domain.composicao;

import br.com.concordia.domain.composicao.dtos.ComposicaoInput;
import br.com.concordia.domain.composicao.dtos.ComposicaoOutput;
import br.com.concordia.domain.composicao.entities.Composicao;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ComposicaoMapper {
    Composicao toEntity(ComposicaoInput request);

    ComposicaoOutput toOutputDto(Composicao composicao);

    List<ComposicaoOutput> toOutputDto(List<Composicao> composicoes);
}
