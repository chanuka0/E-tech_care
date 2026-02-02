
package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.entity.JobCard;
import com.example.demo.entity.JobStatus;
import com.example.demo.repositories.CustomerRepository;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerSummaryController {  // ✅ REMOVED @RequestMapping

    private final CustomerRepository customerRepository;
    private final JobCardRepository jobCardRepository;

    /**
     * Main endpoint for customer summary
     */
    @GetMapping("/api/customer-summary/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCustomerSummary(@PathVariable Long customerId) {
        return getCustomerSummaryData(customerId);
    }

    /**
     * Alias endpoint for job card creation (frontend compatibility)
     */
    @GetMapping("/api/jobcards/customers/{customerId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCustomerSummaryForJobCard(@PathVariable Long customerId) {
        return getCustomerSummaryData(customerId);
    }

    /**
     * Common method to get customer summary data
     */
    private ResponseEntity<?> getCustomerSummaryData(Long customerId) {
        try {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

            Map<String, Object> summary = new HashMap<>();
            summary.put("customerId", customer.getCustomerId());
            summary.put("customerName", customer.getCustomerName());
            summary.put("phoneNumber", customer.getPhoneNumber());
            summary.put("email", customer.getEmail());
            summary.put("address", customer.getAddress());
            summary.put("totalServiceCount", customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0);
            summary.put("creditBalance", customer.getCreditBalance() != null ? customer.getCreditBalance() : 0.0);
            summary.put("totalJobCards", jobCards.size());

            Map<String, Long> statusCounts = jobCards.stream()
                    .collect(Collectors.groupingBy(
                            jc -> jc.getStatus() != null ? jc.getStatus().toString() : "UNKNOWN",
                            Collectors.counting()
                    ));
            summary.put("jobsByStatus", statusCounts);

            Double totalServiceCost = jobCards.stream()
                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
                    .sum();
            summary.put("totalServiceCost", totalServiceCost);

            summary.put("lastVisit", customer.getLastVisit());
            summary.put("createdAt", customer.getCreatedAt());
            summary.put("isActive", customer.getIsActive() != null ? customer.getIsActive() : true);
            summary.put("notes", customer.getNotes());

            return ResponseEntity.ok(summary);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now(),
                            "status", "NOT_FOUND"
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Error retrieving customer summary: " + e.getMessage(),
                            "timestamp", LocalDateTime.now(),
                            "status", "ERROR"
                    ));
        }
    }

    @GetMapping("/api/customer-summary/{customerId}/job-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCustomerJobCount(@PathVariable Long customerId) {
        try {
            customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

            return ResponseEntity.ok(Map.of(
                    "customerId", customerId,
                    "totalJobCards", jobCards.size(),
                    "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
        }
    }

    @GetMapping("/api/customer-summary/{customerId}/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCustomerJobCards(
            @PathVariable Long customerId,
            @RequestParam(required = false) String status) {
        try {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            List<JobCard> jobCards;
            if (status != null && !status.isEmpty()) {
                try {
                    JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
                    jobCards = jobCardRepository.findByCustomerIdAndStatus(customerId, jobStatus);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid status", "timestamp", LocalDateTime.now()));
                }
            } else {
                jobCards = jobCardRepository.findByCustomerId(customerId);
            }

            return ResponseEntity.ok(Map.of(
                    "customerId", customerId,
                    "customerName", customer.getCustomerName(),
                    "jobCards", jobCards,
                    "totalCount", jobCards.size(),
                    "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
        }
    }

    @GetMapping("/api/customer-summary/{customerId}/total-spending")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCustomerTotalSpending(@PathVariable Long customerId) {
        try {
            customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

            Double totalSpending = jobCards.stream()
                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
                    .sum();

            return ResponseEntity.ok(Map.of(
                    "customerId", customerId,
                    "totalSpending", totalSpending,
                    "jobCardCount", jobCards.size(),
                    "averageSpending", jobCards.isEmpty() ? 0.0 : totalSpending / jobCards.size(),
                    "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
        }
    }
}