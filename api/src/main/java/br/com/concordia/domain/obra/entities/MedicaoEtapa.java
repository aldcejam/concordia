package br.com.concordia.domain.obra.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "medicao_etapa")
public class MedicaoEtapa {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_etapa_obra", nullable = false)
    private EtapaObra etapa;

    @Column(name = "percentual_executado", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualExecutado;

    @Column(name = "quantidade_executada", nullable = false, precision = 15, scale = 2)
    private BigDecimal quantidadeExecutada;

    @Column(length = 1000)
    private String observacao;

    @Column(name = "motivo_atraso", length = 500)
    private String motivoAtraso;

    @Column(name = "dias_atraso")
    private Integer diasAtraso;

    @Column(name = "registrada_em", nullable = false)
    private OffsetDateTime registradaEm;

    MedicaoEtapa(
            @NonNull EtapaObra etapa,
            @NonNull BigDecimal percentualExecutado,
            @NonNull BigDecimal quantidadeExecutada,
            String observacao,
            String motivoAtraso,
            Integer diasAtraso) {
        this.etapa = etapa;
        this.percentualExecutado = percentualExecutado;
        this.quantidadeExecutada = quantidadeExecutada;
        this.observacao = observacao;
        this.motivoAtraso = motivoAtraso;
        this.diasAtraso = diasAtraso;
        this.registradaEm = OffsetDateTime.now();
    }
}
