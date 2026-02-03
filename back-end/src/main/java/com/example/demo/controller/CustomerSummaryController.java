
package com.example.demo.controller;

import com.example.demo.entity.CustomerSummary;
import com.example.demo.service.CustomerSummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://16.16.203.25"})
public class CustomerSummaryController {

    private final CustomerSummaryService customerSummaryService;

    // ─── Legacy endpoint – quick overview for job card creation ────────────
    @GetMapping("/customer-summary/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerSummaryQuick(@PathVariable Long customerId) {
        try {
            log.info("Fetching quick summary for customer ID: {}", customerId);
            Map<String, Object> summary = customerSummaryService.getSummaryStats(customerId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching quick summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch summary"));
        }
    }

    // ─── Alias for job card creation – same as legacy endpoint ─────────────
    @GetMapping("/jobcards/customers/{customerId}/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerSummaryForJobCard(@PathVariable Long customerId) {
        return getCustomerSummaryQuick(customerId);
    }

    // ─── Detailed summary with full job history + invoices ─────────────────
    @GetMapping("/customers/{customerId}/summary/detailed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDetailedCustomerSummary(@PathVariable Long customerId) {
        try {
            log.info("Fetching detailed summary for customer ID: {}", customerId);
            Map<String, Object> detailedSummary = customerSummaryService.getDetailedSummary(customerId);
            return ResponseEntity.ok(detailedSummary);
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching detailed summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch detailed summary"));
        }
    }

    // ─── Quick stats only ───────────────────────────────────────────────────
    @GetMapping("/customers/{customerId}/summary/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerStats(@PathVariable Long customerId) {
        try {
            log.info("Fetching stats for customer ID: {}", customerId);
            Map<String, Object> stats = customerSummaryService.getSummaryStats(customerId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching stats for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch stats"));
        }
    }

    // ─── Manual trigger to update / refresh a single customer summary ──────
    @PostMapping("/customers/{customerId}/summary/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCustomerSummary(@PathVariable Long customerId) {
        try {
            log.info("Manually updating summary for customer ID: {}", customerId);
            CustomerSummary updated = customerSummaryService.updateSummary(customerId);
            return ResponseEntity.ok(Map.of(
                    "message", "Customer summary updated successfully",
                    "summary", updated
            ));
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update summary"));
        }
    }

    // ─── Admin: refresh ALL customer summaries ─────────────────────────────
    @PostMapping("/customers/summary/refresh-all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> refreshAllCustomerSummaries() {
        try {
            log.info("Refreshing all customer summaries");
            customerSummaryService.refreshAllSummaries();
            return ResponseEntity.ok(Map.of("message", "All customer summaries refreshed successfully"));
        } catch (Exception e) {
            log.error("Error refreshing all summaries: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to refresh summaries"));
        }
    }

    // ─── Filter jobs by status ──────────────────────────────────────────────
    @GetMapping("/customer-summary/{customerId}/jobs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerJobsByStatus(
            @PathVariable Long customerId,
            @RequestParam(required = false) String status) {
        try {
            Map<String, Object> detailedSummary = customerSummaryService.getDetailedSummary(customerId);

            if (status != null && !status.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> jobHistory = (Map<String, Object>) detailedSummary.get("jobHistory");
                return ResponseEntity.ok(Map.of(
                        "status", status,
                        "jobs", jobHistory.get("jobs")
                ));
            }

            return ResponseEntity.ok(detailedSummary.get("jobHistory"));
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching jobs for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch jobs"));
        }
    }

    // ─── Total spending analytics ───────────────────────────────────────────
    @GetMapping("/customer-summary/{customerId}/total-spending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerTotalSpending(@PathVariable Long customerId) {
        try {
            Map<String, Object> summary = customerSummaryService.getSummaryStats(customerId);

            @SuppressWarnings("unchecked")
            Map<String, Object> summaryData = (Map<String, Object>) summary.get("summary");

            return ResponseEntity.ok(Map.of(
                    "totalSpent", summaryData.get("totalSpent"),
                    "totalPaid", summaryData.get("totalPaid"),
                    "outstandingBalance", summaryData.get("outstandingBalance")
            ));
        } catch (RuntimeException e) {
            log.error("Customer not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching spending for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch spending data"));
        }
    }
}