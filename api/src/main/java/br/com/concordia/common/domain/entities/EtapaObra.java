package br.com.concordia.common.domain.entities;

import jakarta.persistence.*;
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

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private OffsetDateTime inicio;

    private OffsetDateTime fim;

    @Column(name = "prazo_esperado_dias")
    private Integer prazoEsperadoDias;

    @Column(name = "early_start")
    private OffsetDateTime earlyStart;

    @Column(name = "early_finish")
    private OffsetDateTime earlyFinish;

    @Column(name = "late_start")
    private OffsetDateTime lateStart;

    @Column(name = "late_finish")
    private OffsetDateTime lateFinish;

    @Column(name = "folga_dias")
    private Integer folgaDias;

    @Column(name = "caminho_critico", nullable = false)
    private Boolean caminhoCritico = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "etapa_obra_cpm",
            joinColumns = @JoinColumn(name = "id_etapa_sucessora"),
            inverseJoinColumns = @JoinColumn(name = "id_etapa_predecessora"))
    private List<EtapaObra> predecessores = new ArrayList<>();

    @ManyToMany(mappedBy = "predecessores", fetch = FetchType.LAZY)
    private List<EtapaObra> sucessores = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_etapa_obra", nullable = false)
    private List<ItemOrcamento> orcamentos = new ArrayList<>();

    public EtapaObra(@NonNull String descricao, @NonNull OffsetDateTime inicio, @NonNull Integer prazoEsperadoDias) {
        if (prazoEsperadoDias <= 0) {
            throw new IllegalArgumentException("O prazo esperado em dias deve ser maior que zero.");
        }
        this.descricao = descricao;
        this.inicio = inicio;
        this.prazoEsperadoDias = prazoEsperadoDias;
    }
}
