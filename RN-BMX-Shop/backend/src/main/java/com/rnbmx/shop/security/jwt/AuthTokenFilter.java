package com.rnbmx.shop.security.jwt;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.rnbmx.shop.security.services.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();

        // Log per debug
        logger.debug("Processing request to path: {}", path);

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.info("Utente estratto dal token: {}", username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Log delle autorità dell'utente per debug
                if (path.contains("/admin/")) {
                    logger.info("Autorità dell'utente per path admin {}: {}", path,
                            userDetails.getAuthorities().stream()
                                    .map(auth -> auth.getAuthority())
                                    .collect(java.util.stream.Collectors.joining(", ")));
                }
            } else if (jwt != null) {
                // Token presente ma non valido, log solo a livello debug per risorse pubbliche
                if (path.startsWith("/api/products")) {
                    logger.debug("Token non valido per risorsa pubblica: {}", path);
                } else {
                    logger.warn("Token non valido per risorsa protetta: {}", path);
                }
            }
        } catch (SignatureException e) {
            // Non bloccare le richieste pubbliche
            if (!isPublicResource(path)) {
                logger.error("Firma JWT non valida: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"JWT signature does not match\"}");
                return;
            }
            logger.debug("Firma JWT non valida per risorsa pubblica: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            if (!isPublicResource(path)) {
                logger.error("Token JWT non valido: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"Invalid JWT token\"}");
                return;
            }
            logger.debug("Token JWT non valido per risorsa pubblica: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            if (!isPublicResource(path)) {
                logger.error("Token JWT scaduto: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"JWT token is expired\"}");
                return;
            }
            logger.debug("Token JWT scaduto per risorsa pubblica: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            if (!isPublicResource(path)) {
                logger.error("Token JWT non supportato: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"JWT token is unsupported\"}");
                return;
            }
            logger.debug("Token JWT non supportato per risorsa pubblica: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            if (!isPublicResource(path)) {
                logger.error("Il claim del token JWT è vuoto: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"JWT claims string is empty\"}");
                return;
            }
            logger.debug("JWT claims vuoto per risorsa pubblica: {}", e.getMessage());
        } catch (Exception e) {
            // Non bloccare le risorse pubbliche
            if (!isPublicResource(path)) {
                logger.error("Impossibile impostare l'autenticazione utente: {}", e.getMessage());
            } else {
                logger.debug("Errore di autenticazione per risorsa pubblica: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }

    // Metodo per verificare se un percorso è una risorsa pubblica
    private boolean isPublicResource(String path) {
        return path.startsWith("/api/products") ||
                path.startsWith("/api/auth") ||
                path.startsWith("/api/public") ||
                path.startsWith("/api/debug") ||
                path.startsWith("/api/debug-login") ||
                path.startsWith("/api/categories") ||
                path.startsWith("/api/reviews/product");
    }
}