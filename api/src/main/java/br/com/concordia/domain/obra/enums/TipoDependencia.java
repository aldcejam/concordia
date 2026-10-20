package br.com.concordia.domain.obra.enums;

/** Tipos de precedência entre etapas (RF03). */
public enum TipoDependencia {
    /** Fim → Início: a sucessora só inicia após o término da predecessora. */
    FI,
    /** Início → Início: a sucessora pode iniciar assim que a predecessora iniciar. */
    II,
    /** Fim → Fim: a sucessora só termina após o término da predecessora; não bloqueia o início. */
    FF
}
