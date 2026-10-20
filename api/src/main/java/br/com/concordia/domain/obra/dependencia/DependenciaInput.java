package br.com.concordia.domain.obra.dependencia;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import java.util.UUID;

public record DependenciaInput(
        UUID predecessoraId, UUID sucessoraId, TipoDependencia tipo, Integer desfasamentoDias, Boolean obrigatoria) {}
