package br.com.concordia.common.domain.entities;

import br.com.concordia.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private UnidadeMedida unidade;

    @Column(nullable = false, precision = 15, scale = 2)
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
