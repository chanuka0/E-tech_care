package com.example.demo.dto;

import com.example.demo.entity.JobStatus;
import lombok.Data;
import java.util.List;

@Data
public class JobCardUpdateRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String deviceType;
    private Long brandId;
    private Long modelId;
    private Long processorId;
    private Long deviceConditionId;
    private List<Long> faultIds;
    private List<Long> serviceCategoryIds;
    private String faultDescription;
    private String notes;
    private Double advancePayment;
    private Double estimatedCost;
    private JobStatus status;
    private List<UsedItemRequest> usedItems;
    private Boolean oneDayService;

    @Data
    public static class UsedItemRequest {
        private Long id;
        private Long inventoryItemId;
        private Integer quantityUsed;
        private Double unitPrice;
        private List<String> usedSerialNumbers;
    }
}