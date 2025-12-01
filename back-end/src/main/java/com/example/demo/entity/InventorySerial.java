//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "inventory_serials")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class InventorySerial {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "inventory_item_id" , nullable = false)
//    @JsonBackReference
//    private InventoryItem inventoryItem;
//
////    @ManyToOne
////    @JoinColumn(name = "inventory_item_id", nullable = false)
////    private InventoryItem inventoryItem;
//
//    @Column(unique = true, nullable = false, length = 255)
//    private String serialNumber;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", length = 50, nullable = false)
//    private SerialStatus status;
//
//    @Column(name = "sold_at")
//    private LocalDateTime soldAt;
//
//    @PrePersist
//    protected void onCreate() {
//        if (status == null) {
//            status = SerialStatus.AVAILABLE;
//        }
//    }
//    @Column(columnDefinition = "TEXT")
//    private String notes;
//
//}

//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "inventory_serials")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class InventorySerial {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    @JsonBackReference
//    private InventoryItem inventoryItem;
//
//    @Column(unique = true, nullable = false, length = 255)
//    private String serialNumber;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", length = 50, nullable = false)
//    private SerialStatus status;
//
//    @Column(name = "used_at")
//    private LocalDateTime usedAt;
//
//    @Column(name = "used_in_reference_type", length = 50)
//    private String usedInReferenceType; // JOB_CARD, INVOICE
//
//    @Column(name = "used_in_reference_id")
//    private Long usedInReferenceId;
//
//    @Column(name = "used_in_reference_number", length = 100)
//    private String usedInReferenceNumber;
//
//    @Column(name = "used_by")
//    private String usedBy; // Username
//
//    @Column(columnDefinition = "TEXT")
//    private String notes;
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    protected void onCreate() {
//        if (status == null) {
//            status = SerialStatus.AVAILABLE;
//        }
//        createdAt = LocalDateTime.now();
//    }
//}

// src/main/java/com/example/demo/entity/InventorySerial.java
package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_serials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySerial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    @JsonBackReference
    private InventoryItem inventoryItem;

    @Column(unique = true, nullable = false, length = 255)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private SerialStatus status;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "used_in_reference_type", length = 50)
    private String usedInReferenceType; // JOB_CARD, INVOICE

    @Column(name = "used_in_reference_id")
    private Long usedInReferenceId;

    @Column(name = "used_in_reference_number", length = 100)
    private String usedInReferenceNumber;

    @Column(name = "used_by")
    private String usedBy; // Username

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = SerialStatus.AVAILABLE;
        }
        createdAt = LocalDateTime.now();
    }
}