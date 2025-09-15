package com.example.demo.job_card.dto;

import com.example.demo.job_card.JobStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobCardResponse {
    private Long id;
    private String jobCardNumber;
    private String customerName;
    private String contactNumber;
    private String serialNumber;
    private String specialNote;
    private boolean withCharger;
    private String laptopBrandName;
    private boolean oneDayService;
    private boolean advanceGiven;
    private BigDecimal advanceAmount;
    private BigDecimal totalAmount;
    private JobStatus status;
    private String statusDisplayName;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private String createdByUsername;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
