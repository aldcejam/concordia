package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.obra.valueobjects.CpmInfo;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "etapa_obra")
public class EtapaObra {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false, length = 2000)
    private String descricao;

    private OffsetDateTime inicio;

    private OffsetDateTime fim;

    @Column(name = "prazo_esperado_dias")
    private Integer prazoEsperadoDias;

    @Embedded
    private CpmInfo cpm = new CpmInfo();

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_etapa_obra", nullable = false)
    private List<ItemOrcamento> orcamentos = new ArrayList<>();

    @OneToMany(mappedBy = "etapa", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("registradaEm ASC")
    private List<MedicaoEtapa> medicoes = new ArrayList<>();

    public EtapaObra(@NonNull String descricao, OffsetDateTime inicio, Integer prazoEsperadoDias) {
        this.descricao = descricao;
        this.inicio = inicio;
        this.prazoEsperadoDias = prazoEsperadoDias;
    }

    public BigDecimal percentualAtual() {
        return medicoes.isEmpty()
                ? BigDecimal.ZERO
                : medicoes.get(medicoes.size() - 1).getPercentualExecutado();
    }

    public MedicaoEtapa registrarMedicao(
            @NonNull BigDecimal percentualExecutado,
            @NonNull BigDecimal quantidadeExecutada,
            String observacao,
            String motivoAtraso,
            Integer diasAtraso) {
        var medicao =
                new MedicaoEtapa(this, percentualExecutado, quantidadeExecutada, observacao, motivoAtraso, diasAtraso);
        medicoes.add(medicao);
        return medicao;
    }
}
