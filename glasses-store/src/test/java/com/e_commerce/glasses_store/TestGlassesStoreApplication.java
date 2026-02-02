package com.e_commerce.glasses_store;

import org.springframework.boot.SpringApplication;

public class TestGlassesStoreApplication {

	public static void main(String[] args) {
		SpringApplication.from(GlassesStoreApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
