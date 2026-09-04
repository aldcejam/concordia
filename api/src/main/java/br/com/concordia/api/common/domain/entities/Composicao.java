package br.com.concordia.api.common.domain.entities;

import br.com.concordia.api.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "composicao")
public class Composicao {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadeMedida unidade;

    @Column(nullable = false)
    private BigDecimal preco;

    @OneToMany(mappedBy = "composicaoPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemComposicao> itens;
}
