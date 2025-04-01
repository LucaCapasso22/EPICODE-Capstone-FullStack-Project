package com.rnbmx.shop;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@SpringBootApplication
public class ShopApplication {

    private static final Logger log = LoggerFactory.getLogger(ShopApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }

    @Bean
    public CommandLineRunner checkDatabase(ProductService productService, CategoryRepository categoryRepository) {
        return args -> {
            // Verifica le categorie
            log.info("Controllo delle categorie nel database...");
            List<Category> categories = categoryRepository.findAll();
            log.info("Categorie trovate: {}", categories.size());
            for (Category category : categories) {
                log.info("Categoria: id={}, nome={}", category.getId(), category.getName());
            }

            // Verifica i prodotti
            log.info("Controllo dei prodotti nel database...");
            List<Product> products = productService.getAllProducts();
            log.info("Prodotti trovati: {}", products.size());
            for (Product product : products) {
                log.info("Prodotto: id={}, nome={}, categoria={}, prezzo={}, stock={}",
                        product.getId(), product.getName(), product.getCategory(),
                        product.getPrice(), product.getStockQuantity());
            }

            // Se non ci sono prodotti, mostro un avviso
            if (products.isEmpty()) {
                log.warn("NESSUN PRODOTTO TROVATO NEL DATABASE! Verifica che la tabella 'products' contenga dati.");
                log.warn("Puoi inserire prodotti di esempio utilizzando lo script insert_test_products.sql");
            }
        };
    }
}