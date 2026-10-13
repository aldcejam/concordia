package br.com.concordia.infrastructure.cronograma;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CronogramaConfig {
    @Bean
    Clock cronogramaClock() {
        return Clock.systemUTC();
    }
}
