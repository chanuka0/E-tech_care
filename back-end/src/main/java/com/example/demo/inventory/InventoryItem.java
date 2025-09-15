package com.example.demo.inventory;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @NotBlank(message = "Item name cannot be blank")
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(nullable = false)
    private Integer stockQuantity;

    @NotNull(message = "Threshold level is required")
    @Min(value = 0, message = "Threshold level cannot be negative")
    @Column(nullable = false)
    private Integer thresholdLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCategory category = ItemCategory.OTHER;

    @Column(nullable = false)
    private Boolean isActive = true;

    private String supplier;
    private String sku; // Stock Keeping Unit

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime updatedDate = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
    }

    // Helper method to check if item is low on stock
    public boolean isLowStock() {
        return stockQuantity <= thresholdLevel;
    }

    // Helper method to check if item is out of stock
    public boolean isOutOfStock() {
        return stockQuantity <= 0;
    }
}