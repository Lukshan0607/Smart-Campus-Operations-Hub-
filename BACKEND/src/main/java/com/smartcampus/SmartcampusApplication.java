package com.smartcampus;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartcampusApplication {

	private static final Logger log = LoggerFactory.getLogger(SmartcampusApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(SmartcampusApplication.class, args);
		log.info("✅ Smart Campus Facilities & Assets REST API server started successfully.");
	}

	@Bean
	@ConditionalOnBean(DataSource.class)
	CommandLineRunner dbHealthCheck(DataSource dataSource) {
		return args -> {
			try (var connection = dataSource.getConnection()) {
				if (!connection.isClosed()) {
					log.info("✅ Successfully connected to the database: {}", connection.getMetaData().getURL());
				} else {
					log.warn("⚠ Database connection obtained but appears to be closed.");
				}
			} catch (Exception ex) {
				log.error("❌ Failed to connect to the database on startup.", ex);
			}
		};
	}
}
