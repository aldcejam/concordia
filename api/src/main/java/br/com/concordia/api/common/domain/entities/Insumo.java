package br.com.concordia.api.common.domain.entities;

import br.com.concordia.api.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "insumo",
        check = @CheckConstraint(name = "chk_insumo_codigo_formato", constraint = "codigo SIMILAR TO '[0-9]{6}'"))
public class Insumo {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    @Pattern(regexp = "^\\d{6}$", message = "O código deve conter entre 6 dígitos numéricos.")
    @NotNull
    private String codigo;

    @Column(nullable = false)
    @NotNull
    private String descricao;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UnidadeMedida unidade;

    @Column(nullable = false, precision = 11, scale = 2)
    @Positive(message = "O preço deve ser maior que zero.")
    private BigDecimal preco;

    public Insumo(
            @NonNull String codigo,
            @NonNull String descricao,
            @NonNull UnidadeMedida unidade,
            @NonNull BigDecimal preco) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.unidade = unidade;
        this.preco = preco;
    }

    public void setPreco(@NonNull BigDecimal novoPreco) {
        if (novoPreco.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O preço do insumo não pode ser negativo.");
        }
        this.preco = novoPreco;
    }

    public void setDados(@NonNull String descricao, @NonNull UnidadeMedida unidade) {
        this.descricao = descricao;
        this.unidade = unidade;
    }
}
