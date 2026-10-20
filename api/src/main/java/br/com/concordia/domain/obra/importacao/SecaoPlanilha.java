package br.com.concordia.domain.obra.importacao;

import java.math.BigDecimal;

/** Agrupamento da EAP (macroetapa ou subetapa), ex.: "1 SERVIÇOS PRELIMINARES" ou "1.1 CANTEIRO". */
public record SecaoPlanilha(int linha, String codigoEap, String nome, BigDecimal valorTotalInformado) {}
