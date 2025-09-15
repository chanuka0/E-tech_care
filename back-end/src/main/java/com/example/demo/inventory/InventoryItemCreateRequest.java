package com.example.demo.inventory;

import com.example.demo.inventory.ItemCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryItemCreateRequest {
    @NotBlank(message = "Item name cannot be blank")
    private String name;

    private String description;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Purchase price must be greater than 0")
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Threshold level is required")
    @Min(value = 0, message = "Threshold level cannot be negative")
    private Integer thresholdLevel;

    private ItemCategory category = ItemCategory.OTHER;
    private String supplier;
    private String sku;
}

