package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "customer_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "total_jobs", nullable = false)
    private Integer totalJobs = 0;

    @Column(name = "completed_jobs", nullable = false)
    private Integer completedJobs = 0;

    @Column(name = "pending_jobs", nullable = false)
    private Integer pendingJobs = 0;

    @Column(name = "cancelled_jobs", nullable = false)
    private Integer cancelledJobs = 0;

    @Column(name = "total_spent", nullable = false)
    private Double totalSpent = 0.0;

    @Column(name = "total_paid", nullable = false)
    private Double totalPaid = 0.0;

    @Column(name = "outstanding_balance", nullable = false)
    private Double outstandingBalance = 0.0;

    @Column(name = "average_job_value")
    private Double averageJobValue = 0.0;

    @Column(name = "last_job_date")
    private LocalDateTime lastJobDate;

    @Column(name = "last_payment_date")
    private LocalDateTime lastPaymentDate;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    // Helper methods to update summary
    public void updateJobStats(Integer total, Integer completed, Integer pending, Integer cancelled) {
        this.totalJobs = total;
        this.completedJobs = completed;
        this.pendingJobs = pending;
        this.cancelledJobs = cancelled;
    }

    public void updateFinancialStats(Double totalSpent, Double totalPaid, Double outstanding) {
        this.totalSpent = totalSpent;
        this.totalPaid = totalPaid;
        this.outstandingBalance = outstanding;
        this.averageJobValue = totalJobs > 0 ? totalSpent / totalJobs : 0.0;
    }

    public void updateLastJobDate(LocalDateTime jobDate) {
        if (lastJobDate == null || jobDate.isAfter(lastJobDate)) {
            this.lastJobDate = jobDate;
        }
    }

    public void updateLastPaymentDate(LocalDateTime paymentDate) {
        if (lastPaymentDate == null || paymentDate.isAfter(lastPaymentDate)) {
            this.lastPaymentDate = paymentDate;
        }
    }
}