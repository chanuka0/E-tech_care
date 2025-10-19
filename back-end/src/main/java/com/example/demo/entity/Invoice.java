//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "invoices")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Invoice {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true)
//    private String invoiceNumber;
//
//    @ManyToOne
//    @JoinColumn(name = "job_card_id")
//    private JobCard jobCard;
//
//    private String customerName;
//    private String customerPhone;
//
//    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
//    private List<InvoiceItem> items;
//
//    private Double subtotal;
//    private Double discount;
//    private Double tax;
//    private Double total;
//
//    private Double paidAmount;
//    private Double balance;
//
//    @Enumerated(EnumType.STRING)
//    private PaymentStatus paymentStatus; // UNPAID, PARTIAL, PAID
//
//    @Enumerated(EnumType.STRING)
//    private PaymentMethod paymentMethod; // CASH, CARD
//
//    private Long createdBy;
//    private LocalDateTime createdAt;
//}
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @Column(unique = true)
    private String invoiceNumber;

    @ManyToOne
    @JoinColumn(name = "job_card_id", nullable = true) // NEW: nullable for direct sales
    private JobCard jobCard;

    private String customerName;
    private String customerPhone;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<InvoiceItem> items;

    private Double subtotal;
    private Double discount;
    private Double tax;
    private Double total;

    private Double paidAmount;
    private Double balance;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Long createdBy;
    private LocalDateTime createdAt;

    // NEW: For deletion tracking
    private Boolean isDeleted = false;
    private Long deletedBy;
    private LocalDateTime deletedAt;
    private String deletionReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isDeleted = false;
    }
}