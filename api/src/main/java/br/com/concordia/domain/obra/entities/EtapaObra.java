package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.cronograma.StatusEtapa;
import br.com.concordia.domain.obra.valueobjects.CpmInfo;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.ColumnDefault;
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

    @Column(nullable = false, columnDefinition = "text")
    private String descricao;

    private OffsetDateTime inicio;

    private OffsetDateTime fim;

    @Column(name = "prazo_esperado_dias")
    private Integer prazoEsperadoDias;

    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'NAO_INICIADA'")
    private StatusEtapa status = StatusEtapa.NAO_INICIADA;

    private OffsetDateTime inicioOriginal;
    private OffsetDateTime fimOriginal;
    private OffsetDateTime inicioReal;
    private OffsetDateTime fimReal;

    @Embedded
    private CpmInfo cpm = new CpmInfo();

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
        this(descricao, inicio, prazoEsperadoDias, inicio.getOffset());
    }

    public EtapaObra(
            @NonNull String descricao,
            @NonNull OffsetDateTime inicio,
            @NonNull Integer prazoEsperadoDias,
            @NonNull ZoneId fuso) {
        this.descricao = descricao;
        this.inicio = inicio;
        this.prazoEsperadoDias = prazoEsperadoDias;
        if (prazoEsperadoDias <= 0) throw new IllegalArgumentException("A duração deve ser positiva.");
        this.fim = inicio.atZoneSameInstant(fuso).plusDays(prazoEsperadoDias).toOffsetDateTime();
        this.inicioOriginal = inicio;
        this.fimOriginal = fim;
    }

    public void reprogramar(int ordem, OffsetDateTime inicio, OffsetDateTime fim) {
        if (inicioOriginal == null) inicioOriginal = this.inicio;
        if (fimOriginal == null) {
            fimOriginal = this.fim;
            if (fimOriginal == null && this.inicio != null && prazoEsperadoDias != null) {
                fimOriginal = this.inicio.plusDays(prazoEsperadoDias);
            }
        }
        this.ordem = ordem;
        this.inicio = inicio;
        this.fim = fim;
    }

    public void definirPredecessores(List<EtapaObra> etapas) {
        predecessores.clear();
        predecessores.addAll(etapas);
    }

    public void registrarExecucao(StatusEtapa status, OffsetDateTime inicioReal, OffsetDateTime fimReal) {
        if (this.status == StatusEtapa.CONCLUIDA) throw new IllegalArgumentException("A etapa já foi concluída.");
        if (status == StatusEtapa.NAO_INICIADA || inicioReal == null) {
            throw new IllegalArgumentException("Informe o início real da execução.");
        }
        if (this.inicioReal != null && !this.inicioReal.isEqual(inicioReal)) {
            throw new IllegalArgumentException("O início real já registrado deve ser preservado.");
        }
        if (status == StatusEtapa.CONCLUIDA && (fimReal == null || fimReal.isBefore(inicioReal))) {
            throw new IllegalArgumentException("Informe um término real posterior ao início.");
        }
        if (status == StatusEtapa.EM_ANDAMENTO && fimReal != null) {
            throw new IllegalArgumentException("Somente etapas concluídas podem ter término real.");
        }
        this.status = status;
        this.inicioReal = inicioReal;
        this.fimReal = fimReal;
    }
}
