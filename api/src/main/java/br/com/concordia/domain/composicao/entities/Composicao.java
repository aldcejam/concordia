package br.com.concordia.domain.composicao.entities;

import br.com.concordia.domain.common.enums.UnidadeMedida;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "composicao")
public class Composicao extends ItemComposicao {
    @OneToMany(mappedBy = "composicaoPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemComposicao> itens = new ArrayList<>();

    public Composicao(String codigo, String descricao, UnidadeMedida unidade, BigDecimal preco) {
        super(codigo, descricao, unidade, preco);
    }

    public List<UUID> getItens() {
        return itens.stream().map(ItemComposicao::getId).toList();
    }

    public Composicao adicionarItem(ItemComposicao item) {
        boolean jaExiste =
                itens.stream().anyMatch(i -> i.getId() != null && i.getId().equals(item.getId()));
        if (!jaExiste) {
            itens.add(item);
            item.setComposicaoPai(this);
        }
        return this;
    }

    public Composicao removerItem(ItemComposicao item) {
        itens.remove(item);
        item.setComposicaoPai(null);
        return this;
    }
}
