package com.aegisbank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableTransactionManagement
public class AegisCapitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(AegisCapitalApplication.class, args);
    }
}
