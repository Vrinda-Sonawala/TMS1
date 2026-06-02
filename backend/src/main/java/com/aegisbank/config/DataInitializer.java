package com.aegisbank.config;

import com.aegisbank.entity.User;
import com.aegisbank.enums.UserRole;
import com.aegisbank.enums.UserStatus;
import com.aegisbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@aegiscapital.com")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@aegiscapital.com")
                    .phoneNumber("+1-555-0100")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(UserRole.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@aegiscapital.com / Admin@123");
        }
    }
}
