package com.example.demo.job_card;
//package com.example.demo.laptopBrand;

import com.example.demo.job_card.JobStatus;
import com.example.demo.laptopBrand.LaptopBrand;
import com.example.demo.users.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customer name cannot be blank") // Rejects null and ""
    @Column(unique = true, nullable = false)
    private String jobCardNumber;

    @NotBlank(message = "Customer name cannot be blank") // Rejects null and ""
    @Column(nullable = false)
    private String customerName;

    @NotBlank(message = "Customer name cannot be blank") // Rejects null and ""
    @Column(nullable = false)
    private String contactNumber;

    @NotBlank(message = "Customer name cannot be blank") // Rejects null and ""
    @Column(nullable = false)
    private String serialNumber;

    @Column(length = 1000)
    private String specialNote;

    private boolean withCharger = false;

    @ManyToOne
    @JoinColumn(name = "laptop_brand_id", nullable = false)
    private LaptopBrand laptopBrand;
//    private LaptopBrand laptopBrand;

    private boolean oneDayService = false;

    private boolean advanceGiven = false;

    @Column(precision = 10, scale = 2)
    private BigDecimal advanceAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.PENDING;

    private LocalDateTime expectedDeliveryDate;

    private LocalDateTime actualDeliveryDate;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime updatedDate = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
    }
}