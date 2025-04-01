package com.rnbmx.shop.config;

import com.rnbmx.shop.model.Category;
import com.rnbmx.shop.model.Product;
import com.rnbmx.shop.repository.CategoryRepository;
import com.rnbmx.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) {
        // Inizializza le categorie
        List<Category> categories = Arrays.asList(
                new Category("Biciclette complete"),
                new Category("Componenti"),
                new Category("Accessori"),
                new Category("Abbigliamento"));
        categories.forEach(category -> {
            if (!categoryRepository.existsByName(category.getName())) {
                categoryRepository.save(category);
            }
        });

        // Inizializza i prodotti solo se non ce ne sono
        if (productRepository.count() == 0) {
            Category biciclette = categoryRepository.findByName("Biciclette complete").orElseThrow();
            Category componenti = categoryRepository.findByName("Componenti").orElseThrow();
            Category accessori = categoryRepository.findByName("Accessori").orElseThrow();
            Category abbigliamento = categoryRepository.findByName("Abbigliamento").orElseThrow();

            List<Product> products = Arrays.asList(
                    createProduct("BMX Freestyle Elite", "Bicicletta BMX professionale per freestyle e trick",
                            new BigDecimal("399.99"), 15, "https://example.com/images/bmx1.jpg", biciclette,
                            "Wethepeople", true),
                    createProduct("BMX Race Pro", "Bicicletta BMX da competizione ultra-leggera",
                            new BigDecimal("649.99"), 8, "https://example.com/images/bmx2.jpg", biciclette,
                            "Eastern Bikes", true),
                    createProduct("BMX Street Style", "Bicicletta BMX robusta per uso urbano",
                            new BigDecimal("299.99"), 22, "https://example.com/images/bmx3.jpg", biciclette, "Sunday",
                            false),
                    createProduct("Casco BMX Pro", "Casco professionale certificato per BMX",
                            new BigDecimal("89.99"), 30, "https://example.com/images/helmet1.jpg", accessori, "ProTec",
                            true),
                    createProduct("Manubrio Freestyle", "Manubrio in lega leggera per trick e acrobazie",
                            new BigDecimal("59.99"), 25, "https://example.com/images/handlebar1.jpg", componenti,
                            "RN BMX Shop", false),
                    createProduct("Ruota Anteriore 20\"", "Ruota anteriore da 20 pollici con cerchio rinforzato",
                            new BigDecimal("79.99"), 18, "https://example.com/images/wheel1.jpg", componenti, "Odyssey",
                            false),
                    createProduct("Ruota Posteriore 20\"", "Ruota posteriore da 20 pollici ad alta resistenza",
                            new BigDecimal("84.99"), 14, "https://example.com/images/wheel2.jpg", componenti, "Odyssey",
                            false),
                    createProduct("Pedali BMX Flat", "Pedali piatti con perno in acciaio e grip antiscivolo",
                            new BigDecimal("39.99"), 40, "https://example.com/images/pedals1.jpg", componenti, "Primo",
                            false),
                    createProduct("Guanti BMX Pro", "Guanti professionale per BMX con protezione",
                            new BigDecimal("29.99"), 50, "https://example.com/images/gloves1.jpg", abbigliamento,
                            "Fox Racing", true),
                    createProduct("Maglia BMX Team", "Maglia ufficiale del team BMX, traspirante",
                            new BigDecimal("49.99"), 35, "https://example.com/images/jersey1.jpg", abbigliamento,
                            "RN BMX Shop", false));

            products.forEach(productRepository::save);
        }
    }

    private Product createProduct(String name, String description, BigDecimal price, Integer stockQuantity,
            String imageUrl, Category category, String brand, boolean featured) {
        Product product = new Product(name, description, price, stockQuantity, imageUrl, category, brand);
        product.setFeatured(featured);
        return product;
    }
}