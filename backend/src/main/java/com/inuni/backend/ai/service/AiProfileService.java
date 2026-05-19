package com.inuni.backend.ai.service;

import com.inuni.backend.ai.client.AiServiceClient;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AiProfileService {

    private final AiServiceClient aiServiceClient;

    public AiProfileService(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    public Map<String, Object> analyzeProfile(Map<String, Object> profileData) {
        return aiServiceClient.getProfileImprovementSuggestions(profileData);
    }

    public Map<String, Object> generateProfileBio(Map<String, Object> profileData) {
        return aiServiceClient.generateBio(profileData);
    }

    public List<String> recommendInterests(Map<String, Object> profileData) {
        Map<String, Object> response = aiServiceClient.recommendInterests(profileData);
        Object recommendations = response.get("recommendations");

        if (recommendations instanceof List) {
            return (List<String>) recommendations;
        }
        return new ArrayList<>();
    }

    public List<String> suggestRoles(Map<String, Object> profileData) {
        Map<String, Object> response = aiServiceClient.suggestRoles(profileData);
        Object suggestions = response.get("suggestions");

        if (suggestions instanceof List) {
            return (List<String>) suggestions;
        }
        return new ArrayList<>();
    }

    public Map<String, Object> getProfileAnalytics(Map<String, Object> profileData) {
        Map<String, Object> suggestions = analyzeProfile(profileData);
        List<String> interests = recommendInterests(profileData);
        List<String> roles = suggestRoles(profileData);

        return new HashMap<String, Object>() {{
            put("suggestions", suggestions.get("suggestions"));
            put("completeness", suggestions.get("completeness_score"));
            put("priority", suggestions.get("priority"));
            put("recommendedInterests", interests);
            put("suggestedRoles", roles);
        }};
    }
}

