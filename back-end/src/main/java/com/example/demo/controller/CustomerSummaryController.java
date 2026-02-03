////
////package com.example.demo.controller;
////
////import com.example.demo.entity.Customer;
////import com.example.demo.entity.JobCard;
////import com.example.demo.entity.JobStatus;
////import com.example.demo.repositories.CustomerRepository;
////import com.example.demo.repositories.JobCardRepository;
////import lombok.RequiredArgsConstructor;
////import org.springframework.http.HttpStatus;
////import org.springframework.http.ResponseEntity;
////import org.springframework.security.access.prepost.PreAuthorize;
////import org.springframework.web.bind.annotation.*;
////
////import java.time.LocalDateTime;
////import java.util.HashMap;
////import java.util.List;
////import java.util.Map;
////import java.util.stream.Collectors;
////
////@RestController
////@RequiredArgsConstructor
////@CrossOrigin(origins = "*")
////public class CustomerSummaryController {  // ✅ REMOVED @RequestMapping
////
////    private final CustomerRepository customerRepository;
////    private final JobCardRepository jobCardRepository;
////
////    /**
////     * Main endpoint for customer summary
////     */
////    @GetMapping("/api/customer-summary/{customerId}")
////    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
////    public ResponseEntity<?> getCustomerSummary(@PathVariable Long customerId) {
////        return getCustomerSummaryData(customerId);
////    }
////
////    /**
////     * Alias endpoint for job card creation (frontend compatibility)
////     */
////    @GetMapping("/api/jobcards/customers/{customerId}/summary")
////    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
////    public ResponseEntity<?> getCustomerSummaryForJobCard(@PathVariable Long customerId) {
////        return getCustomerSummaryData(customerId);
////    }
////
////    /**
////     * Common method to get customer summary data
////     */
////    private ResponseEntity<?> getCustomerSummaryData(Long customerId) {
////        try {
////            Customer customer = customerRepository.findById(customerId)
////                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
////
////            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
////
////            Map<String, Object> summary = new HashMap<>();
////            summary.put("customerId", customer.getCustomerId());
////            summary.put("customerName", customer.getCustomerName());
////            summary.put("phoneNumber", customer.getPhoneNumber());
////            summary.put("email", customer.getEmail());
////            summary.put("address", customer.getAddress());
////            summary.put("totalServiceCount", customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0);
////            summary.put("creditBalance", customer.getCreditBalance() != null ? customer.getCreditBalance() : 0.0);
////            summary.put("totalJobCards", jobCards.size());
////
////            Map<String, Long> statusCounts = jobCards.stream()
////                    .collect(Collectors.groupingBy(
////                            jc -> jc.getStatus() != null ? jc.getStatus().toString() : "UNKNOWN",
////                            Collectors.counting()
////                    ));
////            summary.put("jobsByStatus", statusCounts);
////
////            Double totalServiceCost = jobCards.stream()
////                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
////                    .sum();
////            summary.put("totalServiceCost", totalServiceCost);
////
////            summary.put("lastVisit", customer.getLastVisit());
////            summary.put("createdAt", customer.getCreatedAt());
////            summary.put("isActive", customer.getIsActive() != null ? customer.getIsActive() : true);
////            summary.put("notes", customer.getNotes());
////
////            return ResponseEntity.ok(summary);
////
////        } catch (RuntimeException e) {
////            return ResponseEntity.status(HttpStatus.NOT_FOUND)
////                    .body(Map.of(
////                            "error", e.getMessage(),
////                            "timestamp", LocalDateTime.now(),
////                            "status", "NOT_FOUND"
////                    ));
////        } catch (Exception e) {
////            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
////                    .body(Map.of(
////                            "error", "Error retrieving customer summary: " + e.getMessage(),
////                            "timestamp", LocalDateTime.now(),
////                            "status", "ERROR"
////                    ));
////        }
////    }
////
////    @GetMapping("/api/customer-summary/{customerId}/job-count")
////    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
////    public ResponseEntity<?> getCustomerJobCount(@PathVariable Long customerId) {
////        try {
////            customerRepository.findById(customerId)
////                    .orElseThrow(() -> new RuntimeException("Customer not found"));
////
////            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
////
////            return ResponseEntity.ok(Map.of(
////                    "customerId", customerId,
////                    "totalJobCards", jobCards.size(),
////                    "timestamp", LocalDateTime.now()
////            ));
////        } catch (Exception e) {
////            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
////                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
////        }
////    }
////
////    @GetMapping("/api/customer-summary/{customerId}/jobs")
////    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
////    public ResponseEntity<?> getCustomerJobCards(
////            @PathVariable Long customerId,
////            @RequestParam(required = false) String status) {
////        try {
////            Customer customer = customerRepository.findById(customerId)
////                    .orElseThrow(() -> new RuntimeException("Customer not found"));
////
////            List<JobCard> jobCards;
////            if (status != null && !status.isEmpty()) {
////                try {
////                    JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
////                    jobCards = jobCardRepository.findByCustomerIdAndStatus(customerId, jobStatus);
////                } catch (IllegalArgumentException e) {
////                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
////                            .body(Map.of("error", "Invalid status", "timestamp", LocalDateTime.now()));
////                }
////            } else {
////                jobCards = jobCardRepository.findByCustomerId(customerId);
////            }
////
////            return ResponseEntity.ok(Map.of(
////                    "customerId", customerId,
////                    "customerName", customer.getCustomerName(),
////                    "jobCards", jobCards,
////                    "totalCount", jobCards.size(),
////                    "timestamp", LocalDateTime.now()
////            ));
////        } catch (Exception e) {
////            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
////                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
////        }
////    }
////
////    @GetMapping("/api/customer-summary/{customerId}/total-spending")
////    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
////    public ResponseEntity<?> getCustomerTotalSpending(@PathVariable Long customerId) {
////        try {
////            customerRepository.findById(customerId)
////                    .orElseThrow(() -> new RuntimeException("Customer not found"));
////
////            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
////
////            Double totalSpending = jobCards.stream()
////                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
////                    .sum();
////
////            return ResponseEntity.ok(Map.of(
////                    "customerId", customerId,
////                    "totalSpending", totalSpending,
////                    "jobCardCount", jobCards.size(),
////                    "averageSpending", jobCards.isEmpty() ? 0.0 : totalSpending / jobCards.size(),
////                    "timestamp", LocalDateTime.now()
////            ));
////        } catch (Exception e) {
////            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
////                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
////        }
////    }
////}
//
//package com.example.demo.controller;
//
//import com.example.demo.entity.Customer;
//import com.example.demo.entity.JobCard;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.entity.CustomerSummary;
//import com.example.demo.repositories.CustomerRepository;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.service.CustomerSummaryService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
//@RestController
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class CustomerSummaryController {
//
//    private final CustomerRepository customerRepository;
//    private final JobCardRepository jobCardRepository;
//    private final CustomerSummaryService customerSummaryService;
//
//    /**
//     * Main endpoint for customer summary (legacy support)
//     */
//    @GetMapping("/api/customer-summary/{customerId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerSummary(@PathVariable Long customerId) {
//        return getCustomerSummaryData(customerId);
//    }
//
//    /**
//     * Alias endpoint for job card creation (frontend compatibility)
//     */
//    @GetMapping("/api/jobcards/customers/{customerId}/summary")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerSummaryForJobCard(@PathVariable Long customerId) {
//        return getCustomerSummaryData(customerId);
//    }
//
//    /**
//     * NEW: Get detailed customer summary with full history
//     */
//    @GetMapping("/api/customers/{customerId}/summary/detailed")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getDetailedCustomerSummary(@PathVariable Long customerId) {
//        try {
//            Map<String, Object> detailedSummary = customerSummaryService.getDetailedSummary(customerId);
//            return ResponseEntity.ok(detailedSummary);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(Map.of(
//                            "error", e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "NOT_FOUND"
//                    ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "error", "Error retrieving detailed summary: " + e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "ERROR"
//                    ));
//        }
//    }
//
//    /**
//     * NEW: Update customer summary (manually trigger update)
//     */
//    @PostMapping("/api/customers/{customerId}/summary/update")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> updateCustomerSummary(@PathVariable Long customerId) {
//        try {
//            CustomerSummary summary = customerSummaryService.updateSummary(customerId);
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "Customer summary updated successfully");
//            response.put("customerId", customerId);
//            response.put("lastUpdated", summary.getLastUpdated());
//            response.put("summary", buildSummaryResponse(summary));
//
//            return ResponseEntity.ok(response);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(Map.of(
//                            "error", e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "NOT_FOUND"
//                    ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "error", "Error updating summary: " + e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "ERROR"
//                    ));
//        }
//    }
//
//    /**
//     * NEW: Get customer summary stats only (quick overview)
//     */
//    @GetMapping("/api/customers/{customerId}/summary/stats")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerSummaryStats(@PathVariable Long customerId) {
//        try {
//            Map<String, Object> stats = customerSummaryService.getSummaryStats(customerId);
//            return ResponseEntity.ok(stats);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(Map.of(
//                            "error", e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "NOT_FOUND"
//                    ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "error", "Error retrieving summary stats: " + e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "ERROR"
//                    ));
//        }
//    }
//
//    /**
//     * NEW: Refresh all customer summaries (Admin only)
//     */
//    @PostMapping("/api/customers/summary/refresh-all")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> refreshAllCustomerSummaries() {
//        try {
//            customerSummaryService.refreshAllSummaries();
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "All customer summaries refreshed successfully");
//            response.put("timestamp", LocalDateTime.now());
//
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "error", "Error refreshing summaries: " + e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "ERROR"
//                    ));
//        }
//    }
//
//    /**
//     * Common method to get customer summary data (legacy format)
//     */
//    private ResponseEntity<?> getCustomerSummaryData(Long customerId) {
//        try {
//            Customer customer = customerRepository.findById(customerId)
//                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//            Map<String, Object> summary = new HashMap<>();
//            summary.put("customerId", customer.getCustomerId());
//            summary.put("customerName", customer.getCustomerName());
//            summary.put("phoneNumber", customer.getPhoneNumber());
//            summary.put("email", customer.getEmail());
//            summary.put("address", customer.getAddress());
//            summary.put("totalServiceCount", customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0);
//            summary.put("creditBalance", customer.getCreditBalance() != null ? customer.getCreditBalance() : 0.0);
//            summary.put("totalJobCards", jobCards.size());
//
//            Map<String, Long> statusCounts = jobCards.stream()
//                    .collect(Collectors.groupingBy(
//                            jc -> jc.getStatus() != null ? jc.getStatus().toString() : "UNKNOWN",
//                            Collectors.counting()
//                    ));
//            summary.put("jobsByStatus", statusCounts);
//
//            Double totalServiceCost = jobCards.stream()
//                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
//                    .sum();
//            summary.put("totalServiceCost", totalServiceCost);
//
//            summary.put("lastVisit", customer.getLastVisit());
//            summary.put("createdAt", customer.getCreatedAt());
//            summary.put("isActive", customer.getIsActive() != null ? customer.getIsActive() : true);
//            summary.put("notes", customer.getNotes());
//
//            return ResponseEntity.ok(summary);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(Map.of(
//                            "error", e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "NOT_FOUND"
//                    ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "error", "Error retrieving customer summary: " + e.getMessage(),
//                            "timestamp", LocalDateTime.now(),
//                            "status", "ERROR"
//                    ));
//        }
//    }
//
//    @GetMapping("/api/customer-summary/{customerId}/job-count")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerJobCount(@PathVariable Long customerId) {
//        try {
//            customerRepository.findById(customerId)
//                    .orElseThrow(() -> new RuntimeException("Customer not found"));
//
//            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//            return ResponseEntity.ok(Map.of(
//                    "customerId", customerId,
//                    "totalJobCards", jobCards.size(),
//                    "timestamp", LocalDateTime.now()
//            ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
//        }
//    }
//
//    @GetMapping("/api/customer-summary/{customerId}/jobs")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerJobCards(
//            @PathVariable Long customerId,
//            @RequestParam(required = false) String status) {
//        try {
//            Customer customer = customerRepository.findById(customerId)
//                    .orElseThrow(() -> new RuntimeException("Customer not found"));
//
//            List<JobCard> jobCards;
//            if (status != null && !status.isEmpty()) {
//                try {
//                    JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
//                    jobCards = jobCardRepository.findByCustomerIdAndStatus(customerId, jobStatus);
//                } catch (IllegalArgumentException e) {
//                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                            .body(Map.of("error", "Invalid status", "timestamp", LocalDateTime.now()));
//                }
//            } else {
//                jobCards = jobCardRepository.findByCustomerId(customerId);
//            }
//
//            return ResponseEntity.ok(Map.of(
//                    "customerId", customerId,
//                    "customerName", customer.getCustomerName(),
//                    "jobCards", jobCards,
//                    "totalCount", jobCards.size(),
//                    "timestamp", LocalDateTime.now()
//            ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
//        }
//    }
//
//    @GetMapping("/api/customer-summary/{customerId}/total-spending")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getCustomerTotalSpending(@PathVariable Long customerId) {
//        try {
//            customerRepository.findById(customerId)
//                    .orElseThrow(() -> new RuntimeException("Customer not found"));
//
//            List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//            Double totalSpending = jobCards.stream()
//                    .mapToDouble(jc -> jc.getTotalServicePrice() != null ? jc.getTotalServicePrice() : 0.0)
//                    .sum();
//
//            return ResponseEntity.ok(Map.of(
//                    "customerId", customerId,
//                    "totalSpending", totalSpending,
//                    "jobCardCount", jobCards.size(),
//                    "averageSpending", jobCards.isEmpty() ? 0.0 : totalSpending / jobCards.size(),
//                    "timestamp", LocalDateTime.now()
//            ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now()));
//        }
//    }
//
//    // Helper method to build summary response
//    private Map<String, Object> buildSummaryResponse(CustomerSummary summary) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("totalJobs", summary.getTotalJobs());
//        response.put("completedJobs", summary.getCompletedJobs());
//        response.put("pendingJobs", summary.getPendingJobs());
//        response.put("cancelledJobs", summary.getCancelledJobs());
//        response.put("totalSpent", summary.getTotalSpent());
//        response.put("totalPaid", summary.getTotalPaid());
//        response.put("outstandingBalance", summary.getOutstandingBalance());
//        response.put("averageJobValue", summary.getAverageJobValue());
//        response.put("lastJobDate", summary.getLastJobDate());
//        response.put("lastPaymentDate", summary.getLastPaymentDate());
//        return response;
//    }
//}


