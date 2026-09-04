package br.com.concordia.api.common.domain.entities;

import jakarta.persistence.*;
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
@Table(name = "nodo_eap")
public class NodoEap {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_obra", nullable = false)
    private Obra obra;

    @Column(nullable = false)
    private Double posicao = 1000.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nodo_pai")
    private NodoEap pai;

    @OneToMany(mappedBy = "pai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NodoEap> filhos = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_etapa_obra", unique = true)
    private EtapaObra etapa;

    public NodoEap(@NonNull Obra obra, @NonNull String nome, @NonNull NodoEap pai, Double posicao) {
        this.nome = nome;
        this.pai = pai;
        this.obra = obra;
        if (posicao != null) {
            this.posicao = posicao;
        }
    }

    public NodoEap(Obra obra, String nome, NodoEap pai, Double posicao, @NonNull EtapaObra etapa) {
        this(obra, nome, pai, posicao);
        this.etapa = etapa;
    }
}
