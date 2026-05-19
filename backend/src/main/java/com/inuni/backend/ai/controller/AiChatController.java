package com.inuni.backend.ai.controller;

import com.inuni.backend.ai.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai/chat")
@CrossOrigin(origins = "*")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getSuggestions(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Message is required");
                }}
            );
        }

        Map<String, Object> result = aiChatService.getSuggestions(message);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<Map<String, Object>> getAutoComplete(
            @RequestParam String prefix,
            @RequestParam(required = false) String context) {

        List<String> suggestions = aiChatService.getAutoComplete(prefix, context);

        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("prefix", prefix);
            put("suggestions", suggestions);
        }});
    }

    @PostMapping("/enrich")
    public ResponseEntity<Map<String, Object>> enrichMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Message is required");
                }}
            );
        }

        Map<String, Object> result = aiChatService.enrichMessage(message);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/should-reply")
    public ResponseEntity<Map<String, Object>> shouldReply(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        boolean shouldReply = aiChatService.shouldPromptResponse(message);

        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("message", message);
            put("shouldReply", shouldReply);
        }});
    }
}

