package br.com.concordia.domain.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum UnidadeMedida {
    KG("KG", "Quilograma"),
    G("G", "Grama"),
    TON("T", "Tonelada"),
    M("M", "Metro"),
    M2("M2", "Metro Quadrado"),
    M3("M3", "Metro Cúbico"),
    KM("KM", "Quilômetro"),
    KM_T("KM/T", "Quilômetro por Tonelada"),
    M3_KM("M3XKM", "Metro Cúbico por Quilômetro"),
    H("H", "Hora"),
    MES("MES", "Mês"),
    DIA("DIA", "Dia"),
    UN("UN", "Unidade"),
    MIL("MIL", "Milheiro"),
    CENT("CENT", "Centena"),
    DZ("DZ", "Dúzia"),
    PAR("PAR", "Par"),
    CJ("CJ", "Conjunto"),
    JG("JG", "Jogo"),
    KIT("KIT", "Kit"),
    L("L", "Litro"),
    GL("GL", "Galão"),
    CX("CX", "Caixa"),
    SC("SC", "Saco"),
    RL("RL", "Rolo"),
    TB("TB", "Tubo"),
    LATA("LATA", "Lata"),
    KWH("KWH", "Quilowatt-hora"),
    TX("TX", "Taxa"),
    VB("VB", "Verba");

    private final String sigla;
    private final String descricao;

    UnidadeMedida(String siglaCaixa, String descricao) {
        this.sigla = siglaCaixa;
        this.descricao = descricao;
    }

    @JsonValue
    public String getSigla() {
        return sigla;
    }

    @JsonCreator
    public static UnidadeMedida doTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String textoLimpo = texto.trim().toUpperCase();
        for (UnidadeMedida unidade : values()) {
            if (unidade.sigla.equalsIgnoreCase(textoLimpo) || unidade.name().equalsIgnoreCase(textoLimpo)) {
                return unidade;
            }
        }
        throw new IllegalArgumentException("Unidade de medida não reconhecida do SINAPI: " + texto);
    }
}
