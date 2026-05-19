package com.inuni.backend.ai.controller;

import com.inuni.backend.ai.service.AiProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai/profile")
@CrossOrigin(origins = "*")
public class AiProfileController {

    private final AiProfileService aiProfileService;

    public AiProfileController(AiProfileService aiProfileService) {
        this.aiProfileService = aiProfileService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeProfile(@RequestBody Map<String, Object> request) {
        Map<String, Object> profileData = (Map<String, Object>) request.get("profile");

        if (profileData == null || profileData.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Profile data is required");
                }}
            );
        }

        Map<String, Object> analysis = aiProfileService.analyzeProfile(profileData);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/generate-bio")
    public ResponseEntity<Map<String, Object>> generateBio(@RequestBody Map<String, Object> request) {
        Map<String, Object> profileData = (Map<String, Object>) request.get("profile");

        if (profileData == null || profileData.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Profile data is required");
                }}
            );
        }

        Map<String, Object> result = aiProfileService.generateProfileBio(profileData);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recommend-interests")
    public ResponseEntity<Map<String, Object>> recommendInterests(@RequestBody Map<String, Object> request) {
        Map<String, Object> profileData = (Map<String, Object>) request.get("profile");

        if (profileData == null || profileData.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Profile data is required");
                }}
            );
        }

        List<String> recommendations = aiProfileService.recommendInterests(profileData);

        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("recommendations", recommendations);
            put("current_interests", profileData.get("interests"));
        }});
    }

    @PostMapping("/suggest-roles")
    public ResponseEntity<Map<String, Object>> suggestRoles(@RequestBody Map<String, Object> request) {
        Map<String, Object> profileData = (Map<String, Object>) request.get("profile");

        if (profileData == null || profileData.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Profile data is required");
                }}
            );
        }

        List<String> suggestions = aiProfileService.suggestRoles(profileData);

        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("suggestions", suggestions);
            put("current_role", profileData.get("role"));
        }});
    }

    @PostMapping("/full-analytics")
    public ResponseEntity<Map<String, Object>> getFullAnalytics(@RequestBody Map<String, Object> request) {
        Map<String, Object> profileData = (Map<String, Object>) request.get("profile");

        if (profileData == null || profileData.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new HashMap<String, Object>() {{
                    put("error", "Profile data is required");
                }}
            );
        }

        Map<String, Object> analytics = aiProfileService.getProfileAnalytics(profileData);
        return ResponseEntity.ok(analytics);
    }
}

