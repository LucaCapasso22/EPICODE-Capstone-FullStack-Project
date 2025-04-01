package com.rnbmx.shop.controller;

import com.rnbmx.shop.model.Product;
import com.rnbmx.shop.model.Category;
import com.rnbmx.shop.service.ProductService;
import com.rnbmx.shop.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletResponse;

@CrossOrigin(origins = {
        "http://localhost:3000" }, allowedHeaders = "*", exposedHeaders = "*", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<?> getAllProducts(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products - Richiesta tutti i prodotti");
        logger.info("Headers - Authorization: {}", token);

        try {
            List<Product> products = productService.getAllProducts();
            logger.info("Recuperati {} prodotti", products.size());

            // Log dettagliato dei prodotti recuperati
            for (Product product : products) {
                logger.debug("Prodotto: ID={}, Nome={}, Categoria={}, Stock={}, ImageUrl={}",
                        product.getId(), product.getName(), product.getCategory(),
                        product.getStockQuantity(), product.getImageUrl());
            }

            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Errore nel recupero di tutti i prodotti: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore nel recupero dei prodotti: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products/{} - Richiesta prodotto", id);
        logger.info("Headers - Authorization: {}", token);

        Optional<Product> product = productService.getProductById(id);
        if (product.isPresent()) {
            logger.info("Prodotto con ID {} trovato e restituito", id);
            return ResponseEntity.ok(product.get());
        }

        logger.warn("Prodotto con ID {} non trovato", id);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedProducts(
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products/featured - Richiesta prodotti in evidenza");
        logger.info("Headers - Authorization: {}", token);
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products/category/{} - Richiesta prodotti per categoria", category);
        logger.info("Headers - Authorization: {}", token);

        Optional<Category> categoryObj = categoryRepository.findByName(category);
        if (categoryObj.isEmpty()) {
            logger.warn("Categoria {} non trovata", category);
            return ResponseEntity.notFound().build();
        }

        List<Product> products = productService.getProductsByCategory(categoryObj.get());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products/categories - Richiesta categorie");
        logger.info("Headers - Authorization: {}", token);

        try {
            List<Category> categoriesList = categoryRepository.findAll();

            // Restituisce l'elenco completo delle categorie come oggetti
            logger.info("Recuperate {} categorie", categoriesList.size());
            for (Category cat : categoriesList) {
                logger.info("Categoria: id={}, nome={}", cat.getId(), cat.getName());
            }

            return ResponseEntity.ok(categoriesList);
        } catch (Exception e) {
            logger.error("Errore nel recupero delle categorie: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore nel recupero delle categorie: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> productData,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("POST /api/products - Richiesta creazione prodotto");
        logger.info("Request body: {}", productData);
        logger.info("Headers - Authorization: {}", token);

        try {
            // Log dettagliati per i dati di input
            logger.info("Dati ricevuti per la creazione del prodotto:");
            productData.forEach((key, value) -> {
                logger.info("  {} = {} (tipo: {})", key, value, value != null ? value.getClass().getName() : "null");
            });

            // Estrai i dati dal prodotto
            String name = (String) productData.get("name");
            String description = (String) productData.get("description");

            Object priceObj = productData.get("price");
            logger.info("Valore del prezzo: {} di tipo {}", priceObj,
                    priceObj != null ? priceObj.getClass().getName() : "null");
            Double price;
            if (priceObj instanceof Double) {
                price = (Double) priceObj;
            } else if (priceObj instanceof Integer) {
                price = ((Integer) priceObj).doubleValue();
            } else if (priceObj instanceof String) {
                price = Double.parseDouble((String) priceObj);
            } else {
                return ResponseEntity.badRequest().body("Formato del prezzo non valido: " + priceObj);
            }

            // Gestione unificata di stockQuantity e stock_quantity
            Object stockObj = productData.get("stockQuantity");
            if (stockObj == null) {
                stockObj = productData.get("stock_quantity");
                if (stockObj == null) {
                    stockObj = productData.get("stock");
                }
            }
            logger.info("Valore dello stock: {} di tipo {}", stockObj,
                    stockObj != null ? stockObj.getClass().getName() : "null");
            Integer stockQuantity;
            if (stockObj instanceof Integer) {
                stockQuantity = (Integer) stockObj;
            } else if (stockObj instanceof Double) {
                stockQuantity = ((Double) stockObj).intValue();
            } else if (stockObj instanceof String) {
                stockQuantity = Integer.parseInt((String) stockObj);
            } else {
                stockQuantity = 0; // Default
            }

            // Gestione unificata di imageUrl e image_url
            String imageUrl = (String) productData.get("imageUrl");
            if (imageUrl == null) {
                imageUrl = (String) productData.get("image_url");
            }

            // Gestione del campo brand obbligatorio
            String brand = (String) productData.get("brand");
            if (brand == null || brand.trim().isEmpty()) {
                brand = "RN BMX Shop"; // Valore predefinito se non specificato
            }

            Object featuredObj = productData.get("featured");
            logger.info("Valore di featured: {} di tipo {}", featuredObj,
                    featuredObj != null ? featuredObj.getClass().getName() : "null");
            Boolean featured;
            if (featuredObj instanceof Boolean) {
                featured = (Boolean) featuredObj;
            } else if (featuredObj instanceof String) {
                featured = Boolean.parseBoolean((String) featuredObj);
            } else {
                featured = false; // Default
            }

            // MODIFICA: Gestione migliorata della categoria
            Category category = null;
            Long categoryId = null;

            // Prima controlliamo se è stato fornito un ID di categoria
            Object categoryIdObj = productData.get("categoryId");
            if (categoryIdObj != null) {
                if (categoryIdObj instanceof Integer) {
                    categoryId = ((Integer) categoryIdObj).longValue();
                } else if (categoryIdObj instanceof Long) {
                    categoryId = (Long) categoryIdObj;
                } else if (categoryIdObj instanceof String) {
                    try {
                        categoryId = Long.parseLong((String) categoryIdObj);
                    } catch (NumberFormatException e) {
                        // Non è un formato numerico valido, ignora
                    }
                }
            }

            // Se abbiamo un ID categoria, cerca la categoria per ID
            if (categoryId != null) {
                logger.info("Ricerca categoria per ID: {}", categoryId);
                Optional<Category> categoryById = categoryRepository.findById(categoryId);
                if (categoryById.isPresent()) {
                    category = categoryById.get();
                    logger.info("Categoria trovata per ID {}: {}", categoryId, category.getName());
                } else {
                    logger.warn("Categoria con ID {} non trovata", categoryId);
                }
            }

            // Se non abbiamo trovato la categoria per ID, verifichiamo se è stata fornita
            // come oggetto
            if (category == null) {
                Object categoryObj = productData.get("categoryEntity");
                logger.info("Valore della categoria: {} di tipo {}", categoryObj,
                        categoryObj != null ? categoryObj.getClass().getName() : "null");

                if (categoryObj instanceof Map) {
                    // La categoria è un oggetto, estrai l'ID o il nome
                    Map<String, Object> categoryMap = (Map<String, Object>) categoryObj;
                    Object catIdObj = categoryMap.get("id");

                    if (catIdObj != null) {
                        logger.info("Trovato ID categoria nell'oggetto: {}", catIdObj);
                        if (catIdObj instanceof Integer) {
                            categoryId = ((Integer) catIdObj).longValue();
                        } else if (catIdObj instanceof Long) {
                            categoryId = (Long) catIdObj;
                        } else if (catIdObj instanceof String) {
                            try {
                                categoryId = Long.parseLong((String) catIdObj);
                            } catch (NumberFormatException e) {
                                // Non è un formato numerico valido, ignora
                            }
                        }

                        if (categoryId != null) {
                            Optional<Category> categoryById = categoryRepository.findById(categoryId);
                            if (categoryById.isPresent()) {
                                category = categoryById.get();
                                logger.info("Categoria trovata per ID {}: {}", categoryId, category.getName());
                            } else {
                                logger.warn("Categoria con ID {} non trovata", categoryId);
                            }
                        }
                    }

                    // Se ancora non abbiamo trovato la categoria, proviamo con il nome
                    if (category == null && categoryMap.containsKey("name")) {
                        String categoryName = (String) categoryMap.get("name");
                        logger.info("Ricerca categoria per nome: {}", categoryName);
                        Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                        if (categoryByName.isPresent()) {
                            category = categoryByName.get();
                            logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                        } else {
                            logger.warn("Categoria con nome {} non trovata", categoryName);
                        }
                    }
                } else if (categoryObj instanceof String) {
                    // La categoria è stata fornita come stringa (nome categoria)
                    String categoryName = (String) categoryObj;
                    logger.info("Ricerca categoria per nome: {}", categoryName);
                    Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                    if (categoryByName.isPresent()) {
                        category = categoryByName.get();
                        logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                    } else {
                        logger.warn("Categoria con nome {} non trovata", categoryName);
                    }
                }
            }

            // Se ancora non abbiamo trovato la categoria, verifichiamo il campo 'category'
            if (category == null) {
                String categoryName = (String) productData.get("category");
                if (categoryName != null && !categoryName.trim().isEmpty()) {
                    logger.info("Ricerca categoria per nome dal campo 'category': {}", categoryName);
                    Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                    if (categoryByName.isPresent()) {
                        category = categoryByName.get();
                        logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                    } else {
                        // Se la categoria non esiste, creala
                        logger.info("Creazione nuova categoria: {}", categoryName);
                        category = new Category(categoryName);
                        category = categoryRepository.save(category);
                        logger.info("Nuova categoria creata con ID: {}", category.getId());
                    }
                }
            }

            // Se ancora non abbiamo una categoria, utilizza quella di default o invia un
            // errore
            if (category == null) {
                logger.warn("Nessuna categoria trovata o specificata");
                // Cerca una categoria di default
                List<Category> allCategories = categoryRepository.findAll();
                if (!allCategories.isEmpty()) {
                    category = allCategories.get(0);
                    logger.info("Utilizzo categoria predefinita: {}", category.getName());
                } else {
                    logger.error("Nessuna categoria disponibile nel sistema");
                    return ResponseEntity.badRequest().body("È necessario specificare una categoria valida. " +
                            "Nessuna categoria trovata nel sistema.");
                }
            }

            // Crea il prodotto con il brand
            logger.info(
                    "Creazione prodotto: nome={}, prezzo={}, stock={}, immagine={}, featured={}, categoria={}, brand={}",
                    name, price, stockQuantity, imageUrl, featured, category.getName(), brand);
            Product product = new Product(name, description, java.math.BigDecimal.valueOf(price), stockQuantity,
                    imageUrl, category, brand);
            product.setFeatured(featured);

            // Salva il prodotto
            Product savedProduct = productService.createProduct(product);
            logger.info("Prodotto salvato con successo. ID: {}", savedProduct.getId());
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            logger.error("Errore durante la creazione del prodotto: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Errore durante la creazione del prodotto: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> productData,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("PUT /api/products/{} - Richiesta aggiornamento prodotto", id);
        logger.info("Request body: {}", productData);
        logger.info("Headers - Authorization: {}", token);

        try {
            // Verifica che il prodotto esista
            Optional<Product> existingProductOpt = productService.getProductById(id);
            if (existingProductOpt.isEmpty()) {
                logger.warn("Prodotto con ID {} non trovato", id);
                return ResponseEntity.notFound().build();
            }

            Product existingProduct = existingProductOpt.get();
            logger.info("Prodotto esistente recuperato: {}", existingProduct);

            // Log dettagliato della categoria esistente
            if (existingProduct.getCategoryEntity() != null) {
                logger.info("Categoria esistente: ID={}, nome={}",
                        existingProduct.getCategoryEntity().getId(),
                        existingProduct.getCategoryEntity().getName());
            } else {
                logger.warn("Il prodotto non ha una categoria associata (categoryEntity è null)");
            }

            // Estrai i dati dal prodotto
            String name = (String) productData.get("name");
            String description = (String) productData.get("description");

            Object priceObj = productData.get("price");
            Double price;
            if (priceObj instanceof Double) {
                price = (Double) priceObj;
            } else if (priceObj instanceof Integer) {
                price = ((Integer) priceObj).doubleValue();
            } else if (priceObj instanceof String) {
                price = Double.parseDouble((String) priceObj);
            } else {
                return ResponseEntity.badRequest().body("Formato del prezzo non valido: " + priceObj);
            }

            // Gestione unificata di stockQuantity e stock_quantity
            Object stockObj = productData.get("stockQuantity");
            if (stockObj == null) {
                stockObj = productData.get("stock_quantity");
                if (stockObj == null) {
                    stockObj = productData.get("stock");
                }
            }
            logger.info("Valore dello stock: {} di tipo {}", stockObj,
                    stockObj != null ? stockObj.getClass().getName() : "null");
            Integer stockQuantity;
            if (stockObj instanceof Integer) {
                stockQuantity = (Integer) stockObj;
            } else if (stockObj instanceof Double) {
                stockQuantity = ((Double) stockObj).intValue();
            } else if (stockObj instanceof String) {
                stockQuantity = Integer.parseInt((String) stockObj);
            } else {
                stockQuantity = existingProduct.getStockQuantity(); // Mantieni il valore esistente
            }

            String imageUrl = (String) productData.get("imageUrl");
            if (imageUrl == null) {
                imageUrl = (String) productData.get("image_url");
                if (imageUrl == null) {
                    imageUrl = existingProduct.getImageUrl(); // Mantieni il valore esistente
                }
            }

            // Gestione del campo brand obbligatorio
            String brand = (String) productData.get("brand");
            if (brand == null || brand.trim().isEmpty()) {
                brand = existingProduct.getBrand(); // Mantieni il valore esistente
            }

            Object featuredObj = productData.get("featured");
            Boolean featured;
            if (featuredObj instanceof Boolean) {
                featured = (Boolean) featuredObj;
            } else if (featuredObj instanceof String) {
                featured = Boolean.parseBoolean((String) featuredObj);
            } else {
                featured = existingProduct.isFeatured(); // Mantieni il valore esistente
            }

            // MODIFICA: Gestione migliorata della categoria
            Category category = null;
            Long categoryId = null;

            // Prima controlliamo se è stato fornito un ID di categoria
            Object categoryIdObj = productData.get("categoryId");
            if (categoryIdObj != null) {
                if (categoryIdObj instanceof Integer) {
                    categoryId = ((Integer) categoryIdObj).longValue();
                } else if (categoryIdObj instanceof Long) {
                    categoryId = (Long) categoryIdObj;
                } else if (categoryIdObj instanceof String) {
                    try {
                        categoryId = Long.parseLong((String) categoryIdObj);
                    } catch (NumberFormatException e) {
                        // Non è un formato numerico valido, ignora
                    }
                }
            }

            // Se abbiamo un ID categoria, cerca la categoria per ID
            if (categoryId != null) {
                logger.info("Ricerca categoria per ID: {}", categoryId);
                Optional<Category> categoryById = categoryRepository.findById(categoryId);
                if (categoryById.isPresent()) {
                    category = categoryById.get();
                    logger.info("Categoria trovata per ID {}: {}", categoryId, category.getName());
                } else {
                    logger.warn("Categoria con ID {} non trovata", categoryId);
                }
            }

            // Se non abbiamo trovato la categoria per ID, verifichiamo se è stata fornita
            // come oggetto
            if (category == null) {
                Object categoryObj = productData.get("categoryEntity");
                logger.info("Valore della categoria: {} di tipo {}", categoryObj,
                        categoryObj != null ? categoryObj.getClass().getName() : "null");

                if (categoryObj instanceof Map) {
                    // La categoria è un oggetto, estrai l'ID o il nome
                    Map<String, Object> categoryMap = (Map<String, Object>) categoryObj;
                    Object catIdObj = categoryMap.get("id");

                    if (catIdObj != null) {
                        logger.info("Trovato ID categoria nell'oggetto: {}", catIdObj);
                        if (catIdObj instanceof Integer) {
                            categoryId = ((Integer) catIdObj).longValue();
                        } else if (catIdObj instanceof Long) {
                            categoryId = (Long) catIdObj;
                        } else if (catIdObj instanceof String) {
                            try {
                                categoryId = Long.parseLong((String) catIdObj);
                            } catch (NumberFormatException e) {
                                // Non è un formato numerico valido, ignora
                            }
                        }

                        if (categoryId != null) {
                            Optional<Category> categoryById = categoryRepository.findById(categoryId);
                            if (categoryById.isPresent()) {
                                category = categoryById.get();
                                logger.info("Categoria trovata per ID {}: {}", categoryId, category.getName());
                            } else {
                                logger.warn("Categoria con ID {} non trovata", categoryId);
                            }
                        }
                    }

                    // Se ancora non abbiamo trovato la categoria, proviamo con il nome
                    if (category == null && categoryMap.containsKey("name")) {
                        String categoryName = (String) categoryMap.get("name");
                        logger.info("Ricerca categoria per nome: {}", categoryName);
                        Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                        if (categoryByName.isPresent()) {
                            category = categoryByName.get();
                            logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                        } else {
                            logger.warn("Categoria con nome {} non trovata", categoryName);
                        }
                    }
                } else if (categoryObj instanceof String) {
                    // La categoria è stata fornita come stringa (nome categoria)
                    String categoryName = (String) categoryObj;
                    logger.info("Ricerca categoria per nome: {}", categoryName);
                    Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                    if (categoryByName.isPresent()) {
                        category = categoryByName.get();
                        logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                    } else {
                        logger.warn("Categoria con nome {} non trovata", categoryName);
                    }
                }
            }

            // Se ancora non abbiamo trovato la categoria, verifichiamo il campo 'category'
            if (category == null) {
                String categoryName = (String) productData.get("category");
                if (categoryName != null && !categoryName.trim().isEmpty()) {
                    logger.info("Ricerca categoria per nome dal campo 'category': {}", categoryName);
                    Optional<Category> categoryByName = categoryRepository.findByName(categoryName);
                    if (categoryByName.isPresent()) {
                        category = categoryByName.get();
                        logger.info("Categoria trovata per nome {}: ID={}", categoryName, category.getId());
                    } else {
                        // Se la categoria non esiste, creala
                        logger.info("Creazione nuova categoria: {}", categoryName);
                        category = new Category(categoryName);
                        category = categoryRepository.save(category);
                        logger.info("Nuova categoria creata con ID: {}", category.getId());
                    }
                }
            }

            // Se ancora non abbiamo una categoria, utilizza quella esistente o cerca una
            // categoria di default
            if (category == null) {
                if (existingProduct.getCategoryEntity() != null) {
                    // Utilizza la categoria esistente
                    category = existingProduct.getCategoryEntity();
                    logger.info("Utilizzo categoria esistente del prodotto: {}", category.getName());
                } else {
                    logger.warn("Nessuna categoria trovata o specificata, cerco una categoria di default");
                    // Cerca una categoria di default
                    List<Category> allCategories = categoryRepository.findAll();
                    if (!allCategories.isEmpty()) {
                        category = allCategories.get(0);
                        logger.info("Utilizzo categoria predefinita: {}", category.getName());
                    } else {
                        // Se non ci sono categorie, ne crea una
                        logger.info("Nessuna categoria disponibile nel sistema, ne creo una di default");
                        category = new Category("Categoria Default");
                        category = categoryRepository.save(category);
                        logger.info("Creata categoria di default con ID: {}", category.getId());
                    }
                }
            }

            // Aggiorna il prodotto
            existingProduct.setName(name);
            existingProduct.setDescription(description);
            existingProduct.setPrice(java.math.BigDecimal.valueOf(price));
            existingProduct.setStockQuantity(stockQuantity);
            existingProduct.setImageUrl(imageUrl);
            existingProduct.setCategoryEntity(category);
            existingProduct.setBrand(brand);
            existingProduct.setFeatured(featured);

            // Salva il prodotto
            Product updatedProduct = productService.updateProduct(id, existingProduct);
            logger.info("Prodotto aggiornato con successo: ID={}, nome={}, categoria={}",
                    updatedProduct.getId(), updatedProduct.getName(),
                    updatedProduct.getCategoryEntity() != null ? updatedProduct.getCategoryEntity().getName() : "null");

            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            logger.error("Errore durante l'aggiornamento del prodotto: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Errore durante l'aggiornamento del prodotto: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("DELETE /api/products/{} - Richiesta eliminazione prodotto", id);
        logger.info("Headers - Authorization: {}", token);

        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Errore durante l'eliminazione del prodotto: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Errore durante l'eliminazione del prodotto: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/products/search?query={} - Richiesta ricerca prodotti", query);
        logger.info("Headers - Authorization: {}", token);
        return ResponseEntity.ok(productService.searchProducts(query));
    }
}