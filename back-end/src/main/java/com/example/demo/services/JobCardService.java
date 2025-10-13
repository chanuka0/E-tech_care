package com.example.demo.services;


//import com.etechcare.entity.*;
//import com.etechcare.repository.*;
import com.example.demo.entity.JobCard;
import com.example.demo.entity.JobStatus;
import com.example.demo.entity.NotificationType;
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
        existing.setFaultDescription(updates.getFaultDescription());
        existing.setNotes(updates.getNotes());
        existing.setEstimatedCost(updates.getEstimatedCost());

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