package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String jobNumber;

    @NotBlank(message = "Customer name cannot be blank")
    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(length = 100)
    private String customerEmail;

    @Column(nullable = false, length = 50)
    private String deviceType;

    @Column(length = 50)
    private String brandId;

    @Column(length = 50)
    private String modelId;

    // NEW: Fault reference
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fault_id")
    private Fault fault;

    @NotBlank(message = "Fault description cannot be blank")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String faultDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private JobStatus status;

    @Column(name = "advance_payment")
    private Double advancePayment;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    // Serials
    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<JobCardSerial> serials = new ArrayList<>();

    // NEW: Used items
    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UsedItem> usedItems = new ArrayList<>();

    // Cancellation fields
    @Column(length = 50)
    private String cancelledBy;

    @Column(name = "cancelled_by_user_id")
    private Long cancelledByUserId; // NEW: Who cancelled (user ID)

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancellation_fee")
    private Double cancellationFee;

    @Column(nullable = false, name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addSerial(JobCardSerial serial) {
        if (serials == null) {
            serials = new ArrayList<>();
        }
        serials.add(serial);
        serial.setJobCard(this);
    }

    public void removeSerial(JobCardSerial serial) {
        serials.remove(serial);
        serial.setJobCard(null);
    }

    public void addUsedItem(UsedItem item) {
        if (usedItems == null) {
            usedItems = new ArrayList<>();
        }
        usedItems.add(item);
        item.setJobCard(this);
    }

    public void removeUsedItem(UsedItem item) {
        usedItems.remove(item);
        item.setJobCard(null);
    }
}