package br.com.concordia.infrastructure.insumo;

import br.com.concordia.domain.insumo.dtos.InsumoInput;
import br.com.concordia.domain.insumo.dtos.InsumoOutput;
import br.com.concordia.infrastructure.insumo.dtos.InsumoParcialRequest;
import br.com.concordia.infrastructure.insumo.dtos.InsumoRequest;
import br.com.concordia.infrastructure.insumo.dtos.InsumoResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InsumoInfraMapper {
    InsumoInput toInputDto(InsumoRequest request);

    InsumoInput toInputDto(InsumoParcialRequest request);

    InsumoResponse toResponseDto(InsumoOutput output);

    List<InsumoResponse> toResponseDto(List<InsumoOutput> outputs);
}
