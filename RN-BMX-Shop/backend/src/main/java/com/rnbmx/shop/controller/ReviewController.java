package com.rnbmx.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProductId(@PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /api/reviews/product/{} - Richiesta recensioni prodotto ricevuta", productId);

        // Il token è opzionale per questo endpoint, logghiamo solo se presente
        if (token != null && !token.isEmpty()) {
            logger.info("Headers - Authorization presente: {}...", token.substring(0, Math.min(20, token.length())));
        } else {
            logger.info("Headers - Authorization non presente");
        }

        // Mock data per le recensioni
        List<Map<String, Object>> reviews = new ArrayList<>();

        // Recensione 1
        Map<String, Object> review1 = new HashMap<>();
        review1.put("id", 1);
        review1.put("productId", productId);
        review1.put("rating", 5);
        review1.put("title", "Ottimo prodotto!");
        review1.put("comment",
                "Ho acquistato questo prodotto un mese fa e sono davvero soddisfatto. La qualità è eccellente e il prezzo è giusto.");
        review1.put("createdAt", LocalDateTime.now().minusDays(30));

        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "Marco Rossi");
        review1.put("user", user1);

        // Recensione 2
        Map<String, Object> review2 = new HashMap<>();
        review2.put("id", 2);
        review2.put("productId", productId);
        review2.put("rating", 4);
        review2.put("title", "Buon rapporto qualità-prezzo");
        review2.put("comment",
                "Prodotto di buona qualità, spedizione veloce e assistenza clienti eccellente. Manca una stella per alcune piccole imperfezioni.");
        review2.put("createdAt", LocalDateTime.now().minusDays(15));

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "Giulia Bianchi");
        review2.put("user", user2);

        // Aggiungiamo le recensioni alla lista
        reviews.add(review1);
        reviews.add(review2);

        logger.info("Invio di {} recensioni per il prodotto {}", reviews.size(), productId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId,
            @RequestBody Map<String, Object> reviewData,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("POST /api/reviews/product/{} - Richiesta di aggiunta recensione ricevuta", productId);
        logger.info("Request body: {}", reviewData);

        // Il token è necessario per questo endpoint
        if (token != null && !token.isEmpty()) {
            logger.info("Headers - Authorization presente: {}...", token.substring(0, Math.min(20, token.length())));
        } else {
            logger.warn("Headers - Authorization non presente - Richiesta non autorizzata");
            return ResponseEntity.status(401)
                    .body(Map.of("message", "È necessario autenticarsi per aggiungere una recensione"));
        }

        // Verifica che l'utente sia autenticato
        if (token == null || !token.startsWith("Bearer ")) {
            logger.error("Tentativo di aggiungere una recensione senza autenticazione");
            return ResponseEntity.status(401)
                    .body(Map.of("message", "È necessario autenticarsi per aggiungere una recensione"));
        }

        // Validazione dei dati della recensione
        try {
            // Verifica la presenza e la validità dei campi obbligatori
            if (!reviewData.containsKey("rating") || !reviewData.containsKey("title")
                    || !reviewData.containsKey("comment")) {
                logger.warn("Dati recensione incompleti: mancano campi obbligatori");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "I campi rating, title e comment sono obbligatori"));
            }

            // Valori numerici: assicurati che rating sia un numero tra 1 e 5
            Object ratingObj = reviewData.get("rating");
            int rating;
            try {
                if (ratingObj instanceof Integer) {
                    rating = (Integer) ratingObj;
                } else if (ratingObj instanceof Double) {
                    rating = ((Double) ratingObj).intValue();
                } else if (ratingObj instanceof String) {
                    rating = Integer.parseInt((String) ratingObj);
                } else {
                    logger.warn("Formato rating non valido: {}", ratingObj);
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Il rating deve essere un numero tra 1 e 5"));
                }

                if (rating < 1 || rating > 5) {
                    logger.warn("Rating fuori range: {}", rating);
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Il rating deve essere un numero tra 1 e 5"));
                }
            } catch (NumberFormatException e) {
                logger.warn("Errore parsing rating: {}", e.getMessage());
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Il rating deve essere un numero tra 1 e 5"));
            }

            // Controlla che title e comment siano stringhe non vuote
            String title = reviewData.get("title").toString();
            String comment = reviewData.get("comment").toString();

            if (title.trim().isEmpty()) {
                logger.warn("Titolo recensione vuoto");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Il titolo della recensione non può essere vuoto"));
            }

            if (comment.trim().isEmpty()) {
                logger.warn("Commento recensione vuoto");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Il commento della recensione non può essere vuoto"));
            }

            // In un'implementazione reale qui si estrarrebe l'ID utente dal token JWT
            // e si salverebbero i dati della recensione nel database
            String jwt = token.substring(7);
            logger.info("Token JWT estratto, lunghezza: {}", jwt.length());

            // Creazione di una risposta mock
            Map<String, Object> response = new HashMap<>();
            response.put("id", System.currentTimeMillis());
            response.put("productId", productId);
            response.put("rating", rating);
            response.put("title", title);
            response.put("comment", comment);
            response.put("createdAt", LocalDateTime.now());

            Map<String, Object> user = new HashMap<>();
            user.put("id", 999); // ID dell'utente corrente
            user.put("name", "Utente Attuale");
            response.put("user", user);

            logger.info("Recensione aggiunta con successo per il prodotto {}", productId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante l'elaborazione della recensione: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Errore durante l'elaborazione della recensione: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("DELETE /api/reviews/{} - Richiesta di eliminazione recensione ricevuta", reviewId);

        // Debug - Stampa tutti gli headers ricevuti
        logger.info("Headers ricevuti per DELETE:");
        logger.info("Authorization: {}", token);

        // Modalità sviluppo: per scopi di testing, permettiamo l'eliminazione anche
        // senza token valido
        boolean devMode = true; // Impostare a false in produzione

        if (devMode) {
            logger.warn("MODALITÀ SVILUPPO ATTIVA: Autorizzazione bypassata per eliminazione recensione {}", reviewId);
        } else {
            // Il token è necessario per questo endpoint in produzione
            if (token == null || token.isEmpty() || !token.startsWith("Bearer ")) {
                logger.warn("Richiesta non autorizzata: token non valido o mancante");
                return ResponseEntity.status(401)
                        .body(Map.of("message", "È necessario autenticarsi per eliminare una recensione"));
            }

            try {
                // 1. Estrarre l'ID utente dal token JWT
                String jwt = token.substring(7);
                logger.info("Token JWT estratto, lunghezza: {}", jwt.length());

                // 2. Verificare che l'utente sia l'autore della recensione o un amministratore
                // Mock: supponiamo che la verifica sia riuscita
                boolean isAuthorized = true;

                if (!isAuthorized) {
                    logger.warn("Utente non autorizzato a eliminare la recensione {}", reviewId);
                    return ResponseEntity.status(403)
                            .body(Map.of("message", "Non sei autorizzato a eliminare questa recensione"));
                }
            } catch (Exception e) {
                logger.error("Errore durante la verifica del token: {}", e.getMessage(), e);
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Errore di autenticazione: " + e.getMessage()));
            }
        }

        try {
            // 3. Eliminare la recensione dal database
            logger.info("Eliminazione recensione con ID {} autorizzata", reviewId);

            // Simuliamo un ritardo di elaborazione per mostrare il caricamento nel frontend
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            logger.info("Recensione {} eliminata con successo", reviewId);
            return ResponseEntity.ok(Map.of(
                    "message", "Recensione eliminata con successo",
                    "reviewId", reviewId));
        } catch (Exception e) {
            logger.error("Errore durante l'eliminazione della recensione: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Errore durante l'eliminazione della recensione: " + e.getMessage()));
        }
    }
}