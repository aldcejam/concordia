package br.com.concordia.api.common.domain.entities;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "item_composicao",
        check =
                @CheckConstraint(
                        name = "chk_item_composicao_xor_tipo",
                        constraint =
                                "(id_insumo IS NOT NULL AND id_composicao_auxiliar IS NULL) OR (id_insumo IS NULL AND id_composicao_auxiliar IS NOT NULL)"))
public class ItemComposicao {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(
            precision = 15,
            scale = 7,
            nullable = false,
            check = @CheckConstraint(name = "chk_item_composicao_coeficiente_positivo", constraint = "coeficiente > 0"))
    @Positive(message = "O coeficiente deve ser maior que zero.")
    private BigDecimal coeficiente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_composicao_pai", nullable = false)
    private Composicao composicaoPai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_insumo")
    @Nullable
    private Insumo insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_composicao_auxiliar")
    @Nullable
    private Composicao composicaoAuxiliar;
}
