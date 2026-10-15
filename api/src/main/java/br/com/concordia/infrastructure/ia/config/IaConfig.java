package br.com.concordia.infrastructure.ia.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ConcordiaIaProperties.class)
public class IaConfig {

    @Bean
    public RestClient iaRestClient(ConcordiaIaProperties properties) {
        var requestFactory = new JdkClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofSeconds(properties.timeoutSeconds()));

        var builder = RestClient.builder()
                .baseUrl(properties.getResolvedBaseUrl())
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        if (properties.isConfigured()) {
            builder.defaultHeader(
                    HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey().trim());
        }

        return builder.build();
    }
}
