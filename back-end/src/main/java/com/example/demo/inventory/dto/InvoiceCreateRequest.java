package com.example.demo.inventory.dto;


//import com.example.demo.invoice.InvoiceStatus;
//import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceCreateRequest {
    @NotNull(message = "Job card ID is required")
    private Long jobCardId;

    private BigDecimal serviceCharge = BigDecimal.ZERO;
    private BigDecimal discount = BigDecimal.ZERO;
    private String notes;
    private String warrantyDetails;
}

