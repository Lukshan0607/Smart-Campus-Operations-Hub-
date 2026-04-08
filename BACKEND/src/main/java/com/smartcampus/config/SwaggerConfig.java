package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("SmartCampus - Facilities & Assets Catalogue API")
                .version("1.0")
                .description("Module A backend REST API for resources, availability, favorites, maintenance history, and QR codes."));
    }
}

