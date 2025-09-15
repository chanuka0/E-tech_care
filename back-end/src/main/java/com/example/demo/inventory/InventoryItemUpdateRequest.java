package com.example.demo.inventory;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryItemUpdateRequest {
    private String name;
    private String description;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private Integer thresholdLevel;
    private ItemCategory category;
    private String supplier;
    private String sku;
    private Boolean isActive;
}
