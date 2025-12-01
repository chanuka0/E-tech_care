package com.example.demo.entity;

public enum SerialStatus {
    AVAILABLE,   // Available for use
    USED,        // Used in Job Card but not yet sold
    SOLD,        // Sold via Invoice payment
    DAMAGED,     // Damaged/defective
    RETURNED     // Returned by customer
}
