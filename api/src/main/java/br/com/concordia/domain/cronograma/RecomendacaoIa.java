package br.com.concordia.domain.cronograma;

import br.com.concordia.domain.cronograma.CronogramaDados.Contexto;
import br.com.concordia.domain.cronograma.CronogramaDados.Sugestao;
import java.util.List;

public interface RecomendacaoIa {
    List<Sugestao> recomendar(Contexto contexto);
}
