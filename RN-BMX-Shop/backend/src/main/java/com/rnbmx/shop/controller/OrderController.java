package com.rnbmx.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

        private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

        @PostMapping
        public ResponseEntity<?> createOrder(@RequestBody Object orderRequest,
                        @RequestHeader(value = "Authorization", required = false) String token) {
                logger.info("POST /api/orders - Richiesta di creazione ordine ricevuta");
                logger.info("Request body: {}", orderRequest);
                logger.info("Headers - Authorization: {}", token);

                // Risposta mock per simulare la creazione dell'ordine
                String orderResponse = "{"
                                + "\"id\": " + System.currentTimeMillis() + ","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now() + "\","
                                + "\"status\": \"PROCESSING\","
                                + "\"totalAmount\": 199.99,"
                                + "\"paymentId\": \"pm_" + System.currentTimeMillis() + "\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"phone\": \"+39 123 456 7890\","
                                + "\"paymentMethod\": \"CARTA\","
                                + "\"orderItems\": ["
                                + "{"
                                + "\"id\": 1,"
                                + "\"productId\": 1,"
                                + "\"productName\": \"BMX Freestyle\","
                                + "\"quantity\": 1,"
                                + "\"price\": 199.99"
                                + "}"
                                + "],"
                                + "\"message\": \"Ordine creato con successo\""
                                + "}";

                logger.info("Risposta di creazione ordine inviata: {}", orderResponse);
                return ResponseEntity.ok().body(orderResponse);
        }

        @GetMapping("/my-orders")
        public ResponseEntity<?> getUserOrders(@RequestHeader(value = "Authorization", required = false) String token) {
                logger.info("GET /api/orders/my-orders - Richiesta ordini utente ricevuta");
                logger.info("Headers - Authorization: {}", token);

                // Risposta mock per simulare gli ordini dell'utente
                String ordersResponse = "["
                                + "{"
                                + "\"id\": " + (System.currentTimeMillis() - 86400000) + ","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now().minusDays(1) + "\","
                                + "\"status\": \"SHIPPED\","
                                + "\"totalAmount\": 199.99,"
                                + "\"paymentId\": \"pm_" + (System.currentTimeMillis() - 86400000) + "\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"phone\": \"+39 123 456 7890\","
                                + "\"paymentMethod\": \"CARTA\","
                                + "\"orderItems\": ["
                                + "{"
                                + "\"id\": 1,"
                                + "\"productId\": 1,"
                                + "\"productName\": \"BMX Freestyle\","
                                + "\"quantity\": 1,"
                                + "\"price\": 199.99"
                                + "}"
                                + "]"
                                + "},"
                                + "{"
                                + "\"id\": " + System.currentTimeMillis() + ","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now() + "\","
                                + "\"status\": \"PROCESSING\","
                                + "\"totalAmount\": 299.99,"
                                + "\"paymentId\": \"pm_" + System.currentTimeMillis() + "\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"phone\": \"+39 123 456 7890\","
                                + "\"paymentMethod\": \"CARTA\","
                                + "\"orderItems\": ["
                                + "{"
                                + "\"id\": 2,"
                                + "\"productId\": 2,"
                                + "\"productName\": \"BMX Bike Pro XL\","
                                + "\"quantity\": 1,"
                                + "\"price\": 249.99"
                                + "},"
                                + "{"
                                + "\"id\": 3,"
                                + "\"productId\": 3,"
                                + "\"productName\": \"Casco Protettivo Standard\","
                                + "\"quantity\": 1,"
                                + "\"price\": 49.99"
                                + "}"
                                + "]"
                                + "}"
                                + "]";

                logger.info("Risposta ordini utente inviata");
                return ResponseEntity.ok().body(ordersResponse);
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getOrderById(@PathVariable Long id,
                        @RequestHeader(value = "Authorization", required = false) String token) {
                logger.info("GET /api/orders/{} - Richiesta dettagli ordine ricevuta", id);
                logger.info("Headers - Authorization: {}", token);

                // Risposta mock per simulare i dettagli di un ordine
                String orderDetails = "{"
                                + "\"id\": " + id + ","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now() + "\","
                                + "\"status\": \"PROCESSING\","
                                + "\"totalAmount\": 199.99,"
                                + "\"paymentId\": \"pm_" + id + "\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"phone\": \"+39 123 456 7890\","
                                + "\"paymentMethod\": \"CARTA\","
                                + "\"orderItems\": ["
                                + "{"
                                + "\"id\": 1,"
                                + "\"productId\": 1,"
                                + "\"productName\": \"BMX Freestyle\","
                                + "\"quantity\": 1,"
                                + "\"price\": 199.99"
                                + "}"
                                + "]"
                                + "}";

                logger.info("Risposta dettagli ordine inviata");
                return ResponseEntity.ok().body(orderDetails);
        }

        @GetMapping("/admin/all")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getAllOrders(@RequestHeader(value = "Authorization", required = false) String token) {
                logger.info("GET /api/orders/admin/all - Richiesta tutti gli ordini ricevuta");
                logger.info("Headers - Authorization: {}", token);

                // Risposta mock per simulare tutti gli ordini (solo per admin)
                String allOrdersResponse = "["
                                + "{"
                                + "\"id\": " + (System.currentTimeMillis() - 86400000) + ","
                                + "\"userId\": 1,"
                                + "\"username\": \"admin\","
                                + "\"email\": \"admin@example.com\","
                                + "\"fullName\": \"Admin User\","
                                + "\"phoneNumber\": \"+39 123 456 7890\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"paymentMethod\": \"Credit Card\","
                                + "\"paymentDetails\": \"{\\\"cardNumber\\\":\\\"**** **** **** 1234\\\",\\\"cardHolder\\\":\\\"Admin User\\\"}\","
                                + "\"totalAmount\": 299.99,"
                                + "\"total\": 299.99,"
                                + "\"shippingCost\": 5.99,"
                                + "\"status\": \"COMPLETED\","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now().minusDays(1) + "\","
                                + "\"createdAt\": \"2023-06-15T10:30:00\","
                                + "\"updatedAt\": \"2023-06-15T10:30:00\""
                                + "},"
                                + "{"
                                + "\"id\": " + System.currentTimeMillis() + ","
                                + "\"userId\": 2,"
                                + "\"username\": \"user\","
                                + "\"email\": \"user@example.com\","
                                + "\"fullName\": \"Regular User\","
                                + "\"phoneNumber\": \"+39 098 765 4321\","
                                + "\"shippingAddress\": \"Centro Direzionale, Isola E7, Napoli, Italia\","
                                + "\"paymentMethod\": \"PayPal\","
                                + "\"paymentDetails\": \"{\\\"email\\\":\\\"user@example.com\\\"}\","
                                + "\"totalAmount\": 149.99,"
                                + "\"total\": 149.99,"
                                + "\"shippingCost\": 5.99,"
                                + "\"status\": \"SHIPPED\","
                                + "\"orderDate\": \"" + java.time.LocalDateTime.now() + "\","
                                + "\"createdAt\": \"2023-06-10T14:20:00\","
                                + "\"updatedAt\": \"2023-06-11T09:15:00\""
                                + "}"
                                + "]";

                logger.info("Risposta tutti gli ordini inviata");
                return ResponseEntity.ok().body(allOrdersResponse);
        }

        @PutMapping("/admin/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> updateOrderStatus(
                        @PathVariable Long id,
                        @RequestBody Object statusRequest,
                        @RequestHeader(value = "Authorization", required = false) String token) {
                logger.info("PUT /api/orders/admin/{}/status - Richiesta aggiornamento stato ordine", id);
                logger.info("Request body: {}", statusRequest);
                logger.info("Headers - Authorization: {}", token);

                // Risposta mock per simulare l'aggiornamento dello stato dell'ordine
                String updateResponse = "{"
                                + "\"id\": " + id + ","
                                + "\"status\": \"SHIPPED\","
                                + "\"message\": \"Stato ordine aggiornato con successo\""
                                + "}";

                logger.info("Risposta aggiornamento stato ordine inviata");
                return ResponseEntity.ok().body(updateResponse);
        }
}