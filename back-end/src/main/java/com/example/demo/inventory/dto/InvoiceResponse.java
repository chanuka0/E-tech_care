package com.example.demo.inventory.dto;

import com.example.demo.inventory.InvoiceItemResponse;
import com.example.demo.inventory.InvoiceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long jobCardId;
    private String jobCardNumber;
    private String customerName;
    private String customerContact;
    private BigDecimal itemsTotal;
    private BigDecimal serviceCharge;
    private BigDecimal discount;
    private BigDecimal advancePayment;
    private BigDecimal totalAmount;
    private BigDecimal balanceAmount;
    private String notes;
    private String warrantyDetails;
    private InvoiceStatus status;
    private String statusDisplayName;
    private String createdByUsername;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private List<InvoiceItemResponse> items;
}
