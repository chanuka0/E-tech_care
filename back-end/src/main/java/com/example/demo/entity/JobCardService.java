//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
///**
// * Represents a service item added to a job card
// * Links ServiceCategory to JobCard with quantity and price
// */
//@Entity
//@Table(name = "job_card_services")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class JobCardService {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "job_card_id", nullable = false)
//    @JsonBackReference
//    private JobCard jobCard;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "service_category_id", nullable = false)
//    private ServiceCategory serviceCategory;
//
//    @Column(name = "quantity", nullable = false)
//    private Integer quantity = 1;
//
//    @Column(name = "unit_price", nullable = false)
//    private Double unitPrice; // Price at the time of adding
//
//    @Column(name = "total")
//    private Double total; // quantity * unitPrice
//
//    @Column(name = "notes", columnDefinition = "TEXT")
//    private String notes;
//
//    @PrePersist
//    protected void onCreate() {
//        if (quantity == null) {
//            quantity = 1;
//        }
//        calculateTotal();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        calculateTotal();
//    }
//
//    private void calculateTotal() {
//        if (unitPrice != null && quantity != null) {
//            this.total = unitPrice * quantity;
//        }
//    }
//
//    public JobCard removeServiceFromJobCard(Long id, Long serviceId) {
//
//    }
//}