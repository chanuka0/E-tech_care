package com.example.demo.controller;

import com.example.demo.dto.JobCardUpdateRequest;
import com.example.demo.entity.Customer;
import com.example.demo.entity.JobCard;
import com.example.demo.entity.JobCardSerial;
import com.example.demo.entity.JobStatus;
import com.example.demo.repositories.CustomerRepository;
import com.example.demo.repositories.JobCardRepository;
import com.example.demo.service.JobCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobcards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobCardController {
    private final JobCardService jobCardService;
    private final CustomerRepository customerRepository;
    private final JobCardRepository jobCardRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> createJobCard(@RequestBody JobCard jobCard) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(jobCardService.createJobCard(jobCard));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // NEW: Quick create from barcode (without auto-submit)
    @PostMapping("/quick-create")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> quickCreateFromBarcode(@RequestBody Map<String, String> request) {
        try {
            String deviceBarcode = request.get("deviceBarcode");
            String customerName = request.get("customerName");
            String customerPhone = request.get("customerPhone");

            if (deviceBarcode == null || deviceBarcode.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Device barcode is required"));
            }

            // Create a minimal job card
            JobCard jobCard = new JobCard();
            jobCard.setCustomerName(customerName != null ? customerName : "Walk-in Customer");
            jobCard.setCustomerPhone(customerPhone != null ? customerPhone : "0000000000");
            jobCard.setDeviceType("LAPTOP");
            jobCard.setDeviceBarcode(deviceBarcode);

            return ResponseEntity.status(HttpStatus.CREATED).body(jobCardService.createJobCard(jobCard));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<JobCard>> getAllJobCards() {
        return ResponseEntity.ok(jobCardService.getAllJobCards());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<JobCard> getJobCardById(@PathVariable Long id) {
        return ResponseEntity.ok(jobCardService.getJobCardById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> updateJobCard(@PathVariable Long id, @RequestBody JobCardUpdateRequest updateRequest) {
        try {
            return ResponseEntity.ok(jobCardService.updateJobCard(id, updateRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> cancelJobCard(
            @PathVariable Long id,
            @RequestBody Map<String, Object> cancelData) {
        try {
            String cancelledBy = (String) cancelData.get("cancelledBy");
            Long cancelledByUserId = ((Number) cancelData.get("cancelledByUserId")).longValue();
            String reason = (String) cancelData.get("reason");
            Double fee = cancelData.get("fee") != null ?
                    Double.valueOf(cancelData.get("fee").toString()) : 0.0;

            return ResponseEntity.ok(jobCardService.cancelJobCard(id, cancelledBy,
                    cancelledByUserId, reason, fee));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<JobCard>> getJobCardsByStatus(@PathVariable JobStatus status) {
        return ResponseEntity.ok(jobCardService.getJobCardsByStatus(status));
    }

    @GetMapping("/service-category/{serviceCategoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<JobCard>> getJobCardsByServiceCategory(@PathVariable Long serviceCategoryId) {
        return ResponseEntity.ok(jobCardService.getJobCardsByServiceCategory(serviceCategoryId));
    }

    @GetMapping("/pending-alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<JobCard>> getPendingAlerts() {
        return ResponseEntity.ok(jobCardService.getPendingJobsOlderThanDays(2));
    }

    @PostMapping("/{id}/serials")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addSerial(
            @PathVariable Long id,
            @RequestBody JobCardSerial serial) {
        try {
            return ResponseEntity.ok(jobCardService.addSerialToJobCard(id, serial));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/faults/{faultId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addFault(
            @PathVariable Long id,
            @PathVariable Long faultId) {
        try {
            return ResponseEntity.ok(jobCardService.addFaultToJobCard(id, faultId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/faults/{faultId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeFault(
            @PathVariable Long id,
            @PathVariable Long faultId) {
        try {
            return ResponseEntity.ok(jobCardService.removeFaultFromJobCard(id, faultId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/service-categories/{serviceCategoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addServiceCategory(
            @PathVariable Long id,
            @PathVariable Long serviceCategoryId) {
        try {
            return ResponseEntity.ok(jobCardService.addServiceCategoryToJobCard(id, serviceCategoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/service-categories/{serviceCategoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeServiceCategory(
            @PathVariable Long id,
            @PathVariable Long serviceCategoryId) {
        try {
            return ResponseEntity.ok(jobCardService.removeServiceCategoryFromJobCard(id, serviceCategoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/device-conditions/{deviceConditionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addDeviceCondition(
            @PathVariable Long id,
            @PathVariable Long deviceConditionId) {
        try {
            return ResponseEntity.ok(jobCardService.addDeviceConditionToJobCard(id, deviceConditionId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/device-conditions/{deviceConditionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeDeviceCondition(
            @PathVariable Long id,
            @PathVariable Long deviceConditionId) {
        try {
            return ResponseEntity.ok(jobCardService.removeDeviceConditionFromJobCard(id, deviceConditionId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/waiting-for-parts")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> markWaitingForParts(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobCardService.markWaitingForParts(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/waiting-for-approval")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> markWaitingForApproval(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobCardService.markWaitingForApproval(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> markInProgress(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobCardService.markInProgress(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete job card (Admin only) - Only for PENDING or CANCELLED status
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteJobCard(
            @PathVariable Long id,
            @RequestBody Map<String, String> deleteData) {
        try {
            String reason = deleteData.get("reason");
            jobCardService.deleteJobCard(id, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Job card deleted successfully");
            response.put("jobCardId", id.toString());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/by-number/{jobNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<JobCard> getJobCardByNumber(@PathVariable String jobNumber) {
        return ResponseEntity.ok(jobCardService.getJobCardByNumber(jobNumber));
    }

    // NEW: Check if barcode exists
    @GetMapping("/check-barcode/{barcode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> checkBarcodeExists(@PathVariable String barcode) {
        try {
            boolean exists = jobCardService.checkBarcodeExists(barcode);
            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== SEARCH ENDPOINTS ==========

    /**
     * Search job cards by device serial number (exact match from JobCardSerial)
     */
    @GetMapping("/by-serial/{serialNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getJobCardBySerialNumber(@PathVariable String serialNumber) {
        try {
            List<JobCard> jobCards = jobCardService.getJobCardByDeviceSerialNumber(serialNumber);
            if (jobCards.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("No job card found with serial number: " + serialNumber));
            }
            return ResponseEntity.ok(jobCards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * General search across all fields (including serials, barcode, faults, etc.)
     */
    @GetMapping("/search/{query}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> searchJobCards(@PathVariable String query) {
        try {
            List<JobCard> jobCards = jobCardService.searchJobCards(query);
            return ResponseEntity.ok(jobCards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get job cards by device barcode (exact match)
     */
    @GetMapping("/by-barcode/{barcode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getJobCardByBarcode(@PathVariable String barcode) {
        try {
            List<JobCard> jobCards = jobCardService.getJobCardByBarcode(barcode);
            if (jobCards.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("No job card found with barcode: " + barcode));
            }
            return ResponseEntity.ok(jobCards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Search job cards by barcode (partial match for search functionality)
     */
    @GetMapping("/search/barcode/{barcode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> searchJobCardsByBarcode(@PathVariable String barcode) {
        try {
            List<JobCard> jobCards = jobCardService.searchJobCardsByBarcode(barcode);
            if (jobCards.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("No job cards found with barcode: " + barcode));
            }
            return ResponseEntity.ok(jobCards);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== NEW ENDPOINTS FOR JOB NUMBER SEQUENCE ==========

    /**
     * Get next job number preview
     */
    @GetMapping("/next-number")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getNextJobNumber() {
        try {
            String nextNumber = jobCardService.getNextJobNumberPreview();
            Map<String, Object> response = new HashMap<>();
            response.put("nextJobNumber", nextNumber);
            response.put("date", LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get job card statistics including sequence info
     */
    @GetMapping("/statistics/sequence")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getJobCardSequenceStatistics() {
        try {
            JobCardService.JobCardStatistics stats = jobCardService.getJobCardStatistics();

            Map<String, Object> statusBreakdown = new HashMap<>();
            statusBreakdown.put("pending", stats.pending);
            statusBreakdown.put("inProgress", stats.inProgress);
            statusBreakdown.put("waitingForParts", stats.waitingForParts);
            statusBreakdown.put("waitingForApproval", stats.waitingForApproval);
            statusBreakdown.put("completed", stats.completed);
            statusBreakdown.put("delivered", stats.delivered);
            statusBreakdown.put("cancelled", stats.cancelled);

            Map<String, Object> response = new HashMap<>();
            response.put("totalJobs", stats.total);
            response.put("lastJobNumber", stats.lastJobNumber);
            response.put("nextJobNumber", stats.nextJobNumber);
            response.put("date", LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            response.put("statusBreakdown", statusBreakdown);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get job numbers for today
     */
    @GetMapping("/today-numbers")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getTodayJobNumbers() {
        try {
            List<String> todayNumbers = jobCardService.getTodayJobNumbers();

            Map<String, Object> response = new HashMap<>();
            response.put("date", LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            response.put("count", todayNumbers.size());
            response.put("jobNumbers", todayNumbers);
            response.put("nextNumber", jobCardService.getNextJobNumberPreview());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * ✅ FIXED: Get active regular customers for dropdown in job card creation
     * Uses CustomerRepository to fetch active customers
     */
    @GetMapping("/customers/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getActiveCustomers() {
        try {
            List<Customer> activeCustomers = customerRepository.findByIsActiveTrueOrderByCustomerNameAsc();

            // Convert to response format with essential info
            List<Map<String, Object>> response = activeCustomers.stream()
                    .map(customer -> {
                        Map<String, Object> customerMap = new HashMap<>();
                        customerMap.put("customerId", customer.getId());
                        customerMap.put("customerName", customer.getCustomerName());
                        customerMap.put("phoneNumber", customer.getPhoneNumber());
                        customerMap.put("email", customer.getEmail());
                        customerMap.put("creditBalance", customer.getCreditBalance() != null ? customer.getCreditBalance() : 0.0);
                        customerMap.put("totalServiceCount", customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0);
                        return customerMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("totalCount", response.size());
            responseBody.put("customers", response);
            responseBody.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch active customers: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Test job number generation with custom sequence
     */
    @GetMapping("/test-number/{sequence}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> testJobNumberGeneration(@PathVariable Integer sequence) {
        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String testNumber = String.format("JOB-%s-%06d", today, sequence);

            // Check if this number already exists
            boolean exists = jobCardService.getJobCardByNumber(testNumber) != null;

            Map<String, Object> response = new HashMap<>();
            response.put("testJobNumber", testNumber);
            response.put("exists", exists);
            response.put("date", today);
            response.put("sequence", String.format("%06d", sequence));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // If job card not found, it means the number is available
            if (e.getMessage().contains("not found")) {
                String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String testNumber = String.format("JOB-%s-%06d", today, sequence);

                Map<String, Object> response = new HashMap<>();
                response.put("testJobNumber", testNumber);
                response.put("exists", false);
                response.put("date", today);
                response.put("sequence", String.format("%06d", sequence));

                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper class for error responses
    static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}