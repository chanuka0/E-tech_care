package com.example.demo.inventory;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryItemResponse {
    private Long itemId;
    private String name;
    private String description;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private Integer thresholdLevel;
    private ItemCategory category;
    private String categoryDisplayName;
    private String supplier;
    private String sku;
    private Boolean isActive;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private java.time.LocalDateTime createdDate;
    private java.time.LocalDateTime updatedDate;
}
