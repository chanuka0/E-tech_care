package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Column(unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_card_id", nullable = true)
    private JobCard jobCard;

    private String customerName;
    private String customerPhone;
    private String customerEmail;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    // NEW: Payment relationship
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Payment> payments = new ArrayList<>();

    // NEW: Service categories total
    private Double serviceTotal = 0.0;

    // NEW: Items subtotal
    private Double itemsSubtotal = 0.0;

    // CHANGED: Now represents combined subtotal (items + services)
    private Double subtotal = 0.0;

    private Double discount = 0.0;
    private Double tax = 0.0;
    private Double total = 0.0;

    private Double paidAmount = 0.0;
    private Double balance = 0.0;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    // NEW: Payment date fields
    private LocalDateTime firstPaymentDate;
    private LocalDateTime lastPaymentDate;
    private LocalDateTime fullyPaidDate;

    private Long createdBy;
    private LocalDateTime createdAt;

    private Boolean isDeleted = false;
    private Long deletedBy;
    private LocalDateTime deletedAt;
    private String deletionReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isDeleted = false;

        // Initialize default values
        if (serviceTotal == null) serviceTotal = 0.0;
        if (itemsSubtotal == null) itemsSubtotal = 0.0;
        if (subtotal == null) subtotal = 0.0;
        if (discount == null) discount = 0.0;
        if (tax == null) tax = 0.0;
        if (total == null) total = 0.0;
        if (paidAmount == null) paidAmount = 0.0;
        if (balance == null) balance = 0.0;
        if (paymentStatus == null) paymentStatus = PaymentStatus.UNPAID;
        if (items == null) items = new ArrayList<>();
        if (payments == null) payments = new ArrayList<>();
    }
}