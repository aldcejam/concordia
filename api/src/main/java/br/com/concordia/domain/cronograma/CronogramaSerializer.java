package br.com.concordia.domain.cronograma;

public interface CronogramaSerializer {
    String escrever(Object valor);

    <T> T ler(String json, Class<T> tipo);
}
