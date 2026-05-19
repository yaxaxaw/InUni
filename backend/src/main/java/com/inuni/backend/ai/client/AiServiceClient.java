package com.inuni.backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Component
public class AiServiceClient {

    @Value("${ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public Map<String, Object> getChatSuggestions(String message) {
        try {
            String url = aiServiceUrl + "/ai/chat/suggestions";
            Map<String, String> body = new HashMap<>();
            body.put("text", message);

            HttpEntity<?> request = new HttpEntity<>(body, getHeaders());
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to get chat suggestions: " + e.getMessage());
        }
    }

    public Map<String, Object> getAutoComplete(String prefix, String context) {
        try {
            String url = aiServiceUrl + "/ai/chat/auto-complete?prefix=" + prefix;
            if (context != null) {
                url += "&context=" + context;
            }
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to get autocomplete: " + e.getMessage());
        }
    }

    public Map<String, Object> detectIntent(String message) {
        try {
            String url = aiServiceUrl + "/ai/chat/intent-detection?message=" + message;
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to detect intent: " + e.getMessage());
        }
    }

    public Map<String, Object> getProfileImprovementSuggestions(Map<String, Object> profileData) {
        try {
            String url = aiServiceUrl + "/ai/profile/improvement-suggestions";
            Map<String, Object> body = new HashMap<>();
            body.put("profile", profileData);

            HttpEntity<?> request = new HttpEntity<>(body, getHeaders());
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to get profile suggestions: " + e.getMessage());
        }
    }

    public Map<String, Object> generateBio(Map<String, Object> profileData) {
        try {
            String url = aiServiceUrl + "/ai/profile/generate-bio";
            HttpEntity<?> request = new HttpEntity<>(profileData, getHeaders());
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to generate bio: " + e.getMessage());
        }
    }

    public Map<String, Object> recommendInterests(Map<String, Object> profileData) {
        try {
            String url = aiServiceUrl + "/ai/profile/interest-recommendations";
            HttpEntity<?> request = new HttpEntity<>(profileData, getHeaders());
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to get interest recommendations: " + e.getMessage());
        }
    }

    public Map<String, Object> suggestRoles(Map<String, Object> profileData) {
        try {
            String url = aiServiceUrl + "/ai/profile/role-suggestions";
            HttpEntity<?> request = new HttpEntity<>(profileData, getHeaders());
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return createErrorResponse("Failed to suggest roles: " + e.getMessage());
        }
    }

    private Map<String, Object> createErrorResponse(String error) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("error", error);
        return response;
    }
}

