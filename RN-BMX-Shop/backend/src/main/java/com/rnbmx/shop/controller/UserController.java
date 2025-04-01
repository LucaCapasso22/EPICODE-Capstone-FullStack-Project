package com.rnbmx.shop.controller;

import com.rnbmx.shop.model.Role;
import com.rnbmx.shop.model.User;
import com.rnbmx.shop.repository.RoleRepository;
import com.rnbmx.shop.repository.UserRepository;
import com.rnbmx.shop.security.jwt.JwtUtils;
import com.rnbmx.shop.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Ottieni tutti gli utenti (solo per admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        logger.info("GET /api/users - Richiesta tutti gli utenti ricevuta");

        try {
            List<User> users = userRepository.findAll();

            // Conversione degli utenti in DTO per evitare di esporre dati sensibili
            List<Map<String, Object>> userDTOs = users.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            logger.info("Restituiti {} utenti", userDTOs.size());
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            logger.error("Errore nel recupero degli utenti: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nel recupero degli utenti: " + e.getMessage()));
        }
    }

    // Ottieni un utente specifico tramite ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("GET /api/users/{} - Richiesta dettagli utente ricevuta", id);

        try {
            Optional<User> userOptional = userRepository.findById(id);

            if (userOptional.isEmpty()) {
                logger.warn("Utente con ID {} non trovato", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            Map<String, Object> userDTO = convertToDTO(userOptional.get());
            logger.info("Restituito utente con ID {}", id);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Errore nel recupero dell'utente con ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nel recupero dell'utente: " + e.getMessage()));
        }
    }

    // Aggiorna un utente
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> userData) {
        logger.info("PUT /api/users/{} - Richiesta aggiornamento utente ricevuta", id);
        logger.info("Dati utente: {}", userData);

        try {
            Optional<User> userOptional = userRepository.findById(id);

            if (userOptional.isEmpty()) {
                logger.warn("Utente con ID {} non trovato", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            User user = userOptional.get();

            // Aggiorna i campi dell'utente se presenti nel payload
            if (userData.containsKey("firstName")) {
                user.setFirstName((String) userData.get("firstName"));
            }

            if (userData.containsKey("lastName")) {
                user.setLastName((String) userData.get("lastName"));
            }

            if (userData.containsKey("email")) {
                user.setEmail((String) userData.get("email"));
            }

            if (userData.containsKey("phone")) {
                user.setPhone((String) userData.get("phone"));
            }

            if (userData.containsKey("country")) {
                user.setCountry((String) userData.get("country"));
            }

            if (userData.containsKey("city")) {
                user.setCity((String) userData.get("city"));
            }

            if (userData.containsKey("address")) {
                user.setAddress((String) userData.get("address"));
            }

            if (userData.containsKey("gender")) {
                user.setGender((String) userData.get("gender"));
            }

            if (userData.containsKey("username")) {
                user.setUsername((String) userData.get("username"));
            }

            if (userData.containsKey("profileImage")) {
                user.setProfileImage((String) userData.get("profileImage"));
            }

            // Salva l'utente aggiornato
            userRepository.save(user);

            Map<String, Object> userDTO = convertToDTO(user);
            logger.info("Utente con ID {} aggiornato con successo", id);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Errore nell'aggiornamento dell'utente con ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nell'aggiornamento dell'utente: " + e.getMessage()));
        }
    }

    // Elimina un utente
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("DELETE /api/users/{} - Richiesta eliminazione utente ricevuta", id);

        try {
            if (!userRepository.existsById(id)) {
                logger.warn("Utente con ID {} non trovato", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            userRepository.deleteById(id);

            logger.info("Utente con ID {} eliminato con successo", id);
            return ResponseEntity.ok(Map.of("message", "Utente eliminato con successo"));
        } catch (Exception e) {
            logger.error("Errore nell'eliminazione dell'utente con ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nell'eliminazione dell'utente: " + e.getMessage()));
        }
    }

    // Modifica i ruoli di un utente
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long id, @RequestBody Map<String, Object> rolesData) {
        logger.info("PUT /api/users/{}/roles - Richiesta aggiornamento ruoli utente ricevuta", id);
        logger.info("Dati ruoli ricevuti: {}", rolesData);

        try {
            // Verifica che l'utente esista
            logger.info("Cerco l'utente con ID {} nel database", id);

            // Verifica esplicita se l'ID è troppo grande (per gestire l'esempio con ID 999)
            if (id > Integer.MAX_VALUE || !userRepository.existsById(id)) {
                String message = "Utente con ID " + id + " non trovato nel database";
                logger.warn(message);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", message));
            }

            Optional<User> userOptional = userRepository.findById(id);

            if (userOptional.isEmpty()) {
                String message = "Utente con ID " + id + " non trovato";
                logger.warn(message);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", message));
            }

            User user = userOptional.get();
            logger.info("Utente trovato: {}", user.getUsername());

            // Aggiorna i ruoli dell'utente
            if (rolesData.containsKey("roles")) {
                try {
                    Object rolesObj = rolesData.get("roles");

                    if (!(rolesObj instanceof List)) {
                        String message = "Formato ruoli non valido: deve essere un array";
                        logger.warn(message);
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", message));
                    }

                    List<?> roleNames = (List<?>) rolesObj;
                    logger.info("Ruoli ricevuti: {}", roleNames);

                    if (roleNames.isEmpty()) {
                        String message = "La lista dei ruoli non può essere vuota";
                        logger.warn(message);
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", message));
                    }

                    Set<Role> roles = new HashSet<>();

                    for (Object roleName : roleNames) {
                        if (roleName == null) {
                            logger.warn("Ricevuto un ruolo null nella lista");
                            continue;
                        }

                        String roleStr = roleName.toString();
                        logger.info("Elaborazione ruolo: {}", roleStr);

                        com.rnbmx.shop.model.ERole eRole = roleStr.equals("ADMIN")
                                ? com.rnbmx.shop.model.ERole.ROLE_ADMIN
                                : com.rnbmx.shop.model.ERole.ROLE_USER;

                        logger.info("Cercando il ruolo {} nel database", eRole);
                        Optional<Role> roleOptional = roleRepository.findByName(eRole);

                        if (roleOptional.isPresent()) {
                            roles.add(roleOptional.get());
                            logger.info("Ruolo {} aggiunto", eRole);
                        } else {
                            logger.warn("Ruolo {} non trovato nel database", eRole);
                        }
                    }

                    if (roles.isEmpty()) {
                        String message = "Nessun ruolo valido trovato dai dati forniti";
                        logger.warn(message);
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", message));
                    }

                    logger.info("Impostazione dei ruoli per l'utente: {}", roles);
                    user.setRoles(roles);

                    logger.info("Salvataggio dell'utente nel database");
                    User savedUser = userRepository.save(user);
                    logger.info("Utente salvato: {}", savedUser);

                    logger.info("Ruoli dell'utente con ID {} aggiornati con successo: {}", id, roles);
                } catch (ClassCastException e) {
                    String message = "Formato ruoli non valido: " + e.getMessage();
                    logger.error(message, e);
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", message));
                } catch (Exception e) {
                    logger.error("Errore durante l'elaborazione dei ruoli: {}", e.getMessage(), e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("message", "Errore durante l'elaborazione dei ruoli: " + e.getMessage()));
                }
            } else {
                logger.warn("Nessun campo 'roles' specificato nella richiesta per l'utente con ID {}", id);
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Nessun ruolo specificato nella richiesta"));
            }

            logger.info("Preparazione della risposta con i dati utente aggiornati");
            Map<String, Object> userDTO = convertToDTO(user);
            return ResponseEntity.ok(userDTO);
        } catch (NumberFormatException e) {
            String message = "ID utente non valido: " + e.getMessage();
            logger.error(message, e);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", message));
        } catch (Exception e) {
            logger.error("Errore nell'aggiornamento dei ruoli dell'utente con ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nell'aggiornamento dei ruoli dell'utente: " + e.getMessage()));
        }
    }

    // Ottieni il profilo dell'utente corrente
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        logger.info("GET /api/users/profile - Richiesta profilo utente corrente ricevuta");

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            Optional<User> userOptional = userRepository.findById(userDetails.getId());

            if (userOptional.isEmpty()) {
                logger.warn("Utente corrente con ID {} non trovato", userDetails.getId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            Map<String, Object> userDTO = convertToDTO(userOptional.get());
            logger.info("Restituito profilo dell'utente corrente con ID {}", userDetails.getId());
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Errore nel recupero del profilo dell'utente corrente: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nel recupero del profilo: " + e.getMessage()));
        }
    }

    // Aggiorna il profilo dell'utente corrente
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> profileData) {
        logger.info("PUT /api/users/profile - Richiesta aggiornamento profilo utente corrente ricevuta");
        logger.info("Dati profilo: {}", profileData);

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            Optional<User> userOptional = userRepository.findById(userDetails.getId());

            if (userOptional.isEmpty()) {
                logger.warn("Utente corrente con ID {} non trovato", userDetails.getId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            User user = userOptional.get();

            // Aggiorna i campi dell'utente se presenti nel payload
            if (profileData.containsKey("firstName")) {
                user.setFirstName((String) profileData.get("firstName"));
            }

            if (profileData.containsKey("lastName")) {
                user.setLastName((String) profileData.get("lastName"));
            }

            if (profileData.containsKey("email")) {
                user.setEmail((String) profileData.get("email"));
            }

            if (profileData.containsKey("phone")) {
                user.setPhone((String) profileData.get("phone"));
            }

            if (profileData.containsKey("country")) {
                user.setCountry((String) profileData.get("country"));
            }

            if (profileData.containsKey("city")) {
                user.setCity((String) profileData.get("city"));
            }

            if (profileData.containsKey("address")) {
                user.setAddress((String) profileData.get("address"));
            }

            if (profileData.containsKey("gender")) {
                user.setGender((String) profileData.get("gender"));
            }

            if (profileData.containsKey("username")) {
                user.setUsername((String) profileData.get("username"));
            }

            if (profileData.containsKey("profileImage")) {
                user.setProfileImage((String) profileData.get("profileImage"));
            }

            // Salva l'utente aggiornato
            userRepository.save(user);

            Map<String, Object> userDTO = convertToDTO(user);
            logger.info("Profilo dell'utente corrente con ID {} aggiornato con successo", userDetails.getId());
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Errore nell'aggiornamento del profilo dell'utente corrente: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nell'aggiornamento del profilo: " + e.getMessage()));
        }
    }

    // Cambia la password dell'utente corrente
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        logger.info("PUT /api/users/password - Richiesta cambio password ricevuta");

        try {
            if (!passwordData.containsKey("currentPassword") ||
                    !passwordData.containsKey("newPassword") ||
                    !passwordData.containsKey("confirmPassword")) {
                logger.warn("Dati mancanti nella richiesta di cambio password");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Dati mancanti nella richiesta"));
            }

            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            String confirmPassword = passwordData.get("confirmPassword");

            if (!newPassword.equals(confirmPassword)) {
                logger.warn("La nuova password e la password di conferma non corrispondono");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "La nuova password e la password di conferma non corrispondono"));
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            Optional<User> userOptional = userRepository.findById(userDetails.getId());

            if (userOptional.isEmpty()) {
                logger.warn("Utente corrente con ID {} non trovato", userDetails.getId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utente non trovato"));
            }

            User user = userOptional.get();

            // Verifica che la password corrente sia corretta
            if (!encoder.matches(currentPassword, user.getPassword())) {
                logger.warn("Password corrente non valida per l'utente con ID {}", userDetails.getId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Password corrente non valida"));
            }

            // Aggiorna la password dell'utente
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);

            logger.info("Password dell'utente con ID {} aggiornata con successo", userDetails.getId());
            return ResponseEntity.ok(Map.of("message", "Password aggiornata con successo"));
        } catch (Exception e) {
            logger.error("Errore nel cambio della password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Errore nel cambio della password: " + e.getMessage()));
        }
    }

    // Metodo ausiliario per convertire un utente in DTO
    private Map<String, Object> convertToDTO(User user) {
        Map<String, Object> userDTO = new HashMap<>();
        userDTO.put("id", user.getId());
        userDTO.put("firstName", user.getFirstName());
        userDTO.put("lastName", user.getLastName());
        userDTO.put("name", user.getName());
        userDTO.put("surname", user.getSurname());
        userDTO.put("email", user.getEmail());
        userDTO.put("phone", user.getPhone());
        userDTO.put("country", user.getCountry());
        userDTO.put("city", user.getCity());
        userDTO.put("address", user.getAddress());
        userDTO.put("gender", user.getGender());
        userDTO.put("profileImage", user.getProfileImage());
        userDTO.put("username", user.getUsername());
        userDTO.put("createdAt", user.getCreatedAt());

        // Converte i ruoli in stringhe
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name().replace("ROLE_", ""))
                .collect(Collectors.toList());

        userDTO.put("roles", roles);

        return userDTO;
    }
}