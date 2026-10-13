package br.com.concordia.domain.cronograma;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "atraso_etapa", indexes = @Index(name = "idx_atraso_obra_data", columnList = "obra_id,criado_em"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AtrasoEtapa {
    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID obraId;

    @Column(nullable = false)
    private UUID etapaId;

    @Column(nullable = false, length = 2000)
    private String motivo;

    @Column(nullable = false)
    private int diasAtraso;

    @Column(nullable = false)
    private OffsetDateTime criadoEm;

    private OffsetDateTime referencia;
    private OffsetDateTime aplicadoEm;
    private String autorAplicacao;

    @Column(nullable = false)
    private long versaoCronograma;

    @Column(nullable = false)
    private String status;

    private String erro;

    @Column(columnDefinition = "text")
    private String sugestoesJson;

    @Column(columnDefinition = "text")
    private String contextoJson;

    @Column(columnDefinition = "text")
    private String selecionadasJson;

    @Column(columnDefinition = "text")
    private String resultadoJson;

    public AtrasoEtapa(UUID obraId, UUID etapaId, String motivo, int dias, long versao, OffsetDateTime agora) {
        id = UUID.randomUUID();
        this.obraId = obraId;
        this.etapaId = etapaId;
        this.motivo = motivo;
        diasAtraso = dias;
        versaoCronograma = versao;
        criadoEm = agora;
        status = "REGISTRADO";
    }

    public void analisar(long versao, OffsetDateTime referencia, String contexto) {
        versaoCronograma = versao;
        this.referencia = referencia;
        contextoJson = contexto;
        sugestoesJson = null;
        erro = null;
        status = "ANALISANDO";
    }

    public void recomendar(String sugestoes) {
        sugestoesJson = sugestoes;
        status = "PRONTO";
    }

    public void falhar(String mensagem) {
        erro = mensagem;
        status = "FALHOU";
    }

    public void aplicar(String selecionadas, String resultado, OffsetDateTime agora, String autor) {
        selecionadasJson = selecionadas;
        resultadoJson = resultado;
        aplicadoEm = agora;
        autorAplicacao = autor;
        status = "APLICADO";
    }
}
