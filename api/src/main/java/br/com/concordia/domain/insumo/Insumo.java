package br.com.concordia.domain.insumo;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import br.com.concordia.domain.composicao.entities.ItemComposicao;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "insumo")
public class Insumo extends ItemComposicao {
    public Insumo(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {
        super(codigo, descricao, unidade, preco);
    }
}
