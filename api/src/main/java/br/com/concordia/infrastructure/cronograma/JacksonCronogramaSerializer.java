package br.com.concordia.infrastructure.cronograma;

import br.com.concordia.domain.cronograma.CronogramaSerializer;
import org.springframework.stereotype.Component;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;

@Component
public class JacksonCronogramaSerializer implements CronogramaSerializer {
    private final JsonMapper mapper;

    public JacksonCronogramaSerializer(JsonMapper mapper) {
        this.mapper = mapper.rebuild()
                .disable(
                        DateTimeFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE,
                        DateTimeFeature.WRITE_DATES_WITH_CONTEXT_TIME_ZONE)
                .build();
    }

    public String escrever(Object valor) {
        return mapper.writeValueAsString(valor);
    }

    public <T> T ler(String json, Class<T> tipo) {
        return mapper.readValue(json, tipo);
    }
}
