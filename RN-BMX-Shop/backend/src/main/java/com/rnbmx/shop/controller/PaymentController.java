package com.rnbmx.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private static final String STRIPE_SECRET_KEY = "sk_test_51R6tOEK87s4DKx48nDAYdfPHnhoBgv1WoHb2lwOsdC4zPTWXMvLUnBbbCd0CoH07bLJO3h3Y5zk1jqZMEiIIg0K800TM3wABaf";

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Object paymentRequest,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("POST /process - Richiesta di pagamento ricevuta");
        logger.info("Request body: {}", paymentRequest);
        logger.info("Headers - Authorization: {}", token);

        // Risposta mock per simulare l'elaborazione del pagamento
        String paymentResponse = "{"
                + "\"success\": true,"
                + "\"paymentId\": \"pm_" + System.currentTimeMillis() + "\","
                + "\"amount\": 199.99,"
                + "\"currency\": \"EUR\","
                + "\"status\": \"succeeded\","
                + "\"message\": \"Pagamento elaborato con successo\""
                + "}";

        logger.info("Risposta di pagamento inviata: {}", paymentResponse);
        return ResponseEntity.ok().body(paymentResponse);
    }

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        // Espone solo la chiave pubblica
        String configResponse = "{"
                + "\"publishableKey\": \"pk_test_51R6tOEK87s4DKx481RxYqCsfiyPdNxbXNhOGxQ8HEqzoyqyQzxptMiQpji3oVzgWlqMl7kutS7sXHiW6MQQqiHjD00apfUVkPm\""
                + "}";
        return ResponseEntity.ok().body(configResponse);
    }
}