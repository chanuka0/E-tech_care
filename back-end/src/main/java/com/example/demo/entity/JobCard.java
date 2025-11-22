//
//
//
//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import lombok.*;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "job_cards")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class JobCard {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, nullable = false, length = 100)
//    private String jobNumber;
//
//    @NotBlank(message = "Customer name cannot be blank")
//    @Column(nullable = false, length = 100)
//    private String customerName;
//
//    @Column(nullable = false, length = 20)
//    private String customerPhone;
//
//    @Column(length = 100)
//    private String customerEmail;
//
//    @Column(nullable = false, length = 50)
//    private String deviceType;
//
//    // NEW: Changed to ManyToOne relationships
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "brand_id")
//    private Brand brand;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "model_id")
//    private Model model;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "processor_id")
//    private Processor processor;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "device_condition_id")
//    private DeviceCondition deviceCondition;
//
//    // Multiple faults (many-to-many relationship)
//    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//    @JoinTable(
//            name = "job_card_faults",
//            joinColumns = @JoinColumn(name = "job_card_id"),
//            inverseJoinColumns = @JoinColumn(name = "fault_id")
//    )
//    private List<Fault> faults = new ArrayList<>();
//
//    @NotBlank(message = "Fault description cannot be blank")
//    @Column(columnDefinition = "TEXT", nullable = false)
//    private String faultDescription;
//
//    @Column(columnDefinition = "TEXT")
//    private String notes;
//
//    @Enumerated(EnumType.STRING)
//    @Column(length = 50, nullable = false)
//    private JobStatus status;
//
//    @Column(name = "advance_payment")
//    private Double advancePayment;
//
//    @Column(name = "estimated_cost")
//    private Double estimatedCost;
//
//    @Column(name = "total_service_price")
//    private Double totalServicePrice = 0.0;
//
//    @Column(name = "one_day_service", nullable = false)
//    private Boolean oneDayService = false;
//
//    // Service Categories (many-to-many relationship)
//    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//    @JoinTable(
//            name = "job_card_service_categories",
//            joinColumns = @JoinColumn(name = "job_card_id"),
//            inverseJoinColumns = @JoinColumn(name = "service_category_id")
//    )
//    private List<ServiceCategory> serviceCategories = new ArrayList<>();
//
//    // Serials
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<JobCardSerial> serials = new ArrayList<>();
//
//    // Used items
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<UsedItem> usedItems = new ArrayList<>();
//
//    // Cancellation fields
//    @Column(length = 50)
//    private String cancelledBy;
//
//    @Column(name = "cancelled_by_user_id")
//    private Long cancelledByUserId;
//
//    @Column(columnDefinition = "TEXT")
//    private String cancellationReason;
//
//    @Column(name = "cancellation_fee")
//    private Double cancellationFee;
//
//    @Column(nullable = false, name = "created_by")
//    private Long createdBy;
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @Column(name = "completed_at")
//    private LocalDateTime completedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//        if (totalServicePrice == null) {
//            totalServicePrice = 0.0;
//        }
//        if (oneDayService == null) {
//            oneDayService = false;
//        }
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//
//    public void addSerial(JobCardSerial serial) {
//        if (serials == null) {
//            serials = new ArrayList<>();
//        }
//        serials.add(serial);
//        serial.setJobCard(this);
//    }
//
//    public void removeSerial(JobCardSerial serial) {
//        serials.remove(serial);
//        serial.setJobCard(null);
//    }
//
//    public void addUsedItem(UsedItem item) {
//        if (usedItems == null) {
//            usedItems = new ArrayList<>();
//        }
//        usedItems.add(item);
//        item.setJobCard(this);
//    }
//
//    public void removeUsedItem(UsedItem item) {
//        usedItems.remove(item);
//        item.setJobCard(null);
//    }
//
//    public void addFault(Fault fault) {
//        if (faults == null) {
//            faults = new ArrayList<>();
//        }
//        if (!faults.contains(fault)) {
//            faults.add(fault);
//        }
//    }
//
//    public void removeFault(Fault fault) {
//        if (faults != null) {
//            faults.remove(fault);
//        }
//    }
//
//    public void clearFaults() {
//        if (faults != null) {
//            faults.clear();
//        }
//    }
//    // Helper methods for status transitions
//    public void markWaitingForParts() {
//        this.status = JobStatus.WAITING_FOR_PARTS;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void markWaitingForApproval() {
//        this.status = JobStatus.WAITING_FOR_APPROVAL;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void markInProgress() {
//        this.status = JobStatus.IN_PROGRESS;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void addServiceCategory(ServiceCategory serviceCategory) {
//        if (serviceCategories == null) {
//            serviceCategories = new ArrayList<>();
//        }
//        if (!serviceCategories.contains(serviceCategory)) {
//            serviceCategories.add(serviceCategory);
//        }
//    }
//
//    public void removeServiceCategory(ServiceCategory serviceCategory) {
//        if (serviceCategories != null) {
//            serviceCategories.remove(serviceCategory);
//        }
//    }
//
//    public void clearServiceCategories() {
//        if (serviceCategories != null) {
//            serviceCategories.clear();
//        }
//    }
//
//    public void calculateTotalServicePrice() {
//        this.totalServicePrice = 0.0;
//        if (serviceCategories != null && !serviceCategories.isEmpty()) {
//            this.totalServicePrice = serviceCategories.stream()
//                    .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
//                    .sum();
//        }
//    }
//}


