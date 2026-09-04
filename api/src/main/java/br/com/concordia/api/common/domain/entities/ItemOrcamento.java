package br.com.concordia.api.common.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@Table(
        name = "item_orcamento",
        check =
                @CheckConstraint(
                        name = "chk_item_orcamento_xor_tipo",
                        constraint =
                                "(id_insumo IS NOT NULL AND id_composicao IS NULL) OR (id_insumo IS NULL AND id_composicao IS NOT NULL)"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo", discriminatorType = DiscriminatorType.STRING)
public abstract class ItemOrcamento {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @NotNull
    @Column(
            nullable = false,
            check = @CheckConstraint(name = "chk_item_orcamento_quantidade_positiva", constraint = "quantidade > 0"),
            precision = 15,
            scale = 2)
    @Positive(message = "A quantidade deve ser maior que zero.")
    private BigDecimal quantidade;

    protected ItemOrcamento(@NonNull BigDecimal quantidade) {
        if (quantidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("A quantidade deve ser maior que zero.");
        }
        this.quantidade = quantidade;
    }
}
