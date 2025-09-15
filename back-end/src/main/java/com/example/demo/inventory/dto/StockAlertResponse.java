package com.example.demo.inventory.dto;


import com.example.demo.inventory.StockAlert;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockAlertResponse {
    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private Integer currentStock;
    private Integer thresholdLevel;
    private StockAlert.AlertLevel alertLevel;
    private String alertLevelDisplayName;
    private Boolean isResolved;
    private LocalDateTime createdDate;
    private LocalDateTime resolvedDate;
}