package com.example.demo.job_card;

//import com.example.demo.entities.JobStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobCardSearchRequest {
    private String customerName;
    private String contactNumber;
    private String serialNumber;
    private String jobCardNumber;
    private JobStatus status;
    private Long laptopBrandId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean oneDayService;
    private Boolean advanceGiven;
}