//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "inventory_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class InventoryItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, length = 100, nullable = false)
//    private String sku;
//
//    @Column(nullable = false, length = 255)
//    private String name;
//
//    @Column(columnDefinition = "TEXT")
//    private String description;
//
//    @Column(length = 100)
//    private String category;
//
//    @Column(nullable = false)
//    private Integer quantity;
//
//    @Column(name = "min_threshold")
//    private Integer minThreshold;
//
//    @Column(name = "purchase_price")
//    private Double purchasePrice;
//
//    @Column(name = "selling_price")
//    private Double sellingPrice;
//
//    @Column(name = "special_price")
//    private Double specialPrice;
//
//    @Column(name = "has_serialization")
//    private Boolean hasSerialization = false;
//
//    @OneToMany(mappedBy = "inventoryItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @JsonManagedReference
//    private List<InventorySerial> serials;
//
////    @OneToMany(mappedBy = "inventoryItem", cascade = CascadeType.ALL)
////    private List<InventorySerial> serials;
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//        if (hasSerialization == null) {
//            hasSerialization = false;
//        }
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//}

package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore; // ADD THIS
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 100, nullable = false)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "min_threshold")
    private Integer minThreshold;

    @Column(name = "purchase_price")
    private Double purchasePrice;

    @Column(name = "selling_price")
    private Double sellingPrice;

    @Column(name = "special_price")
    private Double specialPrice;

    @Column(name = "has_serialization")
    private Boolean hasSerialization = false;

    // EXCLUDE serials when this is nested in UsedItem
    @OneToMany(mappedBy = "inventoryItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnore  // Prevent circular serialization
    private List<InventorySerial> serials;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (hasSerialization == null) {
            hasSerialization = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}