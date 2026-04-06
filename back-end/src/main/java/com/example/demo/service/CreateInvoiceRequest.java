
package com.example.demo.service;

import lombok.Data;
import java.util.List;

@Data
public class CreateInvoiceRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // ✅ NEW: Regular customer ID — null for walk-in customers
    private Long customerId;

    // ✅ NEW: Flag to indicate this is a regular customer (use special prices)
    private Boolean isRegularCustomer = false;

    private String paymentMethod;
    private Double discount;
    private Double tax;
    private Double paidAmount;
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private Long inventoryItemId;
        private Integer quantity;
        private Double unitPrice;
        private String warranty;
        private String warrantyNumber;
        private List<String> serialNumbers;
    }
}