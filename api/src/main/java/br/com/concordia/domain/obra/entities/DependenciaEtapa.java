package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.obra.enums.TipoDependencia;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UuidGenerator;

/** Vínculo de precedência entre duas etapas da mesma obra (UC06). */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "dependencia_etapa",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_dependencia_etapa_par",
                        columnNames = {"id_etapa_predecessora", "id_etapa_sucessora"}))
public class DependenciaEtapa {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_obra", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Obra obra;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_etapa_predecessora", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private EtapaObra predecessora;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_etapa_sucessora", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private EtapaObra sucessora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private TipoDependencia tipo;

    @Column(name = "desfasamento_dias", nullable = false)
    private int desfasamentoDias;

    @Column(nullable = false)
    private boolean obrigatoria;

    @Column(name = "criada_em", nullable = false)
    private OffsetDateTime criadaEm;

    public DependenciaEtapa(
            @NonNull Obra obra,
            @NonNull EtapaObra predecessora,
            @NonNull EtapaObra sucessora,
            @NonNull TipoDependencia tipo,
            int desfasamentoDias,
            boolean obrigatoria) {
        if (predecessora == sucessora) {
            throw new IllegalArgumentException("Uma etapa não pode depender de si mesma.");
        }
        this.obra = obra;
        this.predecessora = predecessora;
        this.sucessora = sucessora;
        this.tipo = tipo;
        this.desfasamentoDias = desfasamentoDias;
        this.obrigatoria = obrigatoria;
        this.criadaEm = OffsetDateTime.now();
    }

    public void atualizar(@NonNull TipoDependencia tipo, int desfasamentoDias, boolean obrigatoria) {
        this.tipo = tipo;
        this.desfasamentoDias = desfasamentoDias;
        this.obrigatoria = obrigatoria;
    }
}
