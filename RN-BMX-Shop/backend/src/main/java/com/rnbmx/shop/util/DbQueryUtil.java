package com.rnbmx.shop.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DbQueryUtil {
    private static final Logger logger = LoggerFactory.getLogger(DbQueryUtil.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Bean
    @Profile("debug")
    public CommandLineRunner printUsersData() {
        return args -> {
            logger.info("=========== ELENCO UTENTI REGISTRATI NEL DATABASE ===========");

            List<Map<String, Object>> users = new ArrayList<>();

            jdbcTemplate.query(
                    "SELECT id, username, email, name, surname, first_name, last_name FROM users",
                    (ResultSet rs) -> {
                        while (rs.next()) {
                            Map<String, Object> user = new HashMap<>();
                            user.put("id", rs.getLong("id"));
                            user.put("username", rs.getString("username"));
                            user.put("email", rs.getString("email"));
                            user.put("name", rs.getString("name"));
                            user.put("surname", rs.getString("surname"));
                            user.put("firstName", rs.getString("first_name"));
                            user.put("lastName", rs.getString("last_name"));
                            users.add(user);

                            logger.info(
                                    "Utente ID: {}, Username: {}, Email: {}, Nome: {}, Cognome: {}, FirstName: {}, LastName: {}",
                                    user.get("id"), user.get("username"), user.get("email"),
                                    user.get("name"), user.get("surname"), user.get("firstName"), user.get("lastName"));
                        }
                    });

            logger.info("Totale utenti trovati: {}", users.size());
            logger.info("==============================================================");
        };
    }
}