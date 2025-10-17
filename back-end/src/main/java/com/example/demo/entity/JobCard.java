//package com.example.demo.entity;
//
////package com.etechcare.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "job_cards")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class JobCard {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, nullable = false)
//    private String jobNumber;
//
//    private String customerName;
//    private String customerPhone;
//    private String customerEmail;
//    private String deviceType; // LAPTOP, DESKTOP, PRINTER, PROJECTOR
//    private String brandId;
//    private String modelId;
//    private String faultDescription;
//
//    @Column(columnDefinition = "TEXT")
//    private String notes;
//
//    @Enumerated(EnumType.STRING)
//    private JobStatus status; // PENDING, IN_PROGRESS, COMPLETED, DELIVERED, CANCELLED
//
//    private Double advancePayment;
//    private Double estimatedCost;
//
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL)
//    private List<JobCardSerial> serials;
//
//    private String cancelledBy; // CUSTOMER or TECHNICIAN
//    private String cancellationReason;
//    private Double cancellationFee;
//
//    @Column(nullable = false)
//    private Long createdBy;
//
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//    private LocalDateTime completedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//}

package com.example.demo.entity;

import jakarta.persistence.*;
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

    @Column(unique = true, nullable = false)
    private String jobNumber;

    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String deviceType;
    private String brandId;
    private String modelId;
    private String faultDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private Double advancePayment;
    private Double estimatedCost;

    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobCardSerial> serials = new ArrayList<>();

    private String cancelledBy;
    private String cancellationReason;
    private Double cancellationFee;

    @Column(nullable = false)
    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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

    // Helper method to add serial and maintain relationship
    public void addSerial(JobCardSerial serial) {
        if (serials == null) {
            serials = new ArrayList<>();
        }
        serials.add(serial);
        serial.setJobCard(this);
    }

    // Helper method to remove serial
    public void removeSerial(JobCardSerial serial) {
        serials.remove(serial);
        serial.setJobCard(null);
    }
}