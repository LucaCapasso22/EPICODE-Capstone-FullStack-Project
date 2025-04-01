package com.rnbmx.shop.controller;

import com.rnbmx.shop.model.Product;
import com.rnbmx.shop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@CrossOrigin(origins = { "http://localhost:3000" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<?> debugGetAllProducts() {
        logger.info("GET /api/debug/products - Richiesta debug di tutti i prodotti");

        try {
            List<Product> products = productService.getAllProducts();
            logger.info("Debug: Recuperati {} prodotti", products.size());

            // Crea una risposta dettagliata per il debug
            Map<String, Object> response = new HashMap<>();
            response.put("count", products.size());
            response.put("products", products);
            response.put("timestamp", new Date());

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
}