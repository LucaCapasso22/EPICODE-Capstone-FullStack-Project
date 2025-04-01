package com.rnbmx.shop.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rnbmx.shop.model.User;
import com.rnbmx.shop.repository.UserRepository;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Commentato la configurazione per impedire il reset delle password all'avvio
// @Configuration
public class PasswordResetUtil {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetUtil.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Commentato il Bean per disabilitare il reset delle password all'avvio
    // @Bean
    public CommandLineRunner resetPasswordsAtStartup() {
        return args -> {
            logger.info("=== Reimpostazione password predefinite per test ===");

            // Elenco email per cui reimpostare la password
            String[] emails = {
                    "admin@rnbmx.com",
                    "lucacapassona@gmail.com",
                    "test@gmail.com"
            };

            // Password predefinita per tutti
            String defaultPassword = "password123";
            String encodedPassword = passwordEncoder.encode(defaultPassword);

            for (String email : emails) {
                Optional<User> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    // Salva la password precedente per riferimento
                    String oldPassword = user.getPassword();

                    // Imposta la nuova password
                    user.setPassword(encodedPassword);
                    userRepository.save(user);

                    logger.info("Password reimpostata per: {} (vecchio hash: {})", email, oldPassword);
                    logger.info("Nuovo hash: {}", encodedPassword);
                    logger.info("Credenziali di login: email={}, password={}", email, defaultPassword);
                } else {
                    logger.warn("Utente con email {} non trovato nel database", email);
                }
            }

            logger.info("====================================================");
            logger.info("Per effettuare il login, utilizza una di queste email con password: {}", defaultPassword);
            for (String email : emails) {
                logger.info(" - {}", email);
            }
            logger.info("====================================================");
        };
    }
}