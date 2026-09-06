package br.com.concordia.common.domain.valueobjects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CpmInfo {

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
}
