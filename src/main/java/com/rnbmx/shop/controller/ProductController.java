package com.rnbmx.shop.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @GetMapping("/debug-all")
    public ResponseEntity<?> debugGetAllProducts() {
        logger.info("GET /api/products/debug-all - Richiesta debug di tutti i prodotti");

        try {
            List<Product> products = productService.getAllProducts();
            logger.info("Debug: Recuperati {} prodotti", products.size());

            // Crea una risposta dettagliata per il debug
            Map<String, Object> response = new HashMap<>();
            response.put("count", products.size());
            response.put("products", products);
            response.put("timestamp", new java.util.Date());

            // Dettagli su ogni prodotto
            List<Map<String, Object>> productsDetails = new ArrayList<>();
            for (Product product : products) {
                Map<String, Object> details = new HashMap<>();
                details.put("id", product.getId());
                details.put("name", product.getName());
                details.put("description", product.getDescription());
                details.put("price", product.getPrice());
                details.put("stockQuantity", product.getStockQuantity());
                details.put("category", product.getCategory());
                details.put("imageUrl", product.getImageUrl());
                details.put("image_url", product.getImageUrl());
                details.put("featured", product.isFeatured());
                details.put("brand", product.getBrand());
                details.put("createdAt", product.getCreatedAt());
                details.put("updatedAt", product.getUpdatedAt());

                if (product.getCategoryEntity() != null) {
                    details.put("categoryId", product.getCategoryEntity().getId());
                    details.put("categoryName", product.getCategoryEntity().getName());
                }

                productsDetails.add(details);
            }
            response.put("details", productsDetails);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore nel debug di tutti i prodotti: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products - Richiesta tutti i prodotti");
        logger.info("Headers - Authorization: {}", token);

        try {
            List<Product> products = productService.getAllProducts();
            logger.info("Recuperati {} prodotti", products.size());

            if (products.isEmpty()) {
                logger.warn("ATTENZIONE: Nessun prodotto trovato nel database!");
                logger.warn(
                        "Verifica se ci sono dati nella tabella 'products' o se il servizio productService sta funzionando correttamente");

                // Restituisci una risposta con informazioni di debug
                Map<String, Object> debugResponse = new HashMap<>();
                debugResponse.put("status", "warning");
                debugResponse.put("message", "Nessun prodotto trovato nel database");
                debugResponse.put("timestamp", new Date());
                return ResponseEntity.ok(debugResponse);
            }

            // Log dettagliato dei prodotti recuperati
            int count = 0;
            for (Product product : products) {
                count++;
                logger.info("Prodotto {}: ID={}, Nome={}, Categoria={}, Stock={}, ImageUrl={}",
                        count, product.getId(), product.getName(), product.getCategory(),
                        product.getStockQuantity(), product.getImageUrl());
            }

            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Errore nel recupero di tutti i prodotti: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore nel recupero dei prodotti: " + e.getMessage());
        }
    }
}