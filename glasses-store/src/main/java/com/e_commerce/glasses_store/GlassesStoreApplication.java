package com.e_commerce.glasses_store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GlassesStoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(GlassesStoreApplication.class, args);
	}

}
