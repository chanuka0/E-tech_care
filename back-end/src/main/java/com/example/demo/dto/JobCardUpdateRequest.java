//package com.example.demo.dto;
//
//import com.example.demo.entity.JobStatus;
//import lombok.Data;
//import java.util.List;
//
//@Data
//public class JobCardUpdateRequest {
//    private String customerName;
//    private String customerPhone;
//    private String customerEmail;
//    private String deviceType;
//    private Long brandId;
//    private Long modelId;
//    private Long processorId;
//    private List<Long> deviceConditionIds; // CHANGED: Now supports multiple device conditions
//    private List<Long> faultIds; // CHANGED: Faults are now optional
//    private List<Long> serviceCategoryIds; // CHANGED: Services are now optional
//    private String faultDescription; // CHANGED: Now optional
//    private String notes;
//    private Double advancePayment;
//    private Double estimatedCost;
//    private JobStatus status;
//    private List<UsedItemRequest> usedItems;
//    private Boolean oneDayService;
//
//    @Data
//    public static class UsedItemRequest {
//        private Long id;
//        private Long inventoryItemId;
//        private Integer quantityUsed;
//        private Double unitPrice;
//        private List<String> usedSerialNumbers;
//        private String warranty;
//    }
//}

//package com.example.demo.dto;
//
//import com.example.demo.entity.JobStatus;
//import lombok.Data;
//import java.util.List;
//
//@Data
//public class JobCardUpdateRequest {
//    private String customerName;
//    private String customerPhone;
//    private String customerEmail;
//    private String deviceType;
//    private Long brandId;
//    private Long modelId;
//    private Long processorId;
//    private List<Long> deviceConditionIds; // FIXED: Now supports multiple device conditions
//    private List<Long> faultIds; // FIXED: Now optional (can be empty)
//    private List<Long> serviceCategoryIds; // FIXED: Now optional (can be empty)
//    private String faultDescription; // FIXED: Now optional (can be null)
//    private String notes;
//    private Double advancePayment;
//    private Double estimatedCost;
//    private JobStatus status;
//    private List<UsedItemRequest> usedItems;
//    private Boolean oneDayService;
//
//    @Data
//    public static class UsedItemRequest {
//        private Long id;
//        private Long inventoryItemId;
//        private Integer quantityUsed;
//        private Double unitPrice;
//        private List<String> usedSerialNumbers;
//        private String warranty;
//    }
//}

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
    private Long modelNumberId; // CHANGED: Add modelNumberId
    private Long processorId;

    // CHANGED: Now accepts multiple device condition IDs
    private List<Long> deviceConditionIds;

    // CHANGED: Faults and services are now optional
    private List<Long> faultIds;
    private List<Long> serviceCategoryIds;

    private String faultDescription;
    private String notes;
    private Double advancePayment;
    private Double estimatedCost;
    private JobStatus status;
    private Boolean oneDayService;

    // Used items
    private List<UsedItemRequest> usedItems;

    @Data
    public static class UsedItemRequest {
        private Long id;
        private Long inventoryItemId;
        private Integer quantityUsed;
        private Double unitPrice;
        private String warranty;
        private List<String> usedSerialNumbers;
    }
}