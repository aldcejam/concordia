package br.com.concordia.domain.obra.entities;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.empresa.entities.Empresa;
import br.com.concordia.domain.obra.enums.StatusObra;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "obra")
public class Obra {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusObra status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private UnidadeFederativa uf;

    @Column(nullable = false, length = 50)
    private ZoneId fusoHorario;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_obra")
    private List<EtapaObra> etapas = new ArrayList<>();

    @OneToMany(mappedBy = "obra", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemEap> eap = new ArrayList<>();

    public Obra(
            @NonNull String descricao, @NonNull UnidadeFederativa uf, @NonNull ZoneId fusoHorario, Empresa empresa) {
        this.descricao = descricao;
        this.empresa = empresa;
        this.uf = uf;
        this.fusoHorario = fusoHorario;
        this.status = StatusObra.EM_PLANEJAMENTO;
    }

    public void atualizar(
            @NonNull String descricao,
            @NonNull UnidadeFederativa uf,
            @NonNull ZoneId fusoHorario,
            @Nullable Empresa empresa) {
        this.descricao = descricao;
        this.uf = uf;
        this.fusoHorario = fusoHorario;
        this.empresa = empresa;
    }

    public void atualizarParcial(
            @Nullable String descricao,
            @Nullable UnidadeFederativa uf,
            @Nullable ZoneId fusoHorario,
            @Nullable Empresa empresa) {
        if (descricao != null) {
            this.descricao = descricao;
        }
        if (uf != null) {
            this.uf = uf;
        }
        if (fusoHorario != null) {
            this.fusoHorario = fusoHorario;
        }
        if (empresa != null) {
            this.empresa = empresa;
        }
    }
}
