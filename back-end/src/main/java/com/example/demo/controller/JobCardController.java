//package com.example.demo.controller;
//
//import com.example.demo.dto.JobCardUpdateRequest;
//import com.example.demo.entity.JobCard;
//import com.example.demo.entity.JobCardSerial;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.services.JobCardService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/jobcards")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class JobCardController {
//    private final JobCardService jobCardService;
//
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> createJobCard(@RequestBody JobCard jobCard) {
//        try {
//            return ResponseEntity.status(HttpStatus.CREATED).body(jobCardService.createJobCard(jobCard));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<JobCard>> getAllJobCards() {
//        return ResponseEntity.ok(jobCardService.getAllJobCards());
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<JobCard> getJobCardById(@PathVariable Long id) {
//        return ResponseEntity.ok(jobCardService.getJobCardById(id));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> updateJobCard(@PathVariable Long id, @RequestBody JobCardUpdateRequest updateRequest) {
//        try {
//            return ResponseEntity.ok(jobCardService.updateJobCard(id, updateRequest));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/cancel")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> cancelJobCard(
//            @PathVariable Long id,
//            @RequestBody Map<String, Object> cancelData) {
//        try {
//            String cancelledBy = (String) cancelData.get("cancelledBy");
//            Long cancelledByUserId = ((Number) cancelData.get("cancelledByUserId")).longValue();
//            String reason = (String) cancelData.get("reason");
//            Double fee = cancelData.get("fee") != null ?
//                    Double.valueOf(cancelData.get("fee").toString()) : 0.0;
//
//            return ResponseEntity.ok(jobCardService.cancelJobCard(id, cancelledBy,
//                    cancelledByUserId, reason, fee));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @GetMapping("/status/{status}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<JobCard>> getJobCardsByStatus(@PathVariable JobStatus status) {
//        return ResponseEntity.ok(jobCardService.getJobCardsByStatus(status));
//    }
//
//    @GetMapping("/service-category/{serviceCategoryId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<JobCard>> getJobCardsByServiceCategory(@PathVariable Long serviceCategoryId) {
//        return ResponseEntity.ok(jobCardService.getJobCardsByServiceCategory(serviceCategoryId));
//    }
//
//    @GetMapping("/pending-alerts")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<JobCard>> getPendingAlerts() {
//        return ResponseEntity.ok(jobCardService.getPendingJobsOlderThanDays(2));
//    }
//
//    @PostMapping("/{id}/serials")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> addSerial(
//            @PathVariable Long id,
//            @RequestBody JobCardSerial serial) {
//        try {
//            return ResponseEntity.ok(jobCardService.addSerialToJobCard(id, serial));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/faults/{faultId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> addFault(
//            @PathVariable Long id,
//            @PathVariable Long faultId) {
//        try {
//            return ResponseEntity.ok(jobCardService.addFaultToJobCard(id, faultId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @DeleteMapping("/{id}/faults/{faultId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> removeFault(
//            @PathVariable Long id,
//            @PathVariable Long faultId) {
//        try {
//            return ResponseEntity.ok(jobCardService.removeFaultFromJobCard(id, faultId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/service-categories/{serviceCategoryId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> addServiceCategory(
//            @PathVariable Long id,
//            @PathVariable Long serviceCategoryId) {
//        try {
//            return ResponseEntity.ok(jobCardService.addServiceCategoryToJobCard(id, serviceCategoryId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @DeleteMapping("/{id}/service-categories/{serviceCategoryId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> removeServiceCategory(
//            @PathVariable Long id,
//            @PathVariable Long serviceCategoryId) {
//        try {
//            return ResponseEntity.ok(jobCardService.removeServiceCategoryFromJobCard(id, serviceCategoryId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')") // ✅ ONLY ADMINS CAN DELETE
//    public ResponseEntity<?> deleteJobCard(
//            @PathVariable Long id,
//            @RequestBody Map<String, String> requestBody) {
//        try {
//            String reason = requestBody.get("reason");
//            if (reason == null || reason.trim().isEmpty()) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                        .body(new ErrorResponse("Deletion reason is required"));
//            }
//
//            jobCardService.deleteJobCard(id, reason);
//            return ResponseEntity.ok(new SuccessResponse("Job card deleted successfully"));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    // Add this helper class if it doesn't exist
//    static class SuccessResponse {
//        public String message;
//
//        public SuccessResponse(String message) {
//            this.message = message;
//        }
//    }
//
//    // CHANGED: Device Condition Endpoints - now support multiple
//    @PostMapping("/{id}/device-conditions/{deviceConditionId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> addDeviceCondition(
//            @PathVariable Long id,
//            @PathVariable Long deviceConditionId) {
//        try {
//            return ResponseEntity.ok(jobCardService.addDeviceConditionToJobCard(id, deviceConditionId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @DeleteMapping("/{id}/device-conditions/{deviceConditionId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> removeDeviceCondition(
//            @PathVariable Long id,
//            @PathVariable Long deviceConditionId) {
//        try {
//            return ResponseEntity.ok(jobCardService.removeDeviceConditionFromJobCard(id, deviceConditionId));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/waiting-for-parts")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> markWaitingForParts(@PathVariable Long id) {
//        try {
//            return ResponseEntity.ok(jobCardService.markWaitingForParts(id));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/waiting-for-approval")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> markWaitingForApproval(@PathVariable Long id) {
//        try {
//            return ResponseEntity.ok(jobCardService.markWaitingForApproval(id));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @PostMapping("/{id}/in-progress")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> markInProgress(@PathVariable Long id) {
//        try {
//            return ResponseEntity.ok(jobCardService.markInProgress(id));
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @GetMapping("/by-number/{jobNumber}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<JobCard> getJobCardByNumber(@PathVariable String jobNumber) {
//        return ResponseEntity.ok(jobCardService.getJobCardByNumber(jobNumber));
//    }
//
//    // Helper class for error responses
//    static class ErrorResponse {
//        public String message;
//
//        public ErrorResponse(String message) {
//            this.message = message;
//        }
//    }
//}


package com.example.demo.controller;

import com.example.demo.dto.JobCardUpdateRequest;
import com.example.demo.entity.JobCard;
import com.example.demo.entity.JobCardSerial;
import com.example.demo.entity.JobStatus;
import com.example.demo.service.JobCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobcards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobCardController {
    private final JobCardService jobCardService;

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
            jobCard.setDeviceBarcode(deviceBarcode); // NEW: Store barcode directly

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
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (RuntimeException e) {
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