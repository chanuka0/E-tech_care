package com.example.demo.inventory;

//import com.example.demo.inventory.dto.JobCardItemRequest;
import com.example.demo.inventory.dto.JobCardItemRequest;


import lombok.Data;
import java.util.List;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EnhancedJobCardCreateRequest extends StockMovementRepository.EnhancedJobCardResponse.JobCardCreateRequest {
    private List<JobCardItemRequest> items;
    private java.math.BigDecimal serviceCharge = java.math.BigDecimal.ZERO;
    private String warrantyDetails;
}

