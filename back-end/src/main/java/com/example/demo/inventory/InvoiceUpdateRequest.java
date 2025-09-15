package com.example.demo.inventory;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceUpdateRequest {
    private BigDecimal serviceCharge;
    private BigDecimal discount;
    private BigDecimal advancePayment;
    private String notes;
    private String warrantyDetails;
    private InvoiceStatus status;
}
