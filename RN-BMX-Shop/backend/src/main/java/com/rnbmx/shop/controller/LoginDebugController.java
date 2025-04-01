package com.rnbmx.shop.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.rnbmx.shop.model.User;
import com.rnbmx.shop.repository.UserRepository;
import com.rnbmx.shop.payload.response.MessageResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/debug-login")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class LoginDebugController {

    private static final Logger logger = LoggerFactory.getLogger(LoginDebugController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        logger.info("Richiesta elenco utenti per debug login");

        List<Map<String, Object>> users = new ArrayList<>();

        try {
            jdbcTemplate.query(
                    "SELECT id, email, username, name, surname, first_name, last_name FROM users",
                    (rs) -> {
                        Map<String, Object> user = new HashMap<>();
                        user.put("id", rs.getLong("id"));
                        user.put("email", rs.getString("email"));
                        user.put("username", rs.getString("username"));
                        user.put("firstName", rs.getString("first_name"));
                        user.put("lastName", rs.getString("last_name"));
                        user.put("name", rs.getString("name"));
                        user.put("surname", rs.getString("surname"));
                        users.add(user);
                    });

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("count", users.size());
            response.put("users", users);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante il recupero degli utenti: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Errore: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam(defaultValue = "password123") String newPassword) {

        logger.info("Richiesta reset password per debug login. Email: {}, Nuova password: {}",
                email, newPassword);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                logger.warn("Reset password fallito: utente con email {} non trovato", email);
                return ResponseEntity.status(404)
                        .body(new MessageResponse("Utente non trovato con email: " + email));
            }

            User user = userOpt.get();

            // Verifica password attuale (se esiste)
            String currentPassword = user.getPassword();
            logger.info("Password attuale (hash): {}", currentPassword);

            // Genera nuovo hash della password
            String encodedPassword = passwordEncoder.encode(newPassword);
            logger.info("Nuova password: {}", newPassword);
            logger.info("Nuovo hash: {}", encodedPassword);

            // Aggiorna la password
            user.setPassword(encodedPassword);
            userRepository.save(user);

            logger.info("Password reimpostata con successo per l'utente: {}", email);

            // Crea un messaggio dettagliato con istruzioni di login
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Password reimpostata con successo per " + email);
            response.put("newPassword", newPassword);
            response.put("loginInstructions", "Usa queste credenziali per accedere:");
            response.put("email", email);
            response.put("password", newPassword);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Errore durante il reset della password: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Errore: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/check-password")
    public ResponseEntity<?> checkPassword(
            @RequestParam String email,
            @RequestParam String password) {

        logger.info("Verifica corrispondenza password. Email: {}", email);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                logger.warn("Verifica password fallita: utente con email {} non trovato", email);
                return ResponseEntity.status(404)
                        .body(new MessageResponse("Utente non trovato con email: " + email));
            }

            User user = userOpt.get();

            // Verifica se la password corrisponde
            String storedHash = user.getPassword();
            boolean matches = passwordEncoder.matches(password, storedHash);

            logger.info("Password test '{}' per utente {}: {} (hash: {})",
                    password, email, matches ? "CORRISPONDE" : "NON CORRISPONDE", storedHash);

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("passwordMatches", matches);
            response.put("storedHash", storedHash);

            if (!matches) {
                // Genera l'hash della password fornita per confronto
                String testHash = passwordEncoder.encode(password);
                response.put("inputHash", testHash);
                response.put("suggestion",
                        "La password non corrisponde. Prova a reimpostare la password usando l'endpoint /reset-password");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Errore durante la verifica della password: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Errore: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserDetails(@PathVariable String email) {
        logger.info("Richiesta dettagli utente per: {}", email);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                logger.warn("Utente con email {} non trovato", email);
                return ResponseEntity.status(404)
                        .body(new MessageResponse("Utente non trovato con email: " + email));
            }

            User user = userOpt.get();

            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("id", user.getId());
            userDetails.put("email", user.getEmail());
            userDetails.put("username", user.getUsername());
            userDetails.put("firstName", user.getFirstName());
            userDetails.put("lastName", user.getLastName());
            userDetails.put("name", user.getName());
            userDetails.put("surname", user.getSurname());
            userDetails.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
            userDetails.put("passwordHash", user.getPassword());

            return ResponseEntity.ok(userDetails);

        } catch (Exception e) {
            logger.error("Errore durante il recupero dei dettagli utente: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Errore: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}