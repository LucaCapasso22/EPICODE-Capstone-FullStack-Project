package com.rnbmx.shop.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import com.rnbmx.shop.model.ERole;
import com.rnbmx.shop.model.Role;
import com.rnbmx.shop.model.User;
import com.rnbmx.shop.payload.request.LoginRequest;
import com.rnbmx.shop.payload.request.SignupRequest;
import com.rnbmx.shop.payload.response.JwtResponse;
import com.rnbmx.shop.payload.response.MessageResponse;
import com.rnbmx.shop.repository.RoleRepository;
import com.rnbmx.shop.repository.UserRepository;
import com.rnbmx.shop.security.jwt.JwtUtils;
import com.rnbmx.shop.security.services.UserDetailsImpl;
import com.rnbmx.shop.exception.RoleNotFoundException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        logger.info("Test endpoint chiamato");
        return ResponseEntity.ok(new MessageResponse("Test endpoint funzionante!"));
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getRoles() {
        logger.info("Richiesta informazioni sui ruoli");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");

        // Controlliamo i ruoli disponibili
        List<Role> availableRoles = roleRepository.findAll();
        if (availableRoles.isEmpty()) {
            response.put("message", "Nessun ruolo trovato nel database");
        } else {
            response.put("message", "Ruoli trovati: " + availableRoles.size());
            response.put("roles", availableRoles.stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList()));
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/all")
    public ResponseEntity<?> deleteAllUsers() {
        try {
            logger.info("Richiesta di eliminazione di tutti gli utenti ricevuta");

            // Ottieni il numero di utenti prima della cancellazione
            long countBefore = userRepository.count();

            // Elimina tutti gli utenti
            userRepository.deleteAll();

            logger.info("Eliminati {} utenti dal database", countBefore);

            return ResponseEntity.ok(new MessageResponse("Eliminati " + countBefore + " utenti dal database"));
        } catch (Exception e) {
            logger.error("Errore durante l'eliminazione degli utenti: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante l'eliminazione degli utenti: " + e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Tentativo di login per: {}", loginRequest.getEmail());
        logger.debug("Password fornita (primi caratteri): {}",
                loginRequest.getPassword() != null && loginRequest.getPassword().length() > 0
                        ? loginRequest.getPassword().substring(0, Math.min(3, loginRequest.getPassword().length()))
                                + "..."
                        : "null");

        try {
            // Verifichiamo se l'utente esiste
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> {
                        logger.warn("Login fallito: utente con email {} non trovato", loginRequest.getEmail());
                        return new RuntimeException("Utente non trovato");
                    });

            logger.info("Utente trovato: {}. Password salvata (lunghezza: {})",
                    user.getEmail(),
                    user.getPassword() != null ? user.getPassword().length() : 0);
            logger.debug("Password hash salvata: {}", user.getPassword());

            // Log di tutti i dettagli dell'utente per debug
            logger.info("Dettagli utente: ID={}, Email={}, FirstName={}, LastName={}, Name={}, Surname={}, Username={}",
                    user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                    user.getName(), user.getSurname(), user.getUsername());

            try {
                // Tentiamo l'autenticazione
                logger.info("Tentativo di autenticazione con UsernamePasswordAuthenticationToken");
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

                logger.info("Autenticazione riuscita. Generazione token JWT...");
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                        .map(item -> item.getAuthority())
                        .collect(Collectors.toList());

                logger.info("Ruoli utente: {}", roles);

                // Log dettagliato dell'utente autenticato
                logger.info("Dettagli utente autenticato: ID={}, Email={}, FirstName={}, LastName={}",
                        userDetails.getId(), userDetails.getEmail(), userDetails.getFirstName(),
                        userDetails.getLastName());

                // Recupera l'utente completo dal database
                User userFromDb = userRepository.findByEmail(userDetails.getUsername())
                        .orElseThrow(() -> new RuntimeException("Utente non trovato nel DB"));

                // Includi firstName e lastName nella risposta di login
                JwtResponse response = new JwtResponse(
                        jwt,
                        userDetails.getId(),
                        userFromDb.getFirstName(),
                        userFromDb.getLastName(),
                        userDetails.getEmail(),
                        userFromDb.getPhone(),
                        userFromDb.getCountry(),
                        userFromDb.getCity(),
                        userFromDb.getAddress(),
                        userFromDb.getGender(),
                        userFromDb.getProfileImage(),
                        roles);

                logger.info("Login riuscito per: {}", loginRequest.getEmail());
                // Log dettagliato della risposta
                logger.info("Risposta JWT: ID={}, Email={}, FirstName={}, LastName={}",
                        response.getId(), response.getEmail(), response.getFirstName(), response.getLastName());
                return ResponseEntity.ok(response);
            } catch (Exception authEx) {
                logger.error("Errore specifico durante l'autenticazione: {}", authEx.getMessage(), authEx);
                logger.error("Tipo di errore: {}", authEx.getClass().getName());
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse(
                                "Credenziali non valide. Verifica email e password. Errore: " + authEx.getMessage()));
            }
        } catch (Exception e) {
            logger.error("Errore durante l'autenticazione: {}", e.getMessage());
            logger.error("Tipo di errore: {}", e.getClass().getName());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Credenziali non valide. Verifica email e password."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUserAlternative(@Valid @RequestBody LoginRequest loginRequest) {
        return authenticateUser(loginRequest);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        logger.info("Richiesta di registrazione ricevuta: {}", signUpRequest.getEmail());
        System.out.println("Richiesta ricevuta: " + signUpRequest);

        try {
            // Verifica che username e email non siano già in uso
            if (signUpRequest.getUsername() != null && userRepository.existsByUsername(signUpRequest.getUsername())) {
                logger.warn("Tentativo di registrazione con username già in uso: {}", signUpRequest.getUsername());
                System.out.println("Errore: Username già in uso!");
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Errore: Username già in uso!"));
            }

            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                logger.warn("Tentativo di registrazione con email già in uso: {}", signUpRequest.getEmail());
                System.out.println("Errore: Email già registrata!");
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Errore: Email già in uso!"));
            }

            // Crea un nuovo account utente
            User user = new User();

            // Verifica che i campi principali non siano null
            String firstName = signUpRequest.getFirstName();
            String lastName = signUpRequest.getLastName();

            if (firstName == null || firstName.trim().isEmpty()) {
                firstName = "Utente";
                logger.warn("FirstName mancante, impostato valore di default: {}", firstName);
            }

            if (lastName == null || lastName.trim().isEmpty()) {
                lastName = "Nuovo";
                logger.warn("LastName mancante, impostato valore di default: {}", lastName);
            }

            user.setFirstName(firstName);
            user.setLastName(lastName);

            // Ora siamo sicuri che name e surname saranno impostati grazie ai setter
            // modificati
            String fullName = firstName + " " + lastName;
            user.setName(fullName);
            user.setSurname(lastName);

            user.setEmail(signUpRequest.getEmail());
            user.setPhone(signUpRequest.getPhone());

            // Log della password prima della codifica
            logger.debug("Password originale (primi caratteri): {}",
                    signUpRequest.getPassword() != null && signUpRequest.getPassword().length() > 0 ? signUpRequest
                            .getPassword().substring(0, Math.min(3, signUpRequest.getPassword().length())) + "..."
                            : "null");

            // Codifica password
            String encodedPassword = encoder.encode(signUpRequest.getPassword());
            logger.debug("Password codificata: {}", encodedPassword);
            user.setPassword(encodedPassword);

            user.setCountry(signUpRequest.getCountry());
            user.setCity(signUpRequest.getCity());
            user.setAddress(signUpRequest.getAddress());
            user.setGender(signUpRequest.getGender());

            // Se username è null, genera uno username basato su nome e cognome
            if (signUpRequest.getUsername() == null || signUpRequest.getUsername().trim().isEmpty()) {
                String username = (firstName + "." + lastName).toLowerCase().replace(" ", "");
                user.setUsername(username);
                logger.info("Username generato automaticamente: {}", username);
            } else {
                user.setUsername(signUpRequest.getUsername());
            }

            // Imposta esplicitamente la data di creazione
            user.setCreatedAt(java.time.LocalDateTime.now());
            logger.info("Data di creazione impostata: {}", user.getCreatedAt());

            // Assegna i ruoli all'utente
            Set<String> strRoles = signUpRequest.getRole();
            Set<Role> roles = new HashSet<>();

            // Verifica che ci siano ruoli disponibili nel DB
            long rolesCount = roleRepository.count();
            logger.info("Numero di ruoli disponibili nel database: {}", rolesCount);

            if (rolesCount == 0) {
                // Inizializza i ruoli se non esistono
                logger.info("Nessun ruolo trovato nel DB, inizializzazione ruoli...");
                roleRepository.save(new Role(ERole.ROLE_USER));
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                logger.info("Ruoli inizializzati con successo");
            }

            if (strRoles == null || strRoles.isEmpty()) {
                // Se non è specificato alcun ruolo, assegna ROLE_USER
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> {
                            logger.error("Ruolo USER non trovato.");
                            return new RoleNotFoundException("Errore: Ruolo USER non trovato.");
                        });
                roles.add(userRole);
                logger.info("Assegnato ruolo di default USER");
            } else {
                strRoles.forEach(role -> {
                    logger.info("Elaborazione ruolo: {}", role);
                    switch (role) {
                        case "admin":
                            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                    .orElseThrow(() -> {
                                        logger.error("Ruolo ADMIN non trovato.");
                                        return new RuntimeException("Errore: Ruolo ADMIN non trovato.");
                                    });
                            roles.add(adminRole);
                            logger.info("Ruolo ADMIN aggiunto");
                            break;
                        default:
                            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                    .orElseThrow(() -> {
                                        logger.error("Ruolo USER non trovato.");
                                        return new RuntimeException("Errore: Ruolo USER non trovato.");
                                    });
                            roles.add(userRole);
                            logger.info("Ruolo USER aggiunto");
                    }
                });
            }

            user.setRoles(roles);
            logger.info("Salvataggio utente: {} con ruoli: {}", user.getEmail(), roles);

            // Log per verificare i campi name e surname prima del salvataggio
            logger.info("Campi name e surname prima del salvataggio: name={}, surname={}",
                    user.getName(), user.getSurname());

            userRepository.save(user);

            logger.info("Utente registrato con successo: {}", signUpRequest.getEmail());
            return ResponseEntity.ok(new MessageResponse("Utente registrato con successo!"));
        } catch (Exception e) {
            logger.error("Errore durante la registrazione: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore interno del server: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("GET /profile - Richiesta profilo utente ricevuta");
        logger.info("Headers - Authorization: {}", token);

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Token non valido o mancante"));
            }

            // Estrai il token
            String jwt = token.substring(7);

            // Estrai l'email dell'utente dal token
            String userEmail = jwtUtils.getUserNameFromJwtToken(jwt);
            logger.info("Email estratta dal token: {}", userEmail);

            // Cerca l'utente nel database
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> {
                        logger.warn("Utente con email {} non trovato nel database", userEmail);
                        return new RuntimeException("Utente non trovato");
                    });

            logger.info("Utente trovato: ID={}, Email={}", user.getId(), user.getEmail());

            // Crea la risposta con i dati dell'utente reale
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("firstName", user.getFirstName());
            profileData.put("lastName", user.getLastName());
            profileData.put("name", user.getName());
            profileData.put("username", user.getUsername());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone());
            profileData.put("country", user.getCountry());
            profileData.put("city", user.getCity());
            profileData.put("address", user.getAddress());
            profileData.put("gender", user.getGender());
            profileData.put("profileImage", user.getProfileImage());

            // Aggiungi i ruoli
            Set<Role> roles = user.getRoles();
            if (roles != null && !roles.isEmpty()) {
                profileData.put("roles", roles.stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()));
            } else {
                profileData.put("roles", Collections.emptyList());
            }

            logger.info("Risposta profilo utente inviata per l'utente: {}", user.getEmail());
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            logger.error("Errore durante il recupero del profilo utente: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il recupero del profilo: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody Map<String, Object> updateRequest,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("PUT /profile - Richiesta aggiornamento profilo ricevuta");
        logger.info("Request body: {}", updateRequest);
        logger.info("Headers - Authorization: {}", token);

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Token non valido o mancante"));
            }

            // Estrai il token
            String jwt = token.substring(7);

            // Estrai l'email dell'utente dal token
            String userEmail = jwtUtils.getUserNameFromJwtToken(jwt);
            logger.info("Email estratta dal token: {}", userEmail);

            // Cerca l'utente nel database
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> {
                        logger.warn("Utente con email {} non trovato nel database", userEmail);
                        return new RuntimeException("Utente non trovato");
                    });

            logger.info("Utente trovato: ID={}, Email={}", user.getId(), user.getEmail());

            // Aggiorna i campi dell'utente se presenti nella richiesta
            boolean changed = false;

            if (updateRequest.containsKey("firstName") && updateRequest.get("firstName") != null) {
                user.setFirstName((String) updateRequest.get("firstName"));
                changed = true;
            }

            if (updateRequest.containsKey("lastName") && updateRequest.get("lastName") != null) {
                user.setLastName((String) updateRequest.get("lastName"));
                changed = true;
            }

            if (updateRequest.containsKey("phone") && updateRequest.get("phone") != null) {
                user.setPhone((String) updateRequest.get("phone"));
                changed = true;
            }

            if (updateRequest.containsKey("country") && updateRequest.get("country") != null) {
                user.setCountry((String) updateRequest.get("country"));
                changed = true;
            }

            if (updateRequest.containsKey("city") && updateRequest.get("city") != null) {
                user.setCity((String) updateRequest.get("city"));
                changed = true;
            }

            if (updateRequest.containsKey("address") && updateRequest.get("address") != null) {
                user.setAddress((String) updateRequest.get("address"));
                changed = true;
            }

            if (updateRequest.containsKey("gender") && updateRequest.get("gender") != null) {
                user.setGender((String) updateRequest.get("gender"));
                changed = true;
            }

            if (updateRequest.containsKey("profileImage") && updateRequest.get("profileImage") != null) {
                user.setProfileImage((String) updateRequest.get("profileImage"));
                changed = true;
            }

            // Aggiorna anche il campo name con firstName + lastName
            if (changed) {
                String fullName = user.getFirstName() + " " + user.getLastName();
                user.setName(fullName);

                // Il campo surname è uguale a lastName
                user.setSurname(user.getLastName());

                // Salva le modifiche nel database
                userRepository.save(user);
                logger.info("Profilo utente aggiornato con successo: {}", user.getEmail());
            } else {
                logger.info("Nessun campo da aggiornare");
            }

            // Crea la risposta con i dati aggiornati dell'utente
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("firstName", user.getFirstName());
            profileData.put("lastName", user.getLastName());
            profileData.put("name", user.getName());
            profileData.put("username", user.getUsername());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone());
            profileData.put("country", user.getCountry());
            profileData.put("city", user.getCity());
            profileData.put("address", user.getAddress());
            profileData.put("gender", user.getGender());
            profileData.put("profileImage", user.getProfileImage());
            profileData.put("message", "Profilo aggiornato con successo");

            // Aggiungi i ruoli
            Set<Role> roles = user.getRoles();
            if (roles != null && !roles.isEmpty()) {
                profileData.put("roles", roles.stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()));
            } else {
                profileData.put("roles", Collections.emptyList());
            }

            logger.info("Risposta aggiornamento profilo inviata per l'utente: {}", user.getEmail());
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            logger.error("Errore durante l'aggiornamento del profilo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante l'aggiornamento del profilo: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        logger.info("Richiesta reset password per: {}", email);

        try {
            // Cerchiamo l'utente nel DB
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        logger.warn("Reset password fallito: utente con email {} non trovato", email);
                        return new RuntimeException("Utente non trovato");
                    });

            // Codifica la nuova password
            String encodedPassword = encoder.encode(newPassword);
            logger.info("Password codificata: {}", encodedPassword);

            // Aggiorniamo la password
            user.setPassword(encodedPassword);
            userRepository.save(user);

            logger.info("Password reimpostata con successo per: {}", email);
            return ResponseEntity.ok(new MessageResponse("Password reimpostata con successo"));
        } catch (Exception e) {
            logger.error("Errore durante il reset della password: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il reset della password: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/check-user")
    public ResponseEntity<?> checkUserExists(@RequestParam String email) {
        logger.info("Richiesta verifica utente: {}", email);

        try {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ok");

            // Verifica se l'utente esiste
            boolean userExists = userRepository.existsByEmail(email);
            response.put("userExists", userExists);

            if (userExists) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Utente non trovato"));

                // Non esporre la password, ma verifichiamo che non sia null
                response.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                response.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);

                // Aggiungiamo alcune informazioni sull'utente per debug
                response.put("userId", user.getId());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());

                // Verifichiamo anche i ruoli
                Set<Role> roles = user.getRoles();
                if (roles != null && !roles.isEmpty()) {
                    response.put("roles", roles.stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toList()));
                } else {
                    response.put("roles", Collections.emptyList());
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante la verifica dell'utente: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante la verifica dell'utente: " + e.getMessage()));
        }
    }

    @PostMapping("/debug/reset-password")
    public ResponseEntity<?> resetPasswordDebug(@RequestParam String email,
            @RequestParam(defaultValue = "password123") String password) {
        logger.info("Richiesta reset password per debug: {}", email);

        try {
            // Cerchiamo l'utente nel DB
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                logger.warn("Reset password fallito: utente con email {} non trovato", email);
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Utente non trovato"));
            }

            User user = userOpt.get();

            // Codifica la nuova password
            String encodedPassword = encoder.encode(password);
            logger.info("Password codificata generata per {}: {}", email, encodedPassword);

            // Aggiorniamo la password
            user.setPassword(encodedPassword);
            userRepository.save(user);

            logger.info("Password reimpostata con successo per: {}", email);
            return ResponseEntity.ok(new MessageResponse("Password reimpostata con successo a '" + password + "'"));
        } catch (Exception e) {
            logger.error("Errore durante il reset della password: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il reset della password: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/list-users")
    public ResponseEntity<?> listAllUsers() {
        logger.info("Richiesta lista di tutti gli utenti per debug");

        try {
            List<User> users = userRepository.findAll();

            // Creiamo una lista di oggetti con solo le informazioni essenziali
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("email", user.getEmail());
                userInfo.put("username", user.getUsername());
                userInfo.put("firstName", user.getFirstName());
                userInfo.put("lastName", user.getLastName());
                userInfo.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                userInfo.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);

                // Verifichiamo anche i ruoli
                Set<Role> roles = user.getRoles();
                if (roles != null && !roles.isEmpty()) {
                    userInfo.put("roles", roles.stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toList()));
                } else {
                    userInfo.put("roles", Collections.emptyList());
                }

                return userInfo;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("userCount", users.size());
            response.put("users", userList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante il recupero degli utenti: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il recupero degli utenti: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/test-auth")
    public ResponseEntity<?> testAuth() {
        logger.info("Endpoint test-auth chiamato");

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new java.util.Date().toString());
        response.put("status", "ok");
        response.put("message", "Endpoint di test autenticazione funzionante");

        // Conteggio utenti nel database
        long userCount = userRepository.count();
        response.put("userCount", userCount);

        // Conteggio ruoli nel database
        long roleCount = roleRepository.count();
        response.put("roleCount", roleCount);

        // Informazioni su datasource e stato database
        try {
            response.put("databaseInfo", "PostgreSQL");
        } catch (Exception e) {
            response.put("databaseError", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/debug/password-info")
    public ResponseEntity<?> getPasswordInfo(@RequestParam String email) {
        logger.info("Richiesta informazioni password per: {}", email);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            Map<String, Object> response = new HashMap<>();

            if (!userOpt.isPresent()) {
                response.put("status", "error");
                response.put("message", "Utente non trovato");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User user = userOpt.get();
            String password = user.getPassword();

            response.put("status", "ok");
            response.put("email", user.getEmail());
            response.put("hasPassword", password != null && !password.isEmpty());
            response.put("passwordLength", password != null ? password.length() : 0);

            // Verifichiamo se la password è nel formato BCrypt
            if (password != null && password.startsWith("$2a$")) {
                response.put("format", "BCrypt");
                response.put("hashPrefix", password.substring(0, 7)); // $2a$10$
            } else {
                response.put("format", "unknown");
            }

            // Test con password nota
            if (password != null) {
                boolean matches = encoder.matches("password123", password);
                response.put("matchesDefault", matches);
                if (!matches) {
                    // Creiamo un hash per confronto
                    String expectedHash = encoder.encode("password123");
                    response.put("defaultPasswordHash", expectedHash);
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante il recupero delle informazioni sulla password: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Errore interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint di prova per verificare la connessione al database
    @GetMapping("/testdb")
    public ResponseEntity<?> testDB() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lista degli utenti (informazioni limitate)
            List<Map<String, Object>> users = new ArrayList<>();
            jdbcTemplate.query(
                    "SELECT id, email, username, first_name, last_name, name, surname FROM users ORDER BY id",
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

            response.put("status", "success");
            response.put("message", "Connessione al database riuscita");
            response.put("users", users);
            response.put("count", users.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Errore durante il test del database: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/reset-all-passwords")
    public ResponseEntity<?> resetAllPasswords() {
        logger.info("=== Richiesta di reimpostazione password predefinite per test ===");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");

        try {
            // Elenco email per cui reimpostare la password
            String[] emails = {
                    "admin@rnbmx.com",
                    "lucacapassona@gmail.com",
                    "test@gmail.com"
            };

            // Password predefinita per tutti
            String defaultPassword = "password123";
            String encodedPassword = encoder.encode(defaultPassword);

            List<Map<String, Object>> resetUsers = new ArrayList<>();

            for (String email : emails) {
                Map<String, Object> userStatus = new HashMap<>();
                userStatus.put("email", email);

                Optional<User> userOpt = userRepository.findByEmail(email);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    // Salva la password precedente per riferimento
                    String oldPassword = user.getPassword();
                    userStatus.put("oldPasswordHash", oldPassword);

                    // Imposta la nuova password
                    user.setPassword(encodedPassword);
                    userRepository.save(user);

                    userStatus.put("status", "reset");
                    userStatus.put("newPasswordHash", encodedPassword);

                    logger.info("Password reimpostata per: {}", email);
                } else {
                    userStatus.put("status", "user_not_found");
                    logger.warn("Utente con email {} non trovato nel database", email);
                }

                resetUsers.add(userStatus);
            }

            response.put("resetUsers", resetUsers);
            response.put("defaultPassword", defaultPassword);
            response.put("loginInstructions",
                    "Per effettuare il login, utilizza una delle email con la password indicata");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante la reimpostazione delle password: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", "Errore: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData,
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("POST /change-password - Richiesta cambio password ricevuta");
        logger.info("Authorization Header: {}",
                token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null");

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                logger.warn("Token non valido o mancante");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Token non valido o mancante"));
            }

            // Estrai il token
            String jwt = token.substring(7);
            logger.info("Token JWT estratto, lunghezza: {}", jwt.length());

            try {
                // Estrai l'email dell'utente dal token
                String userEmail = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.info("Email estratta dal token: {}", userEmail);

                // Cerca l'utente nel database
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> {
                            logger.warn("Utente con email {} non trovato nel database", userEmail);
                            return new RuntimeException("Utente non trovato");
                        });

                logger.info("Utente trovato: ID={}, Email={}", user.getId(), user.getEmail());

                // Verifica password attuale
                String currentPassword = passwordData.get("currentPassword");
                if (currentPassword == null || currentPassword.trim().isEmpty()) {
                    logger.warn("Password attuale non fornita");
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("La password attuale è obbligatoria"));
                }

                if (!encoder.matches(currentPassword, user.getPassword())) {
                    logger.warn("Cambio password fallito: password attuale non valida per l'utente {}", userEmail);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new MessageResponse("Password attuale non valida"));
                }

                // Aggiorna la password
                String newPassword = passwordData.get("newPassword");
                if (newPassword == null || newPassword.trim().isEmpty()) {
                    logger.warn("Nuova password non fornita");
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("La nuova password è obbligatoria"));
                }

                // Verifica che la nuova password sia diversa dalla precedente
                if (encoder.matches(newPassword, user.getPassword())) {
                    logger.warn("La nuova password è uguale alla precedente");
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("La nuova password deve essere diversa dalla precedente"));
                }

                // Codifica e salva la nuova password
                String encodedPassword = encoder.encode(newPassword);
                user.setPassword(encodedPassword);
                userRepository.save(user);

                // Crea un nuovo token JWT per l'utente dopo l'aggiornamento della password
                UserDetailsImpl userDetails = UserDetailsImpl.build(user);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // Genera un nuovo token JWT
                String newToken = jwtUtils.generateJwtToken(authentication);

                logger.info("Password cambiata con successo per l'utente: {}", userEmail);

                // Restituisci il nuovo token JWT nella risposta
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Password aggiornata con successo");
                response.put("token", newToken);

                return ResponseEntity.ok(response);
            } catch (SignatureException e) {
                logger.error("Firma JWT non valida: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Errore di autenticazione: firma del token non valida"));
            } catch (MalformedJwtException e) {
                logger.error("Token JWT non valido: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Errore di autenticazione: token malformato"));
            } catch (ExpiredJwtException e) {
                logger.error("Token JWT scaduto: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Sessione scaduta. Effettuare nuovamente il login."));
            } catch (UnsupportedJwtException e) {
                logger.error("Token JWT non supportato: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Errore di autenticazione: token non supportato"));
            } catch (IllegalArgumentException e) {
                logger.error("Il claim del token JWT è vuoto: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Errore di autenticazione: token vuoto o mancante"));
            }
        } catch (Exception e) {
            logger.error("Errore durante il cambio password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il cambio password: " + e.getMessage()));
        }
    }

    @PostMapping("/assign-admin-role")
    public ResponseEntity<?> assignAdminRole(@RequestParam String username) {
        logger.info("POST /api/auth/assign-admin-role - Richiesta di assegnazione ruolo admin per username: {}",
                username);

        try {
            // Cerca l'utente nel database per username
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (!userOptional.isPresent()) {
                logger.warn("Utente con username {} non trovato", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Utente non trovato"));
            }

            User user = userOptional.get();
            logger.info("Utente trovato: ID={}, Email={}", user.getId(), user.getEmail());

            // Verifica che ci siano ruoli disponibili nel DB
            long rolesCount = roleRepository.count();
            logger.info("Numero di ruoli disponibili nel database: {}", rolesCount);

            if (rolesCount == 0) {
                // Inizializza i ruoli se non esistono
                logger.info("Nessun ruolo trovato nel DB, inizializzazione ruoli...");
                roleRepository.save(new Role(ERole.ROLE_USER));
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                logger.info("Ruoli inizializzati con successo");
            }

            // Trova il ruolo admin
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> {
                        logger.error("Ruolo ADMIN non trovato nel database");
                        return new RuntimeException("Errore: Ruolo ADMIN non trovato");
                    });

            // Verifica se l'utente ha già il ruolo admin
            boolean hasAdminRole = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);

            if (hasAdminRole) {
                logger.info("L'utente {} ha già il ruolo ADMIN", username);
                return ResponseEntity.ok(new MessageResponse("L'utente ha già il ruolo ADMIN"));
            }

            // Aggiungi il ruolo admin
            user.getRoles().add(adminRole);
            userRepository.save(user);

            logger.info("Ruolo ADMIN assegnato con successo all'utente {}", username);

            // Prepara la risposta
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Ruolo ADMIN assegnato con successo");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante l'assegnazione del ruolo ADMIN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante l'assegnazione del ruolo ADMIN: " + e.getMessage()));
        }
    }

    @GetMapping("/check-password-reset")
    public ResponseEntity<?> checkPasswordReset(@RequestParam String email) {
        logger.info("GET /api/auth/check-password-reset - Verifica stato password per: {}", email);

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                logger.warn("Utente con email {} non trovato nel database", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Utente non trovato"));
            }

            User user = userOpt.get();
            String currentPasswordHash = user.getPassword();

            // Verifica se la password è ancora quella di default (password123)
            boolean isDefaultPassword = encoder.matches("password123", currentPasswordHash);

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("isDefaultPassword", isDefaultPassword);
            response.put("passwordHashLength", currentPasswordHash != null ? currentPasswordHash.length() : 0);
            response.put("message", isDefaultPassword
                    ? "La password è ancora quella di default (password123)"
                    : "La password è stata cambiata rispetto al valore di default");

            logger.info("Verifica password completata per: {} - È password di default: {}", email, isDefaultPassword);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante la verifica della password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante la verifica della password: " + e.getMessage()));
        }
    }

    @PostMapping("/debug-login")
    public ResponseEntity<?> debugLogin(@RequestBody Map<String, Object> loginRequest) {
        logger.info("POST /api/auth/debug-login - Richiesta di login debug ricevuta");
        logger.info("Parametri ricevuti: {}", loginRequest);

        String email = (String) loginRequest.get("email");
        boolean isDebug = loginRequest.containsKey("debug") && Boolean.TRUE.equals(loginRequest.get("debug"));

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email richiesta"));
        }

        try {
            // Verifica se l'utente esiste
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                logger.warn("Utente con email {} non trovato", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Utente non trovato"));
            }

            User user = userOpt.get();
            logger.info("Utente trovato: ID={}, Email={}", user.getId(), user.getEmail());

            // Genera un nuovo token per l'utente
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String jwt = jwtUtils.generateJwtToken(userDetails);

            // Prepara la risposta
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login debug eseguito con successo");
            response.put("token", jwt);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList()));

            logger.info("Debug login eseguito con successo per l'utente: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Errore durante il debug login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Errore durante il debug login: " + e.getMessage()));
        }
    }
}