package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.composicao.entities.Composicao;
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
@DiscriminatorValue("composicao")
public class ItemOrcamentoComposicao extends ItemOrcamento {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_composicao")
    @NotNull
    private Composicao composicao;

    public ItemOrcamentoComposicao(@NonNull Composicao composicao, @NonNull BigDecimal quantidade) {
        this.composicao = composicao;
        super(quantidade);
    }
}
