package br.com.concordia.common.domain.entities;

import br.com.concordia.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "composicao")
public class Composicao {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Pattern(regexp = "^\\d{6}$", message = "O código deve conter entre 6 dígitos numéricos.")
    @Column(
            nullable = false,
            unique = true,
            length = 20,
            check =
                    @CheckConstraint(
                            name = "chk_composicao_codigo_formato",
                            constraint = "codigo SIMILAR TO '[0-9]{6}'"))
    @NotNull
    private String codigo;

    @Column(nullable = false)
    @NotNull
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @NotNull
    private UnidadeMedida unidade;

    @Column(
            nullable = false,
            check = @CheckConstraint(name = "chk_composicao_preco_positivo", constraint = "preco > 0"),
            precision = 15,
            scale = 2)
    @NotNull
    @Positive(message = "O preço deve ser maior que zero.")
    private BigDecimal preco;

    @OneToMany(mappedBy = "composicaoPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemComposicao> itens = new ArrayList<>();

    public Composicao(
            @NonNull String codigo,
            @NonNull String descricao,
            @NonNull UnidadeMedida unidade,
            @NonNull BigDecimal preco) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.unidade = unidade;
        this.preco = preco;
    }
}
