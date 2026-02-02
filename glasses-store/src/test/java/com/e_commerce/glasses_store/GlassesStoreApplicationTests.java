package com.e_commerce.glasses_store;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class GlassesStoreApplicationTests {

	@Test
	void contextLoads() {
	}

}
