package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.insumo.Insumo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("insumo")
public class ItemOrcamentoInsumo extends ItemOrcamento {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo")
    @NotNull
    private Insumo insumo;

    public ItemOrcamentoInsumo(@NonNull Insumo insumo, @NonNull BigDecimal quantidade) {
        this.insumo = insumo;
        super(quantidade);
    }
}
