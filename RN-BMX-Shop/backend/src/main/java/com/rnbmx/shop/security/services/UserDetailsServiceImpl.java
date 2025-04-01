package com.rnbmx.shop.security.services;

import com.rnbmx.shop.model.User;
import com.rnbmx.shop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Tentativo di caricare utente con email: {}", email);

        try {
            // Verifica se l'email è null o vuota
            if (email == null || email.trim().isEmpty()) {
                logger.error("Tentativo di login con email null o vuota");
                throw new UsernameNotFoundException("L'indirizzo email non può essere vuoto");
            }

            // Conta il numero di utenti nel sistema per debug
            long userCount = userRepository.count();
            logger.info("Numero totale di utenti nel sistema: {}", userCount);

            // DEBUG: Elenco tutti gli utenti nel sistema per debug
            logger.info("DEBUGGING: Elenco di tutti gli utenti nel sistema:");
            userRepository.findAll().forEach(u -> {
                logger.info("Utente ID: {}, Email: {}, Username: {}, Nome: {}, Cognome: {}, Name: {}, Surname: {}",
                        u.getId(), u.getEmail(), u.getUsername(), u.getFirstName(), u.getLastName(), u.getName(),
                        u.getSurname());
            });

            // Cerca l'utente nel repository
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        logger.error("Utente non trovato con email: {}", email);
                        return new UsernameNotFoundException("Utente non trovato con email: " + email);
                    });

            logger.info("Utente trovato con email: {} e ID: {}", email, user.getId());

            // Log dei dettagli dell'utente per debug (non in produzione!)
            logger.debug("Dettagli utente trovato: firstName={}, lastName={}, name={}, surname={}, roles={}",
                    user.getFirstName(), user.getLastName(), user.getName(), user.getSurname(), user.getRoles());

            // Costruisci l'oggetto UserDetails
            UserDetails userDetails = UserDetailsImpl.build(user);
            logger.info("UserDetails costruito con successo per utente: {}", email);

            return userDetails;
        } catch (Exception e) {
            logger.error("Errore durante il caricamento dell'utente: {}", e.getMessage());
            logger.error("Dettaglio errore:", e);
            throw e;
        }
    }
}