//package com.example.demo.services;
//
//
////import com.etechcare.entity.*;
////import com.etechcare.repository.*;
//import com.example.demo.entity.JobCard;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.entity.NotificationType;
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
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
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
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
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
//    public JobCard cancelJobCard(Long id, String cancelledBy, String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        return jobCardRepository.save(jobCard);
//    }
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
//}

package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCardService {
    private final JobCardRepository jobCardRepository;
    private final NotificationService notificationService;


    @Transactional
    public JobCard createJobCard(JobCard jobCard) {
        jobCard.setJobNumber(generateJobNumber());
        jobCard.setStatus(JobStatus.PENDING);

        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
            for (JobCardSerial serial : jobCard.getSerials()) {
                serial.setJobCard(jobCard);
            }
        }

        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem item : jobCard.getUsedItems()) {
                item.setJobCard(jobCard);
                checkInventoryAndNotify(item.getInventoryItem());
            }
        }

        JobCard saved = jobCardRepository.save(jobCard);

        notificationService.sendNotification(
                NotificationType.PENDING_JOB,
                "New job card created: " + saved.getJobNumber(),
                saved
        );

        return saved;
    }

    @Transactional
    public JobCard updateJobCard(Long id, JobCard updates) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        existing.setCustomerName(updates.getCustomerName());
        existing.setCustomerPhone(updates.getCustomerPhone());
        existing.setDeviceType(updates.getDeviceType());
        existing.setFault(updates.getFault()); // NEW
        existing.setFaultDescription(updates.getFaultDescription());
        existing.setNotes(updates.getNotes());
        existing.setEstimatedCost(updates.getEstimatedCost());

        if (updates.getSerials() != null) {
            existing.getSerials().clear();
            for (JobCardSerial serial : updates.getSerials()) {
                existing.addSerial(serial);
            }
        }

        if (updates.getUsedItems() != null) {
            existing.getUsedItems().clear();
            for (UsedItem item : updates.getUsedItems()) {
                existing.addUsedItem(item);
                checkInventoryAndNotify(item.getInventoryItem());
            }
        }

        if (updates.getStatus() != null) {
            existing.setStatus(updates.getStatus());
            if (updates.getStatus() == JobStatus.COMPLETED) {
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

    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
                                 String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId); // NEW
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee);

        JobCard saved = jobCardRepository.save(jobCard);

        String cancellerInfo = cancelledBy.equals("CUSTOMER") ? "Customer" : "Technician";
        notificationService.sendNotification(
                NotificationType.JOB_CANCELLED,
                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber(),
                saved
        );

        return saved;
    }

    private void checkInventoryAndNotify(InventoryItem item) {
        if (item.getQuantity() <= item.getMinThreshold()) {
            notificationService.sendNotification(
                    NotificationType.LOW_STOCK,
                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
                    item
            );
        }
    }

//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Set the bidirectional relationship for serials if they exist
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
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
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            // Clear existing serials
//            existing.getSerials().clear();
//
//            // Add new serials with proper relationship
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
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

    @Transactional
    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.addSerial(serial);
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee);

        return jobCardRepository.save(jobCard);
    }

    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAll();
    }

    public JobCard getJobCardById(Long id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
    }

    public List<JobCard> getJobCardsByStatus(JobStatus status) {
        return jobCardRepository.findByStatus(status);
    }

    public List<JobCard> getPendingJobsOlderThanDays(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return jobCardRepository.findPendingJobsOlderThan(threshold);
    }

    private String generateJobNumber() {
        return "JOB-" + System.currentTimeMillis();
    }
}