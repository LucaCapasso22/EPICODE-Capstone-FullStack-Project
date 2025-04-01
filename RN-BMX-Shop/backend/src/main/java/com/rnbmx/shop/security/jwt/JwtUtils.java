package com.rnbmx.shop.security.jwt;

import java.util.Date;
import java.util.Base64;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.rnbmx.shop.security.services.UserDetailsImpl;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${bmx.app.jwtSecret}")
    private String jwtSecret;

    @Value("${bmx.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    private byte[] secretKeyBytes;

    @PostConstruct
    public void init() {
        // Verifichiamo la lunghezza della chiave configurata
        byte[] existingKey = jwtSecret.getBytes();
        int keyLengthBits = existingKey.length * 8;

        logger.info("Lunghezza chiave JWT configurata: {} bits", keyLengthBits);

        if (keyLengthBits < 512) {
            // La chiave è troppo corta, generiamo una nuova chiave sicura
            logger.warn(
                    "La chiave JWT configurata è troppo corta per HS512 (min 512 bits). Generazione nuova chiave...");

            // Genera una chiave sicura per HS512
            secretKeyBytes = Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded();

            // Stampa la nuova chiave per permettere di configurarla in
            // application.properties
            String base64Key = Base64.getEncoder().encodeToString(secretKeyBytes);
            logger.info("Nuova chiave JWT generata: {}", base64Key);
            logger.info(
                    "ATTENZIONE: Configurare questa chiave in application.properties per evitare la rigenerazione al riavvio");
        } else {
            // La chiave è sufficientemente lunga, la utilizziamo
            secretKeyBytes = existingKey;
            logger.info("Chiave JWT configurata ha una lunghezza sufficiente");
        }
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getEmail()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(secretKeyBytes), SignatureAlgorithm.HS512)
                .compact();
    }

    // Metodo aggiuntivo per generare token direttamente da UserDetailsImpl
    public String generateJwtToken(UserDetailsImpl userPrincipal) {
        return Jwts.builder()
                .setSubject((userPrincipal.getEmail()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(secretKeyBytes), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secretKeyBytes))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKeyBytes))
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Firma JWT non valida: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Token JWT non valido: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT scaduto: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supportato: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Claims JWT vuoto: {}", e.getMessage());
        }

        return false;
    }
}