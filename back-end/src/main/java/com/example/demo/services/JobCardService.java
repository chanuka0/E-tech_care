//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final NotificationService notificationService;
//
//
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setDeviceType(updates.getDeviceType());
//        existing.setFault(updates.getFault()); // NEW
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        if (updates.getUsedItems() != null) {
//            existing.getUsedItems().clear();
//            for (UsedItem item : updates.getUsedItems()) {
//                existing.addUsedItem(item);
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        if (updates.getStatus() != null) {
//            existing.setStatus(updates.getStatus());
//            if (updates.getStatus() == JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber(),
//                        existing
//                );
//            }
//        }
//
//        return jobCardRepository.save(existing);
//    }
//
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId); // NEW
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = cancelledBy.equals("CUSTOMER") ? "Customer" : "Technician";
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
////    @Transactional
////    public JobCard createJobCard(JobCard jobCard) {
////        jobCard.setJobNumber(generateJobNumber());
////        jobCard.setStatus(JobStatus.PENDING);
////
////        // Set the bidirectional relationship for serials if they exist
////        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
////            for (JobCardSerial serial : jobCard.getSerials()) {
////                serial.setJobCard(jobCard);
////            }
////        }
////
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        notificationService.sendNotification(
////                NotificationType.PENDING_JOB,
////                "New job card created: " + saved.getJobNumber(),
////                saved
////        );
////
////        return saved;
////    }
////
////    @Transactional
////    public JobCard updateJobCard(Long id, JobCard updates) {
////        JobCard existing = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        existing.setCustomerName(updates.getCustomerName());
////        existing.setCustomerPhone(updates.getCustomerPhone());
////        existing.setDeviceType(updates.getDeviceType());
////        existing.setFaultDescription(updates.getFaultDescription());
////        existing.setNotes(updates.getNotes());
////        existing.setEstimatedCost(updates.getEstimatedCost());
////
////        // Update serials if provided
////        if (updates.getSerials() != null) {
////            // Clear existing serials
////            existing.getSerials().clear();
////
////            // Add new serials with proper relationship
////            for (JobCardSerial serial : updates.getSerials()) {
////                existing.addSerial(serial);
////            }
////        }
////
////        if (updates.getStatus() != null) {
////            existing.setStatus(updates.getStatus());
////            if (updates.getStatus() == JobStatus.COMPLETED) {
////                existing.setCompletedAt(LocalDateTime.now());
////                notificationService.sendNotification(
////                        NotificationType.JOB_COMPLETED,
////                        "Job completed: " + existing.getJobNumber(),
////                        existing
////                );
////            }
////        }
////
////        return jobCardRepository.save(existing);
////    }
//
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
////    @Transactional
////    public JobCard cancelJobCard(Long id, String cancelledBy, String reason, Double fee) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        jobCard.setStatus(JobStatus.CANCELLED);
////        jobCard.setCancelledBy(cancelledBy);
////        jobCard.setCancellationReason(reason);
////        jobCard.setCancellationFee(fee);
////
////        return jobCardRepository.save(jobCard);
////    }
//
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//}

package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.JobCardRepository;
import com.example.demo.repositories.FaultRepository;
import com.example.demo.repositories.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCardService {
    private final JobCardRepository jobCardRepository;
    private final FaultRepository faultRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final NotificationService notificationService;

    /**
     * Create a new job card with fault, serials, and used items
     */
    @Transactional
    public JobCard createJobCard(JobCard jobCard) {
        // Validate fault is provided
        if (jobCard.getFault() == null || jobCard.getFault().getId() == null) {
            throw new RuntimeException("Fault must be selected");
        }

        // Load fault from database to ensure it exists and is active
        Fault fault = faultRepository.findById(jobCard.getFault().getId())
                .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));

        if (!fault.getIsActive()) {
            throw new RuntimeException("Selected fault is inactive");
        }

        // Set fault reference
        jobCard.setFault(fault);
        jobCard.setJobNumber(generateJobNumber());
        jobCard.setStatus(JobStatus.PENDING);

        // Set bidirectional relationships for serials
        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
            for (JobCardSerial serial : jobCard.getSerials()) {
                serial.setJobCard(jobCard);
            }
        }

        // Set bidirectional relationships for used items and ensure prices are set
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem item : jobCard.getUsedItems()) {
                item.setJobCard(jobCard);

                // If unit price not provided, get from inventory
                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
                    item.setUnitPrice(invItem.getSellingPrice());
                }

                checkInventoryAndNotify(item.getInventoryItem());
            }
        }

        JobCard saved = jobCardRepository.save(jobCard);

        notificationService.sendNotification(
                NotificationType.PENDING_JOB,
                "New job card created: " + saved.getJobNumber() + " - Fault: " + fault.getFaultName(),
                saved
        );

        return saved;
    }

    /**
     * Update existing job card with fault, serials, used items, and status
     */
    @Transactional
    public JobCard updateJobCard(Long id, JobCard updates) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Update basic customer information
        existing.setCustomerName(updates.getCustomerName());
        existing.setCustomerPhone(updates.getCustomerPhone());
        existing.setCustomerEmail(updates.getCustomerEmail());
        existing.setDeviceType(updates.getDeviceType());
        existing.setBrandId(updates.getBrandId());
        existing.setModelId(updates.getModelId());

        // Update fault if provided
        if (updates.getFault() != null && updates.getFault().getId() != null) {
            Fault fault = faultRepository.findById(updates.getFault().getId())
                    .orElseThrow(() -> new RuntimeException("Fault not found"));

            if (!fault.getIsActive()) {
                throw new RuntimeException("Selected fault is inactive");
            }

            existing.setFault(fault);
        }

        existing.setFaultDescription(updates.getFaultDescription());
        existing.setNotes(updates.getNotes());
        existing.setEstimatedCost(updates.getEstimatedCost());
        existing.setAdvancePayment(updates.getAdvancePayment());

        // Update serials if provided
        if (updates.getSerials() != null) {
            existing.getSerials().clear();
            for (JobCardSerial serial : updates.getSerials()) {
                existing.addSerial(serial);
            }
        }

        // Update used items if provided
        if (updates.getUsedItems() != null) {
            existing.getUsedItems().clear();
            for (UsedItem item : updates.getUsedItems()) {
                // Ensure unit price is set from inventory if not provided
                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
                    item.setUnitPrice(invItem.getSellingPrice());
                }

                existing.addUsedItem(item);
                checkInventoryAndNotify(item.getInventoryItem());
            }
        }

        // Update status
        if (updates.getStatus() != null) {
            JobStatus oldStatus = existing.getStatus();
            existing.setStatus(updates.getStatus());

            // Handle completion
            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
                existing.setCompletedAt(LocalDateTime.now());
                notificationService.sendNotification(
                        NotificationType.JOB_COMPLETED,
                        "Job completed: " + existing.getJobNumber(),
                        existing
                );
            }
        }

        return jobCardRepository.save(existing);
    }

    /**
     * Cancel a job card with reason, fee, and who cancelled it
     */
    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
                                 String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Job card is already cancelled");
        }

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee);

        JobCard saved = jobCardRepository.save(jobCard);

        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
        notificationService.sendNotification(
                NotificationType.JOB_CANCELLED,
                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber(),
                saved
        );

        return saved;
    }

    /**
     * Add a serial to an existing job card
     */
    @Transactional
    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.addSerial(serial);
        return jobCardRepository.save(jobCard);
    }

    /**
     * Check inventory level and send notification if low stock
     */
    private void checkInventoryAndNotify(InventoryItem item) {
        if (item.getQuantity() <= item.getMinThreshold()) {
            notificationService.sendNotification(
                    NotificationType.LOW_STOCK,
                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
                    item
            );
        }
    }

    /**
     * Get all job cards (exclude deleted ones if needed)
     */
    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAll();
    }

    /**
     * Get job card by ID
     */
    public JobCard getJobCardById(Long id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
    }

    /**
     * Get job card by job number
     */
    public JobCard getJobCardByNumber(String jobNumber) {
        return jobCardRepository.findByJobNumber(jobNumber)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
    }

    /**
     * Get job cards filtered by status
     */
    public List<JobCard> getJobCardsByStatus(JobStatus status) {
        return jobCardRepository.findByStatus(status);
    }

    /**
     * Get pending job cards older than specified days (for alerts)
     */
    public List<JobCard> getPendingJobsOlderThanDays(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return jobCardRepository.findPendingJobsOlderThan(threshold);
    }

    /**
     * Search job cards by customer name, phone, or job number
     */
    public List<JobCard> searchJobCards(String searchTerm) {
        return jobCardRepository.searchJobCards(searchTerm);
    }

    /**
     * Get job cards created within a date range
     */
    public List<JobCard> getJobCardsByDateRange(LocalDateTime start, LocalDateTime end) {
        return jobCardRepository.findByCreatedAtBetween(start, end);
    }

    /**
     * Get job cards by customer phone
     */
    public List<JobCard> getJobCardsByCustomerPhone(String phone) {
        return jobCardRepository.findByCustomerPhone(phone);
    }

    /**
     * Get job cards by device type
     */
    public List<JobCard> getJobCardsByDeviceType(String deviceType) {
        return jobCardRepository.findByDeviceType(deviceType);
    }

    /**
     * Generate unique job number
     */
    private String generateJobNumber() {
        return "JOB-" + System.currentTimeMillis();
    }

    /**
     * Get count of job cards by status
     */
    public Long getJobCardCountByStatus(JobStatus status) {
        return jobCardRepository.countByStatus(status);
    }

    /**
     * Get count of job cards created in date range
     */
    public Long getJobCardCountByDateRange(LocalDateTime start, LocalDateTime end) {
        return jobCardRepository.countJobsByDateRange(start, end);
    }
}