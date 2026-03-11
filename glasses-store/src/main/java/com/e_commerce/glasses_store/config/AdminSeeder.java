package com.e_commerce.glasses_store.config;

import com.e_commerce.glasses_store.modules.auth.entity.Role;
import com.e_commerce.glasses_store.modules.auth.entity.User;
import com.e_commerce.glasses_store.modules.auth.repository.UserRepository;
import com.e_commerce.glasses_store.modules.product.entity.Brand;
import com.e_commerce.glasses_store.modules.product.entity.Category;
import com.e_commerce.glasses_store.modules.product.repository.BrandRepository;
import com.e_commerce.glasses_store.modules.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String adminEmail = "admin@gmail.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin123!"))
                    .fullName("Super Admin")
                    .phone("0999999999")
                    .role(Role.ADMIN)
                    .emailVerified(true) // Automatically verified
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Default admin account seeded successfully! Email: {} | Password: {}", adminEmail, "Admin123!");
        } else {
            log.debug("ℹ️ Admin account already exists ({}). Skipping seeding.", adminEmail);
        }

        if (brandRepository.count() == 0) {
            Brand brand = Brand.builder()
                    .name("EyseGlass")
                    .slug("eyseglass")
                    .description("Default Brand")
                    .build();
            brandRepository.save(brand);
            log.info("✅ Default Brand seeded successfully!");
        }

        if (categoryRepository.count() == 0) {
            Category category = Category.builder()
                    .name("Eyeglasses")
                    .slug("eyeglasses")
                    .description("Default Category")
                    .build();
            categoryRepository.save(category);
            log.info("✅ Default Category seeded successfully!");
        }
    }
}
