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
//    @Column(length = 50)
//    private String brandId;
//
//    @Column(length = 50)
//    private String modelId;
//
//    // NEW: Fault reference
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "fault_id")
//    private Fault fault;
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
//    // Serials
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<JobCardSerial> serials = new ArrayList<>();
//
//    // NEW: Used items
//    @OneToMany(mappedBy = "jobCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    private List<UsedItem> usedItems = new ArrayList<>();
//
//    // Cancellation fields
//    @Column(length = 50)
//    private String cancelledBy;
//
//    @Column(name = "cancelled_by_user_id")
//    private Long cancelledByUserId; // NEW: Who cancelled (user ID)
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
//    @Column(length = 50)
//    private String brandId;
//
//    @Column(length = 50)
//    private String modelId;
//
//    // Fault reference
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "fault_id")
//    private Fault fault;
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
//    // NEW: Service Categories (many-to-many relationship)
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
//    // NEW: Service category helper methods
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
//    @Column(length = 50)
//    private String brandId;
//
//    @Column(length = 50)
//    private String modelId;
//
//    // MODIFIED: Multiple faults (many-to-many relationship)
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
//    // ADDED: Total service price (calculated from service categories)
//    @Column(name = "total_service_price")
//    private Double totalServicePrice = 0.0;
//
//    // ADDED: One Day Service flag
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
//            oneDayService = false; // Default to false
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
//    // MODIFIED: Fault helper methods (plural)
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
//    // Service category helper methods
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
//    // ADDED: Calculate total service price from service categories
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

    // NEW: Changed to ManyToOne relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "model_id")
    private Model model;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processor_id")
    private Processor processor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_condition_id")
    private DeviceCondition deviceCondition;

    // Multiple faults (many-to-many relationship)
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "job_card_faults",
            joinColumns = @JoinColumn(name = "job_card_id"),
            inverseJoinColumns = @JoinColumn(name = "fault_id")
    )
    private List<Fault> faults = new ArrayList<>();

    @NotBlank(message = "Fault description cannot be blank")
    @Column(columnDefinition = "TEXT", nullable = false)
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

    // Service Categories (many-to-many relationship)
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