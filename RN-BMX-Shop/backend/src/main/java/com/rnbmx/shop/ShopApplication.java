package com.rnbmx.shop;

import com.rnbmx.shop.model.ERole;
import com.rnbmx.shop.model.Role;
import com.rnbmx.shop.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class ShopApplication {
    private static final Logger logger = LoggerFactory.getLogger(ShopApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeRoles(@Autowired RoleRepository roleRepository) {
        return args -> {
            logger.info("Inizializzazione dei ruoli...");
            for (ERole role : ERole.values()) {
                if (!roleRepository.findByName(role).isPresent()) {
                    roleRepository.save(new Role(role));
                    logger.info("Ruolo creato: {}", role.name());
                } else {
                    logger.info("Ruolo già esistente: {}", role.name());
                }
            }
            logger.info("Inizializzazione dei ruoli completata.");
        };
    }
}