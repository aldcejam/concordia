package br.com.concordia.api.common.domain.entities;

import br.com.concordia.api.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "composicao",
        check = @CheckConstraint(name = "chk_composicao_codigo_formato", constraint = "codigo SIMILAR TO '[0-9]{6}'"))
public class Composicao {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Pattern(regexp = "^\\d{6}$", message = "O código deve conter entre 6 dígitos numéricos.")
    @Column(nullable = false, unique = true, length = 20)
    @NotNull
    private String codigo;

    @Column(nullable = false)
    @NotNull
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private UnidadeMedida unidade;

    @Column(nullable = false)
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

    public List<ItemComposicao> getItens() {
        return Collections.unmodifiableList(this.itens);
    }

    public void adicionarItemInsumo(@NonNull BigDecimal coeficiente, @NonNull Insumo insumo) {
        ItemComposicao item = ItemComposicao.deInsumo(coeficiente, insumo, this);
        this.itens.add(item);
    }

    public void adicionarItemAuxiliar(@NonNull BigDecimal coeficiente, @NonNull Composicao auxiliar) {
        ItemComposicao item = ItemComposicao.deAuxiliar(coeficiente, auxiliar, this);
        this.itens.add(item);
    }

    public void removerItem(@NonNull ItemComposicao item) {
        this.itens.remove(item);
    }

    public void setPreco(@NonNull BigDecimal novoPreco) {
        if (novoPreco.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O preço da composição não pode ser negativo.");
        }
        this.preco = novoPreco;
    }
}