//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//import lombok.*;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "job_cards")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class JobCard {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true, nullable = false, length = 100)
//    private String jobNumber;
//
//    @NotBlank(message = "Customer name cannot be blank")
//    @Column(nullable = false, length = 100)
//    private String customerName;
//
//    @Column(nullable = false, length = 20)
//    private String customerPhone;
//
//    @Column(length = 100)
//    private String customerEmail;
//
//    @Column(nullable = false, length = 50)
//    private String deviceType;
//
//    // All device information parts are optional
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "brand_id")
//    private Brand brand;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "model_id")
//    private Model model;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "processor_id")
//    private Processor processor;
//
//    // FIXED: Multiple device conditions (optional)
//    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//    @JoinTable(
//            name = "job_card_device_conditions",
//            joinColumns = @JoinColumn(name = "job_card_id"),
//            inverseJoinColumns = @JoinColumn(name = "device_condition_id")
//    )
//    private List<DeviceCondition> deviceConditions = new ArrayList<>();
//
//    // FIXED: Faults are now optional (can be null/empty) - removed validation
//    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//    @JoinTable(
//            name = "job_card_faults",
//            joinColumns = @JoinColumn(name = "job_card_id"),
//            inverseJoinColumns = @JoinColumn(name = "fault_id")
//    )
//    private List<Fault> faults = new ArrayList<>();
//
//    // FIXED: Fault description is now optional - removed @NotBlank
//    @Column(columnDefinition = "TEXT")
//    private String faultDescription;
//
//    @Column(columnDefinition = "TEXT")
//    private String notes;
//
//    @Enumerated(EnumType.STRING)
//    @Column(length = 50, nullable = false)
//    private JobStatus status;
//
//    @Column(name = "advance_payment")
//    private Double advancePayment;
//
//    @Column(name = "estimated_cost")
//    private Double estimatedCost;
//
//    @Column(name = "total_service_price")
//    private Double totalServicePrice = 0.0;
//
//    @Column(name = "one_day_service", nullable = false)
//    private Boolean oneDayService = false;
//
//    // FIXED: Service categories are now optional
//    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//    @JoinTable(
//            name = "job_card_service_categories",
//            joinColumns = @JoinColumn(name = "job_card_id"),
//            inverseJoinColumns = @JoinColumn(name = "service_category_id")
//    )
//    private List<ServiceCategory> serviceCategories = new ArrayList<>();
//
//    // Serials
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<JobCardSerial> serials = new ArrayList<>();
//
//    // Used items
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<UsedItem> usedItems = new ArrayList<>();
//
//    // Cancellation fields
//    @Column(length = 50)
//    private String cancelledBy;
//
//    @Column(name = "cancelled_by_user_id")
//    private Long cancelledByUserId;
//
//    @Column(columnDefinition = "TEXT")
//    private String cancellationReason;
//
//    @Column(name = "cancellation_fee")
//    private Double cancellationFee;
//
//    @Column(nullable = false, name = "created_by")
//    private Long createdBy;
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @Column(name = "completed_at")
//    private LocalDateTime completedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//        if (totalServicePrice == null) {
//            totalServicePrice = 0.0;
//        }
//        if (oneDayService == null) {
//            oneDayService = false;
//        }
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//
//    public void addSerial(JobCardSerial serial) {
//        if (serials == null) {
//            serials = new ArrayList<>();
//        }
//        serials.add(serial);
//        serial.setJobCard(this);
//    }
//
//    public void removeSerial(JobCardSerial serial) {
//        serials.remove(serial);
//        serial.setJobCard(null);
//    }
//
//    public void addUsedItem(UsedItem item) {
//        if (usedItems == null) {
//            usedItems = new ArrayList<>();
//        }
//        usedItems.add(item);
//        item.setJobCard(this);
//    }
//
//    public void removeUsedItem(UsedItem item) {
//        usedItems.remove(item);
//        item.setJobCard(null);
//    }
//
//    public void addFault(Fault fault) {
//        if (faults == null) {
//            faults = new ArrayList<>();
//        }
//        if (!faults.contains(fault)) {
//            faults.add(fault);
//        }
//    }
//
//    public void removeFault(Fault fault) {
//        if (faults != null) {
//            faults.remove(fault);
//        }
//    }
//
//    public void clearFaults() {
//        if (faults != null) {
//            faults.clear();
//        }
//    }
//
//    // FIXED: Device condition management methods for multiple conditions
//    public void addDeviceCondition(DeviceCondition deviceCondition) {
//        if (deviceConditions == null) {
//            deviceConditions = new ArrayList<>();
//        }
//        if (!deviceConditions.contains(deviceCondition)) {
//            deviceConditions.add(deviceCondition);
//        }
//    }
//
//    public void removeDeviceCondition(DeviceCondition deviceCondition) {
//        if (deviceConditions != null) {
//            deviceConditions.remove(deviceCondition);
//        }
//    }
//
//    public void clearDeviceConditions() {
//        if (deviceConditions != null) {
//            deviceConditions.clear();
//        }
//    }
//
//    // Helper methods for status transitions
//    public void markWaitingForParts() {
//        this.status = JobStatus.WAITING_FOR_PARTS;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void markWaitingForApproval() {
//        this.status = JobStatus.WAITING_FOR_APPROVAL;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void markInProgress() {
//        this.status = JobStatus.IN_PROGRESS;
//        this.updatedAt = LocalDateTime.now();
//    }
//
//    public void addServiceCategory(ServiceCategory serviceCategory) {
//        if (serviceCategories == null) {
//            serviceCategories = new ArrayList<>();
//        }
//        if (!serviceCategories.contains(serviceCategory)) {
//            serviceCategories.add(serviceCategory);
//        }
//    }
//
//    public void removeServiceCategory(ServiceCategory serviceCategory) {
//        if (serviceCategories != null) {
//            serviceCategories.remove(serviceCategory);
//        }
//    }
//
//    public void clearServiceCategories() {
//        if (serviceCategories != null) {
//            serviceCategories.clear();
//        }
//    }
//
//    public void calculateTotalServicePrice() {
//        this.totalServicePrice = 0.0;
//        if (serviceCategories != null && !serviceCategories.isEmpty()) {
//            this.totalServicePrice = serviceCategories.stream()
//                    .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
//                    .sum();
//        }
//    }
//}


