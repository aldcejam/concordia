package br.com.concordia.common.domain.entities;

import br.com.concordia.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "insumo")
public class Insumo {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(
            nullable = false,
            unique = true,
            length = 20,
            check = @CheckConstraint(name = "chk_insumo_codigo_formato", constraint = "codigo SIMILAR TO '[0-9]{6}'"))
    @Pattern(regexp = "^\\d{6}$", message = "O código deve conter 6 dígitos numéricos.")
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private UnidadeMedida unidade;

    @Column(
            nullable = false,
            precision = 11,
            scale = 2,
            check = @CheckConstraint(name = "chk_insumo_preco_positivo", constraint = "preco > 0"))
    @Positive(message = "O preço deve ser maior que zero.")
    private BigDecimal preco;

    public Insumo(
            @NonNull String codigo,
            @NonNull String descricao,
            @NonNull UnidadeMedida unidade,
            @NonNull BigDecimal preco) {
        if (preco.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O preço do insumo não pode ser negativo.");
        }
        this.codigo = codigo;
        this.descricao = descricao;
        this.unidade = unidade;
        this.preco = preco;
    }
}
