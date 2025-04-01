package com.rnbmx.shop.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.rnbmx.shop.payload.response.MessageResponse;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        logger.error("Validazione fallita: {}", errors);
        return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Errore di validazione", errors));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException ex) {
        logger.error("Credenziali non valide: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Credenziali non valide. Verifica email e password."));
    }

    @ExceptionHandler(InternalAuthenticationServiceException.class)
    public ResponseEntity<?> handleInternalAuthException(InternalAuthenticationServiceException ex) {
        logger.error("Errore interno di autenticazione: {}", ex.getMessage(), ex);

        // Estrai la causa principale dell'errore
        Throwable cause = ex.getCause();
        String detailMessage = "Errore di autenticazione interno";

        if (cause != null) {
            detailMessage += ": " + cause.getMessage();
            logger.error("Causa dell'errore: {}", cause.getClass().getName());
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.withDetail("Errore durante l'autenticazione", detailMessage));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex) {
        logger.error("Errore di autenticazione: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Errore di autenticazione: " + ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralException(Exception ex) {
        logger.error("Errore non gestito: {}", ex.getMessage(), ex);

        // Crea una risposta con maggiori dettagli per il debug
        Map<String, Object> details = new HashMap<>();
        details.put("exceptionType", ex.getClass().getName());
        details.put("message", ex.getMessage());

        if (ex.getCause() != null) {
            details.put("cause", ex.getCause().getMessage());
            details.put("causeType", ex.getCause().getClass().getName());
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.withDetails("Si è verificato un errore interno", details));
    }
}