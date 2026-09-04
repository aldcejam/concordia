package br.com.concordia.api.common.domain.entities;

import br.com.concordia.api.common.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "insumo")
public class Insumo {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UnidadeMedida unidade;

    @Column(nullable = false, precision = 11, scale = 2)
    private BigDecimal preco;
}
