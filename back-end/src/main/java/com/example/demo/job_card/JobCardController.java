package com.example.demo.job_card;

//import com.example.demo.dtos.*;
//import com.example.demo.entities.JobStatus;
//import com.example.demo.services.JobCardService;
import com.example.demo.job_card.JobCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/job-cards")
@RequiredArgsConstructor
public class JobCardController {


    private final JobCardService jobCardService;


    @GetMapping
    public ResponseEntity<List<JobCardResponse>> getAllJobCards() {
        try {
            return ResponseEntity.ok(jobCardService.getAllJobCards());
        } catch (Exception e) {
            log.error("Error fetching job cards", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-cards")
    public ResponseEntity<List<JobCardResponse>> getMyJobCards() {
        try {
            return ResponseEntity.ok(jobCardService.getJobCardsByUser());
        } catch (Exception e) {
            log.error("Error fetching user job cards", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createJobCard(@RequestBody JobCardCreateRequest request) {
        try {
            JobCardResponse response = jobCardService.createJobCard(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJobCard(@PathVariable Long id, @RequestBody JobCardUpdateRequest request) {
        try {
            JobCardResponse response = jobCardService.updateJobCard(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobCard(@PathVariable Long id) {
        try {
            JobCardResponse response = jobCardService.getJobCard(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching job card", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/number/{jobCardNumber}")
    public ResponseEntity<?> getJobCardByNumber(@PathVariable String jobCardNumber) {
        try {
            JobCardResponse response = jobCardService.getJobCardByNumber(jobCardNumber);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching job card by number", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobCardResponse>> searchJobCards(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String contact) {
        try {
            return ResponseEntity.ok(jobCardService.searchJobCards(customerName, contact));
        } catch (Exception e) {
            log.error("Error searching job cards", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobCardResponse>> getJobCardsByStatus(@PathVariable JobStatus status) {
        try {
            return ResponseEntity.ok(jobCardService.getJobCardsByStatus(status));
        } catch (Exception e) {
            log.error("Error fetching job cards by status", e);
            return ResponseEntity.badRequest().build();
        }
    }
}