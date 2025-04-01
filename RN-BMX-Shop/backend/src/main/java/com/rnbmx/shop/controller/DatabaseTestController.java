package com.rnbmx.shop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DatabaseTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/dbtest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testDatabase() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Verifica connessione
            String dbName = jdbcTemplate.queryForObject("SELECT current_database()", String.class);
            String dbUser = jdbcTemplate.queryForObject("SELECT current_user", String.class);

            response.put("status", "success");
            response.put("database", dbName);
            response.put("user", dbUser);

            // Lista delle tabelle
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
                    String.class);

            response.put("tables", tables);

            // Lista degli utenti (informazioni limitate)
            List<Map<String, Object>> users = new ArrayList<>();
            jdbcTemplate.query(
                    "SELECT id, username, email, first_name, last_name, name, surname FROM users ORDER BY id",
                    (rs) -> {
                        Map<String, Object> user = new HashMap<>();
                        user.put("id", rs.getLong("id"));
                        user.put("username", rs.getString("username"));
                        user.put("email", rs.getString("email"));
                        user.put("firstName", rs.getString("first_name"));
                        user.put("lastName", rs.getString("last_name"));
                        user.put("name", rs.getString("name"));
                        user.put("surname", rs.getString("surname"));
                        users.add(user);
                    });

            response.put("users", users);
            response.put("userCount", users.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Errore durante la connessione al database: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lista degli utenti con informazioni limitate
            List<Map<String, Object>> users = new ArrayList<>();
            jdbcTemplate.query(
                    "SELECT id, username, email, first_name, last_name, name, surname FROM users ORDER BY id",
                    (rs) -> {
                        Map<String, Object> user = new HashMap<>();
                        user.put("id", rs.getLong("id"));
                        user.put("username", rs.getString("username"));
                        user.put("email", rs.getString("email"));
                        user.put("firstName", rs.getString("first_name"));
                        user.put("lastName", rs.getString("last_name"));
                        user.put("name", rs.getString("name"));
                        user.put("surname", rs.getString("surname"));
                        users.add(user);
                    });

            response.put("status", "success");
            response.put("users", users);
            response.put("userCount", users.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Errore durante il recupero degli utenti: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}