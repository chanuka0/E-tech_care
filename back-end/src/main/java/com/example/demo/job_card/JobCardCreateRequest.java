package com.example.demo.job_card;

//import com.example.demo.entities.JobStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobCardCreateRequest {
    private String customerName;
    private String contactNumber;
    private String serialNumber;
    private String specialNote;
    private boolean withCharger;
    private Long laptopBrandId;
    private boolean oneDayService;
    private boolean advanceGiven;
    private BigDecimal advanceAmount;
    private BigDecimal totalAmount;
    private LocalDateTime expectedDeliveryDate;
}

