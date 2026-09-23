package br.com.concordia.domain.composicao.entities;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "item_composicao")
public abstract class ItemComposicao {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private UnidadeMedida unidade;

    @Column(nullable = false, precision = 11, scale = 2)
    private BigDecimal preco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_composicao_pai")
    private Composicao composicaoPai;

    protected ItemComposicao(
            @NonNull String codigo,
            @NonNull String descricao,
            @NonNull UnidadeMedida unidade,
            @NonNull BigDecimal preco) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.unidade = unidade;
        this.preco = preco;
    }

    public void atualizar(
            @NonNull String codigo,
            @NonNull String descricao,
            @NonNull UnidadeMedida unidade,
            @NonNull BigDecimal preco) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.unidade = unidade;
        this.preco = preco;
    }

    public void atualizarParcial(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {
        if (codigo != null) {
            this.codigo = codigo;
        }
        if (descricao != null) {
            this.descricao = descricao;
        }
        if (unidade != null) {
            this.unidade = unidade;
        }
        if (preco != null) {
            this.preco = preco;
        }
    }

    protected void setComposicaoPai(Composicao composicao) {
        composicaoPai = composicao;
    }
}
