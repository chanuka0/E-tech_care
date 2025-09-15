package com.example.demo.inventory;

import com.example.demo.inventory.dto.JobCardItemRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class EnhancedJobCardUpdateRequest extends com.example.demo.job_card.JobCardUpdateRequest {
    private List<JobCardItemRequest> items;
    private java.math.BigDecimal serviceCharge = java.math.BigDecimal.ZERO;
    private String warrantyDetails;
}
