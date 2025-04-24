package com.matthew.RecipeGenerator.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matthew.RecipeGenerator.Service.AppleNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
@Slf4j
public class WebhookController {

    @Autowired
    private AppleNotificationService appleNotificationService;

    @PostMapping("/apple")
    public ResponseEntity<Void> handleAppleNotification(@RequestBody String payload) {
        log.info("Received Apple notification webhook");
        try {
            appleNotificationService.processNotification(payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing Apple notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
