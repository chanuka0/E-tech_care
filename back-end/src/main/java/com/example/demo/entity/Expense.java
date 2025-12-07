//
//
//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.DecimalMin;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "expenses")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Expense {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @NotBlank(message = "Category cannot be blank")
//    @Column(name = "category", nullable = false, length = 255)
//    private String category;
//
//    @Column(name = "description", columnDefinition = "TEXT")
//    private String description;
//
//    @NotNull(message = "Amount cannot be null")
//    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than 0")
//    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
//    private BigDecimal amount;
//
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at", nullable = false)
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        LocalDateTime now = LocalDateTime.now();
//        if (this.createdAt == null) {
//            this.createdAt = now;
//        }
//        if (this.updatedAt == null) {
//            this.updatedAt = now;
//        }
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        this.updatedAt = LocalDateTime.now();
//    }
//}


//
//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.DecimalMin;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "expenses")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Expense {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @NotBlank(message = "Category cannot be blank")
//    @Column(name = "category", nullable = false, length = 255)
//    private String category;
//
//    @Column(name = "description", columnDefinition = "TEXT")
//    private String description;
//
//    @NotNull(message = "Amount cannot be null")
//    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than 0")
//    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
//    private BigDecimal amount;
//
//    // ✅ NEW: Track if expense was auto-created
//    @Column(name = "auto_created", nullable = false)
//    private Boolean autoCreated = false;
//
//    @Column(name = "source_type", length = 50)
//    private String sourceType;  // MANUAL, INVENTORY_PURCHASE, STOCK_ADDITION
//
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at", nullable = false)
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        LocalDateTime now = LocalDateTime.now();
//        if (this.createdAt == null) {
//            this.createdAt = now;
//        }
//        if (this.updatedAt == null) {
//            this.updatedAt = now;
//        }
//        if (this.autoCreated == null) {
//            this.autoCreated = false;
//        }
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        this.updatedAt = LocalDateTime.now();
//    }
//}

package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category cannot be blank")
    @Column(name = "category", nullable = false, length = 255)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than 0")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // ✅ Track if expense was auto-created from inventory
    @Column(name = "auto_created", nullable = false)
    private Boolean autoCreated = false;

    // ✅ Track source type (MANUAL, INVENTORY_PURCHASE, STOCK_ADDITION)
    @Column(name = "source_type", length = 50)
    private String sourceType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.autoCreated == null) {
            this.autoCreated = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}