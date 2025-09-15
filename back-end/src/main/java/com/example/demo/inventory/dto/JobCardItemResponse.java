package com.example.demo.inventory.dto;

import lombok.Data;



import java.math.BigDecimal;

@Data
public class JobCardItemResponse {
    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private Integer quantityUsed;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;
    private java.time.LocalDateTime addedDate;
}