package com.example.demo.controller;

import com.example.demo.entity.CustomerSummary;
import com.example.demo.service.CustomerSummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerSummaryController {

    private final CustomerSummaryService customerSummaryService;

    // ✅ Legacy endpoint - Quick overview for job card creation
    @GetMapping("/customer-summary/{customerId}")
    public ResponseEntity<?> getCustomerSummaryQuick(@PathVariable Long customerId) {
        try {
            log.info("Fetching quick summary for customer ID: {}", customerId);
            Map<String, Object> summary = customerSummaryService.getSummaryStats(customerId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching quick summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Alias for job card creation - same as legacy endpoint
    @GetMapping("/jobcards/customers/{customerId}/summary")
    public ResponseEntity<?> getCustomerSummaryForJobCard(@PathVariable Long customerId) {
        return getCustomerSummaryQuick(customerId);
    }

    // ✅ NEW: Detailed summary with full history - For CustomerManagement View
    @GetMapping("/customers/{customerId}/summary/detailed")
    public ResponseEntity<?> getDetailedCustomerSummary(@PathVariable Long customerId) {
        try {
            log.info("Fetching detailed summary for customer ID: {}", customerId);
            Map<String, Object> detailedSummary = customerSummaryService.getDetailedSummary(customerId);
            return ResponseEntity.ok(detailedSummary);
        } catch (Exception e) {
            log.error("Error fetching detailed summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ NEW: Quick stats only
    @GetMapping("/customers/{customerId}/summary/stats")
    public ResponseEntity<?> getCustomerStats(@PathVariable Long customerId) {
        try {
            log.info("Fetching stats for customer ID: {}", customerId);
            Map<String, Object> stats = customerSummaryService.getSummaryStats(customerId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching stats for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ NEW: Manual trigger to update/refresh summary
    @PostMapping("/customers/{customerId}/summary/update")
    public ResponseEntity<?> updateCustomerSummary(@PathVariable Long customerId) {
        try {
            log.info("Manually updating summary for customer ID: {}", customerId);
            CustomerSummary updated = customerSummaryService.updateSummary(customerId);
            return ResponseEntity.ok(Map.of(
                    "message", "Customer summary updated successfully",
                    "summary", updated
            ));
        } catch (Exception e) {
            log.error("Error updating summary for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ NEW: Admin endpoint to refresh all customer summaries
    @PostMapping("/customers/summary/refresh-all")
    public ResponseEntity<?> refreshAllCustomerSummaries() {
        try {
            log.info("Refreshing all customer summaries");
            customerSummaryService.refreshAllSummaries();
            return ResponseEntity.ok(Map.of("message", "All customer summaries refreshed successfully"));
        } catch (Exception e) {
            log.error("Error refreshing all summaries: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Filter jobs by status (existing functionality)
    @GetMapping("/customer-summary/{customerId}/jobs")
    public ResponseEntity<?> getCustomerJobsByStatus(
            @PathVariable Long customerId,
            @RequestParam(required = false) String status) {
        try {
            Map<String, Object> detailedSummary = customerSummaryService.getDetailedSummary(customerId);

            if (status != null && !status.isEmpty()) {
                Map<String, Object> jobHistory = (Map<String, Object>) detailedSummary.get("jobHistory");
                return ResponseEntity.ok(Map.of(
                        "status", status,
                        "jobs", jobHistory.get("jobs")
                ));
            }

            return ResponseEntity.ok(detailedSummary.get("jobHistory"));
        } catch (Exception e) {
            log.error("Error fetching jobs for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get total spending analytics
    @GetMapping("/customer-summary/{customerId}/total-spending")
    public ResponseEntity<?> getCustomerTotalSpending(@PathVariable Long customerId) {
        try {
            Map<String, Object> summary = customerSummaryService.getSummaryStats(customerId);
            Map<String, Object> summaryData = (Map<String, Object>) summary.get("summary");

            return ResponseEntity.ok(Map.of(
                    "totalSpent", summaryData.get("totalSpent"),
                    "totalPaid", summaryData.get("totalPaid"),
                    "outstandingBalance", summaryData.get("outstandingBalance")
            ));
        } catch (Exception e) {
            log.error("Error fetching spending for customer {}: {}", customerId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}