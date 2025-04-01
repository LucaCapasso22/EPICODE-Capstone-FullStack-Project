package com.rnbmx.shop.payload.response;

import java.util.Map;

public class MessageResponse {
    private String message;
    private Map<String, String> errors;
    private Map<String, Object> details;

    public MessageResponse(String message) {
        this.message = message;
    }

    public MessageResponse(String message, Map<String, String> errors) {
        this.message = message;
        this.errors = errors;
    }

    public static MessageResponse withDetail(String message, String detailMessage) {
        MessageResponse response = new MessageResponse(message);
        response.details = Map.of("detail", detailMessage);
        return response;
    }

    public static MessageResponse withDetails(String message, Map<String, Object> details) {
        MessageResponse response = new MessageResponse(message);
        response.details = details;
        return response;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}