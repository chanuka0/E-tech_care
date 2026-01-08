package com.example.demo.service;

import java.util.List;

public class CreateInvoiceRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String paymentMethod;
    private Double discount;
    private Double tax;
    private Double paidAmount;
    private List<ItemRequest> items;

    // Getters and Setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

    public static class ItemRequest {
        private Long inventoryItemId;
        private Integer quantity;
        private Double unitPrice;
        private String warranty;
        private String warrantyNumber; // ✅ Manual warranty number (4-5 digits)
        private List<String> serialNumbers; // ✅ NEW: Serial numbers for serialized items

        // Getters and Setters
        public Long getInventoryItemId() { return inventoryItemId; }
        public void setInventoryItemId(Long inventoryItemId) { this.inventoryItemId = inventoryItemId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

        public String getWarranty() { return warranty; }
        public void setWarranty(String warranty) { this.warranty = warranty; }

        public String getWarrantyNumber() { return warrantyNumber; }
        public void setWarrantyNumber(String warrantyNumber) { this.warrantyNumber = warrantyNumber; }

        public List<String> getSerialNumbers() { return serialNumbers; }
        public void setSerialNumbers(List<String> serialNumbers) { this.serialNumbers = serialNumbers; }
    }
}