package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String jobNumber;

    @NotBlank(message = "Customer name cannot be blank")
    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(length = 100)
    private String customerEmail;

    @Column(nullable = false, length = 50)
    private String deviceType;

    // All device information parts are optional
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "model_id")
    private Model model;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processor_id")
    private Processor processor;

    // CHANGED: Multiple device conditions (optional)
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "job_card_device_conditions",
            joinColumns = @JoinColumn(name = "job_card_id"),
            inverseJoinColumns = @JoinColumn(name = "device_condition_id")
    )
    private List<DeviceCondition> deviceConditions = new ArrayList<>();

    // CHANGED: Faults are now optional (can be null/empty)
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "job_card_faults",
            joinColumns = @JoinColumn(name = "job_card_id"),
            inverseJoinColumns = @JoinColumn(name = "fault_id")
    )
    private List<Fault> faults = new ArrayList<>();

    // CHANGED: Fault description is now optional
    @Column(columnDefinition = "TEXT")
    private String faultDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private JobStatus status;

    @Column(name = "advance_payment")
    private Double advancePayment;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "total_service_price")
    private Double totalServicePrice = 0.0;

    @Column(name = "one_day_service", nullable = false)
    private Boolean oneDayService = false;

    // CHANGED: Service categories are now optional
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "job_card_service_categories",
            joinColumns = @JoinColumn(name = "job_card_id"),
            inverseJoinColumns = @JoinColumn(name = "service_category_id")
    )
    private List<ServiceCategory> serviceCategories = new ArrayList<>();

    // Serials
    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<JobCardSerial> serials = new ArrayList<>();

    // Used items
    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UsedItem> usedItems = new ArrayList<>();

    // Cancellation fields
    @Column(length = 50)
    private String cancelledBy;

    @Column(name = "cancelled_by_user_id")
    private Long cancelledByUserId;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancellation_fee")
    private Double cancellationFee;

    @Column(nullable = false, name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalServicePrice == null) {
            totalServicePrice = 0.0;
        }
        if (oneDayService == null) {
            oneDayService = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addSerial(JobCardSerial serial) {
        if (serials == null) {
            serials = new ArrayList<>();
        }
        serials.add(serial);
        serial.setJobCard(this);
    }

    public void removeSerial(JobCardSerial serial) {
        serials.remove(serial);
        serial.setJobCard(null);
    }

    public void addUsedItem(UsedItem item) {
        if (usedItems == null) {
            usedItems = new ArrayList<>();
        }
        usedItems.add(item);
        item.setJobCard(this);
    }

    public void removeUsedItem(UsedItem item) {
        usedItems.remove(item);
        item.setJobCard(null);
    }

    public void addFault(Fault fault) {
        if (faults == null) {
            faults = new ArrayList<>();
        }
        if (!faults.contains(fault)) {
            faults.add(fault);
        }
    }

    public void removeFault(Fault fault) {
        if (faults != null) {
            faults.remove(fault);
        }
    }

    public void clearFaults() {
        if (faults != null) {
            faults.clear();
        }
    }

    // CHANGED: Device condition management methods for multiple conditions
    public void addDeviceCondition(DeviceCondition deviceCondition) {
        if (deviceConditions == null) {
            deviceConditions = new ArrayList<>();
        }
        if (!deviceConditions.contains(deviceCondition)) {
            deviceConditions.add(deviceCondition);
        }
    }

    public void removeDeviceCondition(DeviceCondition deviceCondition) {
        if (deviceConditions != null) {
            deviceConditions.remove(deviceCondition);
        }
    }

    public void clearDeviceConditions() {
        if (deviceConditions != null) {
            deviceConditions.clear();
        }
    }

    // Helper methods for status transitions
    public void markWaitingForParts() {
        this.status = JobStatus.WAITING_FOR_PARTS;
        this.updatedAt = LocalDateTime.now();
    }

    public void markWaitingForApproval() {
        this.status = JobStatus.WAITING_FOR_APPROVAL;
        this.updatedAt = LocalDateTime.now();
    }

    public void markInProgress() {
        this.status = JobStatus.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }

    public void addServiceCategory(ServiceCategory serviceCategory) {
        if (serviceCategories == null) {
            serviceCategories = new ArrayList<>();
        }
        if (!serviceCategories.contains(serviceCategory)) {
            serviceCategories.add(serviceCategory);
        }
    }

    public void removeServiceCategory(ServiceCategory serviceCategory) {
        if (serviceCategories != null) {
            serviceCategories.remove(serviceCategory);
        }
    }

    public void clearServiceCategories() {
        if (serviceCategories != null) {
            serviceCategories.clear();
        }
    }

    public void calculateTotalServicePrice() {
        this.totalServicePrice = 0.0;
        if (serviceCategories != null && !serviceCategories.isEmpty()) {
            this.totalServicePrice = serviceCategories.stream()
                    .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
                    .sum();
        }
    }
}