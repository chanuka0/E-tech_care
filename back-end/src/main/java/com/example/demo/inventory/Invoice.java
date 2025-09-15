package com.example.demo.inventory;

import com.example.demo.job_card.JobCard;
import com.example.demo.users.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Invoice number cannot be blank")
    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    @NotBlank(message = "Customer name is required")
    @Column(nullable = false)
    private String customerName;

    @NotBlank(message = "Customer contact is required")
    @Column(nullable = false)
    private String customerContact;

    @Column(precision = 10, scale = 2)
    private BigDecimal itemsTotal = BigDecimal.ZERO; // Total cost of items used

    @Column(precision = 10, scale = 2)
    private BigDecimal serviceCharge = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal advancePayment = BigDecimal.ZERO;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Total amount cannot be negative")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal balanceAmount; // totalAmount - advancePayment

    @Column(length = 1000)
    private String notes;

    @Column(length = 500)
    private String warrantyDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime updatedDate = LocalDateTime.now();

//    @PreUpdate
//    public void preUpdate() {
//        updatedDate = LocalDateTime.now();
//    }
//
//    @PrePersist
////    @PreUpdate
//    public void calculateBalanceAmount() {
//        if (totalAmount != null && advancePayment != null) {
//            balanceAmount = totalAmount.subtract(advancePayment);
//        }
//    }
// ✅ Single callback for both persist and update events
@PrePersist
@PreUpdate
public void onSaveOrUpdate() {
    updatedDate = LocalDateTime.now();
    if (totalAmount != null && advancePayment != null) {
        balanceAmount = totalAmount.subtract(advancePayment);
    }
}
}