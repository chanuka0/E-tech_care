package com.example.demo.inventory;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockUpdateRequest {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Update type is required")
    private StockUpdateType updateType;

    private String reason;

    public enum StockUpdateType {
        ADD, SUBTRACT, SET
    }
}
