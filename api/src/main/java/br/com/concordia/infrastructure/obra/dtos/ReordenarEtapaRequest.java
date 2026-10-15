package br.com.concordia.infrastructure.obra.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReordenarEtapaRequest(
        @NotNull(message = "O ID da etapa atrasada é obrigatório")
        UUID etapaAtrasadaId,

        @NotNull(message = "O ID da etapa para adiantamento é obrigatório")
        UUID etapaAdiantadaId) {}
