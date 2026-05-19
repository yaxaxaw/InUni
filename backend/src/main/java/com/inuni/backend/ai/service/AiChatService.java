package com.inuni.backend.ai.service;

import com.inuni.backend.ai.client.AiServiceClient;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AiChatService {

    private final AiServiceClient aiServiceClient;

    public AiChatService(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    public Map<String, Object> getSuggestions(String message) {
        Map<String, Object> aiResponse = aiServiceClient.getChatSuggestions(message);

        return new HashMap<String, Object>() {{
            put("suggestions", aiResponse.get("suggestions"));
            put("intent", aiResponse.get("intent"));
            put("confidence", 0.85);
            putAll(aiResponse);
        }};
    }

    public List<String> getAutoComplete(String prefix, String context) {
        Map<String, Object> response = aiServiceClient.getAutoComplete(prefix, context);
        Object suggestions = response.get("suggestions");

        if (suggestions instanceof List) {
            return (List<String>) suggestions;
        }
        return new ArrayList<>();
    }

    public Map<String, Object> enrichMessage(String messageText) {
        Map<String, Object> intent = aiServiceClient.detectIntent(messageText);
        Map<String, Object> suggestions = aiServiceClient.getChatSuggestions(messageText);

        return new HashMap<String, Object>() {{
            put("message", messageText);
            put("intent", intent.get("intent"));
            put("suggestions", suggestions.get("suggestions"));
            put("confidence", intent.get("confidence"));
        }};
    }

    public boolean shouldPromptResponse(String message) {
        Map<String, Object> intent = aiServiceClient.detectIntent(message);
        String intentType = (String) intent.get("intent");

        return "team_invitation".equals(intentType) ||
               "knowledge_sharing".equals(intentType) ||
               "feedback".equals(intentType);
    }
}

