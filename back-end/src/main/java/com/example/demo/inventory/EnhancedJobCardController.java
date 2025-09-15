package com.example.demo.inventory;


import com.example.demo.inventory.dto.JobCardItemRequest;
//import com.example.demo.inventory.service.JobCardItemService;
import com.example.demo.job_card.JobCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/job-cards")
@RequiredArgsConstructor
public class EnhancedJobCardController {

    private final JobCardService jobCardService;
    private final JobCardItemService jobCardItemService;


    @PostMapping("/{jobCardId}/items")
    public ResponseEntity<?> addItemToJobCard(@PathVariable Long jobCardId,
                                              @RequestBody JobCardItemRequest request) {
        try {
            jobCardItemService.addItemToJobCard(jobCardId, request);
            return ResponseEntity.ok(Map.of("message", "Item added to job card successfully"));
        } catch (Exception e) {
            log.error("Error adding item to job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{jobCardId}/items/bulk")
    public ResponseEntity<?> addItemsToJobCard(@PathVariable Long jobCardId,
                                               @RequestBody List<JobCardItemRequest> requests) {
        try {
            jobCardItemService.addItemsToJobCard(jobCardId, requests);
            return ResponseEntity.ok(Map.of("message", "Items added to job card successfully"));
        } catch (Exception e) {
            log.error("Error adding items to job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{jobCardId}/items/{itemId}")
    public ResponseEntity<?> removeItemFromJobCard(@PathVariable Long jobCardId,
                                                   @PathVariable Long itemId) {
        try {
            jobCardItemService.removeItemFromJobCard(jobCardId, itemId);
            return ResponseEntity.ok(Map.of("message", "Item removed from job card successfully"));
        } catch (Exception e) {
            log.error("Error removing item from job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{jobCardId}/enhanced")
    public ResponseEntity<?> getEnhancedJobCard(@PathVariable Long jobCardId) {
        try {
            DashboardService.EnhancedJobCardResponse response = jobCardItemService.getEnhancedJobCard(jobCardId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching enhanced job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
