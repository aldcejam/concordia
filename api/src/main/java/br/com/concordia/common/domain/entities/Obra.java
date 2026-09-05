package br.com.concordia.common.domain.entities;

import br.com.concordia.common.domain.enums.StatusObra;
import br.com.concordia.common.domain.enums.UnidadeFederativa;
import jakarta.persistence.*;
import java.time.ZoneId;
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
}
