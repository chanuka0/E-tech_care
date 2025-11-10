package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

////package com.example.demo.entity;
////
////import com.fasterxml.jackson.annotation.JsonIgnore;
////import jakarta.persistence.*;
////import lombok.AllArgsConstructor;
////import lombok.Data;
////import lombok.NoArgsConstructor;
////
////@Entity
////@Table(name = "job_card_used_items")
////@Data
////@NoArgsConstructor
////@AllArgsConstructor
////public class UsedItem {
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "job_card_id", nullable = false)
////    @JsonIgnore
////    private JobCard jobCard;
////
////    @ManyToOne(fetch = FetchType.EAGER)
////    @JoinColumn(name = "inventory_item_id", nullable = false)
////    private InventoryItem inventoryItem;
////
////    @Column(name = "quantity_used", nullable = false)
////    private Integer quantityUsed;
////
////    @Column(name = "unit_price")
////    private Double unitPrice;
////}
//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonProperty; // ADD THIS
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "job_card_used_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class UsedItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "job_card_id", nullable = false)
//    @JsonIgnore
//    private JobCard jobCard;
//
//    // IMPORTANT: Use EAGER fetch to load inventory details
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    private InventoryItem inventoryItem;
//
//    @Column(name = "quantity_used", nullable = false)
//    private Integer quantityUsed;
//
//    @Column(name = "unit_price")
//    private Double unitPrice;
//
//    // Helper method to calculate total
//    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
//    public Double getTotal() {
//        if (quantityUsed == null || unitPrice == null) {
//            return 0.0;
//        }
//        return quantityUsed * unitPrice;
//    }
//}

//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonProperty;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "job_card_used_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class UsedItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "job_card_id", nullable = false)
//    @JsonIgnore
//    private JobCard jobCard;
//
//    // IMPORTANT: Use EAGER fetch to load inventory details
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    private InventoryItem inventoryItem;
//
//    @Column(name = "quantity_used", nullable = false)
//    private Integer quantityUsed;
//
//    @Column(name = "unit_price")
//    private Double unitPrice;
//
//    /**
//     * Warranty for this used item (if applicable)
//     */
//    @Column(name = "warranty", length = 100)
//    private String warranty;
//
//    // Helper method to calculate total (read-only in JSON)
//    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
//    public Double getTotal() {
//        if (quantityUsed == null || unitPrice == null) {
//            return 0.0;
//        }
//        return quantityUsed * unitPrice;
//    }
//}

//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "used_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class UsedItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "job_card_id", nullable = false)
//    @JsonBackReference
//    private JobCard jobCard;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    private InventoryItem inventoryItem;
//
//    @Column(name = "quantity_used", nullable = false)
//    private Integer quantityUsed;
//
//    @Column(name = "unit_price")
//    private Double unitPrice;
//
//    // NEW: Track which serial numbers were used
//    @ElementCollection(fetch = FetchType.EAGER)
//    @CollectionTable(name = "used_item_serials", joinColumns = @JoinColumn(name = "used_item_id"))
//    @Column(name = "serial_number")
//    private List<String> usedSerialNumbers = new ArrayList<>();
//
//    // NEW: Warranty information for this specific usage
//    @Column(name = "warranty_period")
//    private String warrantyPeriod; // e.g., "30 days", "6 months", "1 year"
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        if (usedSerialNumbers == null) {
//            usedSerialNumbers = new ArrayList<>();
//        }
//    }
//
//    public Double getTotalPrice() {
//        return (unitPrice != null && quantityUsed != null) ? unitPrice * quantityUsed : 0.0;
//    }
//}

@Entity
@Table(name = "used_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonBackReference
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    @Column(name = "unit_price")
    private Double unitPrice;

    // This will auto-create the used_item_serials table
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "used_item_serials",
            joinColumns = @JoinColumn(name = "used_item_id")
    )
    @Column(name = "serial_number")
    private List<String> usedSerialNumbers = new ArrayList<>();

    @Column(name = "warranty_period")
    private String warrantyPeriod;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (usedSerialNumbers == null) {
            usedSerialNumbers = new ArrayList<>();
        }
    }

    public Double getTotalPrice() {
        return (unitPrice != null && quantityUsed != null) ? unitPrice * quantityUsed : 0.0;
    }
}