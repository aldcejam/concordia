package br.com.concordia.domain.obra.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
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
@Table(name = "item_eap")
public class ItemEap {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false, length = 2000)
    private String nome;

    @Column(name = "codigo_eap", length = 80)
    private String codigoEap;

    @Column(name = "banco_orcamento", length = 80)
    private String bancoOrcamento;

    @Column(name = "codigo_composicao", length = 80)
    private String codigoComposicao;

    @Column(name = "tipo_composicao", length = 160)
    private String tipoComposicao;

    @Column(name = "macroetapa", length = 255)
    private String macroetapa;

    @Column(name = "unidade_orcamento", length = 40)
    private String unidadeOrcamento;

    @Column(name = "quantidade_orcada", precision = 19, scale = 4)
    private BigDecimal quantidadeOrcada;

    @Column(name = "valor_unitario_orcado", precision = 19, scale = 4)
    private BigDecimal valorUnitarioOrcado;

    @Column(name = "valor_unitario_base", precision = 19, scale = 4)
    private BigDecimal valorUnitarioBase;

    @Column(name = "percentual_bdi", precision = 7, scale = 4)
    private BigDecimal percentualBdi;

    @Column(name = "valor_total_orcado", precision = 19, scale = 2)
    private BigDecimal valorTotalOrcado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_obra", nullable = false)
    private Obra obra;

    @Column(nullable = false)
    private Double posicao = 1000.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_item_pai")
    private ItemEap pai;

    @OneToMany(mappedBy = "pai", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemEap> filhos = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_etapa_obra", unique = true)
    private EtapaObra etapa;

    public ItemEap(@NonNull Obra obra, @NonNull String nome, @NonNull ItemEap pai, Double posicao) {
        this.nome = nome;
        this.pai = pai;
        this.obra = obra;
        if (posicao != null) {
            this.posicao = posicao;
        }
    }

    public ItemEap(@NonNull Obra obra, @NonNull String nome, Double posicao, @NonNull EtapaObra etapa) {
        this.obra = obra;
        this.nome = nome;
        this.etapa = etapa;
        if (posicao != null) {
            this.posicao = posicao;
        }
    }

    public ItemEap(Obra obra, String nome, ItemEap pai, Double posicao, @NonNull EtapaObra etapa) {
        this(obra, nome, pai, posicao);
        this.etapa = etapa;
    }

    public void atualizarDadosOrcamento(
            String nome,
            String codigoEap,
            String bancoOrcamento,
            String codigoComposicao,
            String tipoComposicao,
            String macroetapa,
            String unidadeOrcamento,
            BigDecimal quantidadeOrcada,
            BigDecimal valorUnitarioOrcado,
            BigDecimal valorUnitarioBase,
            BigDecimal percentualBdi,
            BigDecimal valorTotalOrcado) {
        this.nome = nome;
        this.codigoEap = codigoEap;
        this.bancoOrcamento = bancoOrcamento;
        this.codigoComposicao = codigoComposicao;
        this.tipoComposicao = tipoComposicao;
        this.macroetapa = macroetapa;
        this.unidadeOrcamento = unidadeOrcamento;
        this.quantidadeOrcada = quantidadeOrcada;
        this.valorUnitarioOrcado = valorUnitarioOrcado;
        this.valorUnitarioBase = valorUnitarioBase;
        this.percentualBdi = percentualBdi;
        this.valorTotalOrcado = valorTotalOrcado;
    }

}
