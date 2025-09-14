package com.example.demo.job_card;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobCardUpdateRequest {
    private String customerName;
    private String contactNumber;
    private String specialNote;
    private boolean withCharger;
    private Long laptopBrandId;
    private boolean oneDayService;
    private boolean advanceGiven;
    private BigDecimal advanceAmount;
    private BigDecimal totalAmount;
    private JobStatus status;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
}
