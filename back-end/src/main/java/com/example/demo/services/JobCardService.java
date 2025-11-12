//
//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.repositories.FaultRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import com.example.demo.repositories.ServiceCategoryRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    /**
//     * Create a new job card with multiple faults, service categories, serials, and used items
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // MODIFIED: Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // ADDED: Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // MODIFIED: Get fault names (plural)
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() + " - Faults: " + faultNames +
//                        " - Services: " + serviceNames + " - Total Service Price: " + saved.getTotalServicePrice(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Update existing job card with faults, service categories, serials, used items, and status
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//        existing.setBrandId(updates.getBrandId());
//        existing.setModelId(updates.getModelId());
//
//        // MODIFIED: Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // ADDED: Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // Update used items if provided
//        if (updates.getUsedItems() != null) {
//            existing.getUsedItems().clear();
//            for (UsedItem item : updates.getUsedItems()) {
//                // Ensure unit price is set from inventory if not provided
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                existing.addUsedItem(item);
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber(),
//                        existing
//                );
//            }
//        }
//
//        return jobCardRepository.save(existing);
//    }
//
//    /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Get all job cards (exclude deleted ones if needed)
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Search job cards by customer name, phone, or job number
//     */
//    public List<JobCard> searchJobCards(String searchTerm) {
//        return jobCardRepository.searchJobCards(searchTerm);
//    }
//
//    /**
//     * Get job cards created within a date range
//     */
//    public List<JobCard> getJobCardsByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.findByCreatedAtBetween(start, end);
//    }
//
//    /**
//     * Get job cards by customer phone
//     */
//    public List<JobCard> getJobCardsByCustomerPhone(String phone) {
//        return jobCardRepository.findByCustomerPhone(phone);
//    }
//
//    /**
//     * Get job cards by device type
//     */
//    public List<JobCard> getJobCardsByDeviceType(String deviceType) {
//        return jobCardRepository.findByDeviceType(deviceType);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//
//    /**
//     * Get count of job cards by status
//     */
//    public Long getJobCardCountByStatus(JobStatus status) {
//        return jobCardRepository.countByStatus(status);
//    }
//
//    /**
//     * Get count of job cards created in date range
//     */
//    public Long getJobCardCountByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.countJobsByDateRange(start, end);
//    }
//}

//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.repositories.FaultRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import com.example.demo.repositories.ServiceCategoryRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    /**
//     * Create a new job card with multiple faults, service categories, serials, and used items
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // MODIFIED: Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // ADDED: Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // MODIFIED: Get fault names (plural)
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() + " - Faults: " + faultNames +
//                        " - Services: " + serviceNames + " - Total Service Price: " + saved.getTotalServicePrice(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Update existing job card with faults, service categories, serials, used items, and status
//     * FIXED: Properly handles used items updates
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//        existing.setBrandId(updates.getBrandId());
//        existing.setModelId(updates.getModelId());
//
//        // MODIFIED: Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // ADDED: Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // FIXED: Properly update used items - IMPORTANT!
//        if (updates.getUsedItems() != null) {
//            // Clear existing used items
//            existing.getUsedItems().clear();
//
//            // Add new used items
//            for (UsedItem item : updates.getUsedItems()) {
//                // IMPORTANT: Load the inventory item from database to ensure it's managed
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                // Create a new UsedItem with proper references
//                UsedItem newUsedItem = new UsedItem();
//                newUsedItem.setInventoryItem(invItem);
//                newUsedItem.setQuantityUsed(item.getQuantityUsed());
//
//                // Set unit price - use from item if provided, otherwise from inventory
//                if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
//                    newUsedItem.setUnitPrice(item.getUnitPrice());
//                } else {
//                    newUsedItem.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                // Add to job card (this sets the bidirectional relationship)
//                existing.addUsedItem(newUsedItem);
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber(),
//                        existing
//                );
//            }
//        }
//
//        // IMPORTANT: Save and flush to ensure all changes are persisted
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush(); // Force flush to database
//
//        return saved;
//    }
//
//    /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Get all job cards (exclude deleted ones if needed)
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Search job cards by customer name, phone, or job number
//     */
//    public List<JobCard> searchJobCards(String searchTerm) {
//        return jobCardRepository.searchJobCards(searchTerm);
//    }
//
//    /**
//     * Get job cards created within a date range
//     */
//    public List<JobCard> getJobCardsByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.findByCreatedAtBetween(start, end);
//    }
//
//    /**
//     * Get job cards by customer phone
//     */
//    public List<JobCard> getJobCardsByCustomerPhone(String phone) {
//        return jobCardRepository.findByCustomerPhone(phone);
//    }
//
//    /**
//     * Get job cards by device type
//     */
//    public List<JobCard> getJobCardsByDeviceType(String deviceType) {
//        return jobCardRepository.findByDeviceType(deviceType);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//
//    /**
//     * Get count of job cards by status
//     */
//    public Long getJobCardCountByStatus(JobStatus status) {
//        return jobCardRepository.countByStatus(status);
//    }
//
//    /**
//     * Get count of job cards created in date range
//     */
//    public Long getJobCardCountByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.countJobsByDateRange(start, end);
//    }
//}

//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.repositories.FaultRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import com.example.demo.repositories.ServiceCategoryRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    /**
//     * Create a new job card with multiple faults, service categories, serials, and used items
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // MODIFIED: Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // ADDED: Ensure oneDayService is not null
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//
//        // ADDED: Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // MODIFIED: Get fault names (plural)
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        // ADDED: Include One Day Service in notification if enabled
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Total Service Price: " + saved.getTotalServicePrice() +
//                        priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Update existing job card with faults, service categories, serials, used items, and status
//     * FIXED: Properly handles used items updates and oneDayService field
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//        existing.setBrandId(updates.getBrandId());
//        existing.setModelId(updates.getModelId());
//
//        // ADDED: Update oneDayService field
//        if (updates.getOneDayService() != null) {
//            existing.setOneDayService(updates.getOneDayService());
//        }
//
//        // MODIFIED: Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // ADDED: Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // FIXED: Properly update used items - IMPORTANT!
//        if (updates.getUsedItems() != null) {
//            // Clear existing used items
//            existing.getUsedItems().clear();
//
//            // Add new used items
//            for (UsedItem item : updates.getUsedItems()) {
//                // IMPORTANT: Load the inventory item from database to ensure it's managed
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                // Create a new UsedItem with proper references
//                UsedItem newUsedItem = new UsedItem();
//                newUsedItem.setInventoryItem(invItem);
//                newUsedItem.setQuantityUsed(item.getQuantityUsed());
//
//                // Set unit price - use from item if provided, otherwise from inventory
//                if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
//                    newUsedItem.setUnitPrice(item.getUnitPrice());
//                } else {
//                    newUsedItem.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                // Add to job card (this sets the bidirectional relationship)
//                existing.addUsedItem(newUsedItem);
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//
//                // ADDED: Include One Day Service in completion notification
//                String priorityInfo = existing.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber() + priorityInfo,
//                        existing
//                );
//            }
//        }
//
//        // IMPORTANT: Save and flush to ensure all changes are persisted
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush(); // Force flush to database
//
//        return saved;
//    }
//
//    /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//
//        // ADDED: Include One Day Service in cancellation notification
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * MODIFIED: Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        // ADDED: Recalculate total service price
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Update One Day Service status for a job card
//     */
//    @Transactional
//    public JobCard updateOneDayService(Long jobCardId, Boolean oneDayService) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.setOneDayService(oneDayService != null ? oneDayService : false);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // Send notification for priority change
//        String priorityStatus = oneDayService ? "enabled" : "disabled";
//        notificationService.sendNotification(
//                NotificationType.JOB_UPDATED,
//                "One Day Service " + priorityStatus + " for job: " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Get job cards with One Day Service enabled
//     */
//    public List<JobCard> getOneDayServiceJobCards() {
//        // Since we don't have a direct repository method, we'll filter in memory
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .toList();
//    }
//
//    /**
//     * Get pending One Day Service job cards (urgent attention needed)
//     */
//    public List<JobCard> getPendingOneDayServiceJobCards() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .filter(job -> job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.IN_PROGRESS)
//                .toList();
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Get all job cards (exclude deleted ones if needed)
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Search job cards by customer name, phone, or job number
//     */
//    public List<JobCard> searchJobCards(String searchTerm) {
//        return jobCardRepository.searchJobCards(searchTerm);
//    }
//
//    /**
//     * Get job cards created within a date range
//     */
//    public List<JobCard> getJobCardsByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.findByCreatedAtBetween(start, end);
//    }
//
//    /**
//     * Get job cards by customer phone
//     */
//    public List<JobCard> getJobCardsByCustomerPhone(String phone) {
//        return jobCardRepository.findByCustomerPhone(phone);
//    }
//
//    /**
//     * Get job cards by device type
//     */
//    public List<JobCard> getJobCardsByDeviceType(String deviceType) {
//        return jobCardRepository.findByDeviceType(deviceType);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//
//    /**
//     * Get count of job cards by status
//     */
//    public Long getJobCardCountByStatus(JobStatus status) {
//        return jobCardRepository.countByStatus(status);
//    }
//
//    /**
//     * Get count of job cards created in date range
//     */
//    public Long getJobCardCountByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.countJobsByDateRange(start, end);
//    }
//
//    /**
//     * Get count of One Day Service job cards
//     */
//    public Long getOneDayServiceJobCardCount() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .count();
//    }
//
//    /**
//     * Get count of pending One Day Service job cards
//     */
//    public Long getPendingOneDayServiceJobCardCount() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .filter(job -> job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.IN_PROGRESS)
//                .count();
//    }
//}

//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    // NEW: Add the 4 new repositories
//    private final BrandRepository brandRepository;
//    private final ModelRepository modelRepository;
//    private final ProcessorRepository processorRepository;
//    private final DeviceConditionRepository deviceConditionRepository;
//
//    /**
//     * Create a new job card with brands, models, processors, device conditions, faults, service categories, serials, and used items
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // NEW: Load and validate Brand
//        if (jobCard.getBrand() != null && jobCard.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(jobCard.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + jobCard.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            jobCard.setBrand(dbBrand);
//        } else {
//            jobCard.setBrand(null);
//        }
//
//        // NEW: Load and validate Model
//        if (jobCard.getModel() != null && jobCard.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(jobCard.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + jobCard.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            jobCard.setModel(dbModel);
//        } else {
//            jobCard.setModel(null);
//        }
//
//        // NEW: Load and validate Processor
//        if (jobCard.getProcessor() != null && jobCard.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(jobCard.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + jobCard.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            jobCard.setProcessor(dbProcessor);
//        } else {
//            jobCard.setProcessor(null);
//        }
//
//        // NEW: Load and validate Device Condition
//        if (jobCard.getDeviceCondition() != null && jobCard.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(jobCard.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + jobCard.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            jobCard.setDeviceCondition(dbCondition);
//        } else {
//            jobCard.setDeviceCondition(null);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Ensure oneDayService is not null
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//
//        // Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // Get fault names
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        // Include One Day Service in notification if enabled
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Total Service Price: " + saved.getTotalServicePrice() +
//                        priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    private String generateJobNumber() {
//        return "";
//    }
//
//    /**
//     * Update existing job card with brands, models, processors, device conditions, faults, service categories, serials, used items, and status
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//
//        // NEW: Update Brand
//        if (updates.getBrand() != null && updates.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(updates.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + updates.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            existing.setBrand(dbBrand);
//        } else {
//            existing.setBrand(null);
//        }
//
//        // NEW: Update Model
//        if (updates.getModel() != null && updates.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(updates.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + updates.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            existing.setModel(dbModel);
//        } else {
//            existing.setModel(null);
//        }
//
//        // NEW: Update Processor
//        if (updates.getProcessor() != null && updates.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(updates.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + updates.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            existing.setProcessor(dbProcessor);
//        } else {
//            existing.setProcessor(null);
//        }
//
//        // NEW: Update Device Condition
//        if (updates.getDeviceCondition() != null && updates.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(updates.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + updates.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            existing.setDeviceCondition(dbCondition);
//        } else {
//            existing.setDeviceCondition(null);
//        }
//
//        // Update oneDayService field
//        if (updates.getOneDayService() != null) {
//            existing.setOneDayService(updates.getOneDayService());
//        }
//
//        // Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // Update used items
//        if (updates.getUsedItems() != null) {
//            existing.getUsedItems().clear();
//
//            for (UsedItem item : updates.getUsedItems()) {
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                UsedItem newUsedItem = new UsedItem();
//                newUsedItem.setInventoryItem(invItem);
//                newUsedItem.setQuantityUsed(item.getQuantityUsed());
//
//                if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
//                    newUsedItem.setUnitPrice(item.getUnitPrice());
//                } else {
//                    newUsedItem.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                existing.addUsedItem(newUsedItem);
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//
//                String priorityInfo = existing.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber() + priorityInfo,
//                        existing
//                );
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush();
//
//        return saved;
//    }
//
//    private void checkInventoryAndNotify(InventoryItem invItem) {
//    }
//
//    public List<JobCard> getAllJobCards() {
//        return List.of();
//    }
//
//    public JobCard getJobCardById(Long id) {
//        return null;
//    }
//
//    public Object cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId, String reason, Double fee) {
//        return null;
//    }
//
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return List.of();
//    }
//
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return List.of();
//    }
//
//    public List<JobCard> getPendingJobsOlderThanDays(int i) {
//        return List.of();
//    }
//
//    public Object addSerialToJobCard(Long id, JobCardSerial serial) {
//        return null;
//    }
//
//    public Object addFaultToJobCard(Long id, Long faultId) {
//        return null;
//    }
//
//    public Object removeFaultFromJobCard(Long id, Long faultId) {
//        return null;
//    }
//
//    public Object addServiceCategoryToJobCard(Long id, Long serviceCategoryId) {
//        return null;
//    }
//
//    public Object removeServiceCategoryFromJobCard(Long id, Long serviceCategoryId) {
//        return null;
//    }
//
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return null;
//    }
//}

//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    // NEW: Add the 4 new repositories
//    private final BrandRepository brandRepository;
//    private final ModelRepository modelRepository;
//    private final ProcessorRepository processorRepository;
//    private final DeviceConditionRepository deviceConditionRepository;
//
//    /**
//     * Create a new job card with brands, models, processors, device conditions, faults, service categories, serials, and used items
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // NEW: Load and validate Brand
//        if (jobCard.getBrand() != null && jobCard.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(jobCard.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + jobCard.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            jobCard.setBrand(dbBrand);
//        } else {
//            jobCard.setBrand(null);
//        }
//
//        // NEW: Load and validate Model
//        if (jobCard.getModel() != null && jobCard.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(jobCard.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + jobCard.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            jobCard.setModel(dbModel);
//        } else {
//            jobCard.setModel(null);
//        }
//
//        // NEW: Load and validate Processor
//        if (jobCard.getProcessor() != null && jobCard.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(jobCard.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + jobCard.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            jobCard.setProcessor(dbProcessor);
//        } else {
//            jobCard.setProcessor(null);
//        }
//
//        // NEW: Load and validate Device Condition
//        if (jobCard.getDeviceCondition() != null && jobCard.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(jobCard.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + jobCard.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            jobCard.setDeviceCondition(dbCondition);
//        } else {
//            jobCard.setDeviceCondition(null);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Ensure oneDayService is not null
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//
//        // Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // Get fault names
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        // Include One Day Service in notification if enabled
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Total Service Price: " + saved.getTotalServicePrice() +
//                        priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Update existing job card with brands, models, processors, device conditions, faults, service categories, serials, used items, and status
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//
//        // NEW: Update Brand
//        if (updates.getBrand() != null && updates.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(updates.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + updates.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            existing.setBrand(dbBrand);
//        } else {
//            existing.setBrand(null);
//        }
//
//        // NEW: Update Model
//        if (updates.getModel() != null && updates.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(updates.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + updates.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            existing.setModel(dbModel);
//        } else {
//            existing.setModel(null);
//        }
//
//        // NEW: Update Processor
//        if (updates.getProcessor() != null && updates.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(updates.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + updates.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            existing.setProcessor(dbProcessor);
//        } else {
//            existing.setProcessor(null);
//        }
//
//        // NEW: Update Device Condition
//        if (updates.getDeviceCondition() != null && updates.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(updates.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + updates.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            existing.setDeviceCondition(dbCondition);
//        } else {
//            existing.setDeviceCondition(null);
//        }
//
//        // Update oneDayService field
//        if (updates.getOneDayService() != null) {
//            existing.setOneDayService(updates.getOneDayService());
//        }
//
//        // Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // Update used items
//        if (updates.getUsedItems() != null) {
//            existing.getUsedItems().clear();
//
//            for (UsedItem item : updates.getUsedItems()) {
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                UsedItem newUsedItem = new UsedItem();
//                newUsedItem.setInventoryItem(invItem);
//                newUsedItem.setQuantityUsed(item.getQuantityUsed());
//
//                if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
//                    newUsedItem.setUnitPrice(item.getUnitPrice());
//                } else {
//                    newUsedItem.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                existing.addUsedItem(newUsedItem);
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//
//                String priorityInfo = existing.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber() + priorityInfo,
//                        existing
//                );
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush();
//
//        return saved;
//    } /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Update One Day Service status for a job card
//     */
//    @Transactional
//    public JobCard updateOneDayService(Long jobCardId, Boolean oneDayService) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.setOneDayService(oneDayService != null ? oneDayService : false);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String priorityStatus = oneDayService ? "enabled" : "disabled";
//        notificationService.sendNotification(
//                NotificationType.JOB_UPDATED,
//                "One Day Service " + priorityStatus + " for job: " + saved.getJobNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Get job cards with One Day Service enabled
//     */
//    public List<JobCard> getOneDayServiceJobCards() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .toList();
//    }
//
//    /**
//     * Get pending One Day Service job cards (urgent attention needed)
//     */
//    public List<JobCard> getPendingOneDayServiceJobCards() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .filter(job -> job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.IN_PROGRESS)
//                .toList();
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Get all job cards
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Search job cards by customer name, phone, or job number
//     */
//    public List<JobCard> searchJobCards(String searchTerm) {
//        return jobCardRepository.searchJobCards(searchTerm);
//    }
//
//    /**
//     * Get job cards created within a date range
//     */
//    public List<JobCard> getJobCardsByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.findByCreatedAtBetween(start, end);
//    }
//
//    /**
//     * Get job cards by customer phone
//     */
//    public List<JobCard> getJobCardsByCustomerPhone(String phone) {
//        return jobCardRepository.findByCustomerPhone(phone);
//    }
//
//    /**
//     * Get job cards by device type
//     */
//    public List<JobCard> getJobCardsByDeviceType(String deviceType) {
//        return jobCardRepository.findByDeviceType(deviceType);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//
//    /**
//     * Get count of job cards by status
//     */
//    public Long getJobCardCountByStatus(JobStatus status) {
//        return jobCardRepository.countByStatus(status);
//    }
//
//    /**
//     * Get count of job cards created in date range
//     */
//    public Long getJobCardCountByDateRange(LocalDateTime start, LocalDateTime end) {
//        return jobCardRepository.countJobsByDateRange(start, end);
//    }
//
//    /**
//     * Get count of One Day Service job cards
//     */
//    public Long getOneDayServiceJobCardCount() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .count();
//    }
//
//    /**
//     * Get count of pending One Day Service job cards
//     */
//    public Long getPendingOneDayServiceJobCardCount() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        return allJobCards.stream()
//                .filter(job -> Boolean.TRUE.equals(job.getOneDayService()))
//                .filter(job -> job.getStatus() == JobStatus.PENDING || job.getStatus() == JobStatus.IN_PROGRESS)
//                .count();
//    }
//}


//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//    private final BrandRepository brandRepository;
//    private final ModelRepository modelRepository;
//    private final ProcessorRepository processorRepository;
//    private final DeviceConditionRepository deviceConditionRepository;
//
//    /**
//     * Create a new job card
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // Validate at least one fault is provided
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults from database - only active ones
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found or inactive"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories are provided and are active
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        // Load and validate service categories from database - only active ones
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//
//            validServices.add(dbService);
//        }
//
//        // Load and validate Brand
//        if (jobCard.getBrand() != null && jobCard.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(jobCard.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + jobCard.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            jobCard.setBrand(dbBrand);
//        } else {
//            jobCard.setBrand(null);
//        }
//
//        // Load and validate Model
//        if (jobCard.getModel() != null && jobCard.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(jobCard.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + jobCard.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            jobCard.setModel(dbModel);
//        } else {
//            jobCard.setModel(null);
//        }
//
//        // Load and validate Processor
//        if (jobCard.getProcessor() != null && jobCard.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(jobCard.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + jobCard.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            jobCard.setProcessor(dbProcessor);
//        } else {
//            jobCard.setProcessor(null);
//        }
//
//        // Load and validate Device Condition
//        if (jobCard.getDeviceCondition() != null && jobCard.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(jobCard.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + jobCard.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            jobCard.setDeviceCondition(dbCondition);
//        } else {
//            jobCard.setDeviceCondition(null);
//        }
//
//        // Set fault and service references
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Ensure oneDayService is not null
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//
//        // Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Set bidirectional relationships for serials
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Set bidirectional relationships for used items and ensure prices are set
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // If unit price not provided, get from inventory
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                checkInventoryAndNotify(item.getInventoryItem());
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // Get fault names
//        String faultNames = saved.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = saved.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        // Include One Day Service in notification if enabled
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + saved.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Total Service Price: " + saved.getTotalServicePrice() +
//                        priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Update existing job card
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCard updates) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Update basic customer information
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDeviceType(updates.getDeviceType());
//
//        // Update Brand
//        if (updates.getBrand() != null && updates.getBrand().getId() != null) {
//            Brand dbBrand = brandRepository.findById(updates.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + updates.getBrand().getId()));
//
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//
//            existing.setBrand(dbBrand);
//        } else {
//            existing.setBrand(null);
//        }
//
//        // Update Model
//        if (updates.getModel() != null && updates.getModel().getId() != null) {
//            Model dbModel = modelRepository.findById(updates.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + updates.getModel().getId()));
//
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//
//            existing.setModel(dbModel);
//        } else {
//            existing.setModel(null);
//        }
//
//        // Update Processor
//        if (updates.getProcessor() != null && updates.getProcessor().getId() != null) {
//            Processor dbProcessor = processorRepository.findById(updates.getProcessor().getId())
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + updates.getProcessor().getId()));
//
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//
//            existing.setProcessor(dbProcessor);
//        } else {
//            existing.setProcessor(null);
//        }
//
//        // Update Device Condition
//        if (updates.getDeviceCondition() != null && updates.getDeviceCondition().getId() != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(updates.getDeviceCondition().getId())
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + updates.getDeviceCondition().getId()));
//
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//
//            existing.setDeviceCondition(dbCondition);
//        } else {
//            existing.setDeviceCondition(null);
//        }
//
//        // Update oneDayService field
//        if (updates.getOneDayService() != null) {
//            existing.setOneDayService(updates.getOneDayService());
//        }
//
//        // Update faults if provided
//        if (updates.getFaults() != null && !updates.getFaults().isEmpty()) {
//            existing.clearFaults();
//
//            for (Fault fault : updates.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found: " + fault.getId()));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//
//                existing.addFault(dbFault);
//            }
//        }
//
//        // Update service categories if provided
//        if (updates.getServiceCategories() != null && !updates.getServiceCategories().isEmpty()) {
//            existing.clearServiceCategories();
//
//            for (ServiceCategory service : updates.getServiceCategories()) {
//                if (service.getId() == null) {
//                    throw new RuntimeException("Invalid service category");
//                }
//
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//                if (!dbService.getIsActive()) {
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                }
//
//                existing.addServiceCategory(dbService);
//            }
//
//            // Recalculate total service price
//            existing.calculateTotalServicePrice();
//        }
//
//        existing.setFaultDescription(updates.getFaultDescription());
//        existing.setNotes(updates.getNotes());
//        existing.setEstimatedCost(updates.getEstimatedCost());
//        existing.setAdvancePayment(updates.getAdvancePayment());
//
//        // Update serials if provided
//        if (updates.getSerials() != null) {
//            existing.getSerials().clear();
//            for (JobCardSerial serial : updates.getSerials()) {
//                existing.addSerial(serial);
//            }
//        }
//
//        // Update used items
//        if (updates.getUsedItems() != null) {
//            existing.getUsedItems().clear();
//
//            for (UsedItem item : updates.getUsedItems()) {
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                UsedItem newUsedItem = new UsedItem();
//                newUsedItem.setInventoryItem(invItem);
//                newUsedItem.setQuantityUsed(item.getQuantityUsed());
//
//                if (item.getUnitPrice() != null && item.getUnitPrice() > 0) {
//                    newUsedItem.setUnitPrice(item.getUnitPrice());
//                } else {
//                    newUsedItem.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                existing.addUsedItem(newUsedItem);
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Update status
//        if (updates.getStatus() != null) {
//            JobStatus oldStatus = existing.getStatus();
//            existing.setStatus(updates.getStatus());
//
//            // Handle completion
//            if (updates.getStatus() == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                existing.setCompletedAt(LocalDateTime.now());
//
//                String priorityInfo = existing.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + existing.getJobNumber() + priorityInfo,
//                        existing
//                );
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush();
//
//        return saved;
//    }
//
//    /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Get all job cards
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//}


////package com.example.demo.services;
////
////import com.example.demo.dto.JobCardUpdateRequest;
////import com.example.demo.entity.*;
////import com.example.demo.repositories.*;
////import lombok.RequiredArgsConstructor;
////import org.springframework.stereotype.Service;
////import org.springframework.transaction.annotation.Transactional;
////
////import java.time.LocalDateTime;
////import java.util.ArrayList;
////import java.util.List;
////
////@Service
////@RequiredArgsConstructor
////public class JobCardService {
////    private final JobCardRepository jobCardRepository;
////    private final FaultRepository faultRepository;
////    private final InventoryItemRepository inventoryItemRepository;
////    private final ServiceCategoryRepository serviceCategoryRepository;
////    private final NotificationService notificationService;
////    private final BrandRepository brandRepository;
////    private final ModelRepository modelRepository;
////    private final ProcessorRepository processorRepository;
////    private final DeviceConditionRepository deviceConditionRepository;
////    private final InventoryService inventoryService;
////
////    /**
////     * Create a new job card
////     */
////    @Transactional
////    public JobCard createJobCard(JobCard jobCard) {
////        // Validate at least one fault is selected
////        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
////            throw new RuntimeException("At least one fault must be selected");
////        }
////
////        // Load and validate faults
////        List<Fault> validFaults = new ArrayList<>();
////        for (Fault fault : jobCard.getFaults()) {
////            if (fault.getId() == null) {
////                throw new RuntimeException("Invalid fault");
////            }
////
////            Fault dbFault = faultRepository.findById(fault.getId())
////                    .orElseThrow(() -> new RuntimeException("Fault not found"));
////
////            if (!dbFault.getIsActive()) {
////                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
////            }
////            validFaults.add(dbFault);
////        }
////
////        // Validate service categories
////        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
////            throw new RuntimeException("At least one service category must be selected");
////        }
////
////        List<ServiceCategory> validServices = new ArrayList<>();
////        for (ServiceCategory service : jobCard.getServiceCategories()) {
////            if (service.getId() == null) {
////                throw new RuntimeException("Invalid service category");
////            }
////
////            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
////                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
////
////            if (!dbService.getIsActive()) {
////                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
////            }
////            validServices.add(dbService);
////        }
////
////        // Load and validate related entities
////        jobCard.setBrand(loadBrand(jobCard.getBrand()));
////        jobCard.setModel(loadModel(jobCard.getModel()));
////        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));
////        jobCard.setDeviceCondition(loadDeviceCondition(jobCard.getDeviceCondition()));
////
////        // Set validated collections
////        jobCard.setFaults(validFaults);
////        jobCard.setServiceCategories(validServices);
////        jobCard.setJobNumber(generateJobNumber());
////        jobCard.setStatus(JobStatus.PENDING);
////
////        // Set defaults
////        if (jobCard.getOneDayService() == null) {
////            jobCard.setOneDayService(false);
////        }
////
////        // Calculate total service price
////        jobCard.calculateTotalServicePrice();
////
////        // Handle serials
////        if (jobCard.getSerials() != null) {
////            for (JobCardSerial serial : jobCard.getSerials()) {
////                serial.setJobCard(jobCard);
////            }
////        }
////
////        // Handle used items - DON'T deduct stock yet, wait for invoice payment
////        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
////            for (UsedItem item : jobCard.getUsedItems()) {
////                item.setJobCard(jobCard);
////
////                // Validate inventory item exists
////                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
////                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
////
////                // Set unit price if not provided
////                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
////                    item.setUnitPrice(invItem.getSellingPrice());
////                }
////
////                // Set default warranty if not provided
////                if (item.getWarrantyPeriod() == null) {
////                    item.setWarrantyPeriod("No Warranty");
////                }
////
////                // Validate serial numbers for serialized items (but don't mark as SOLD yet)
////                if (invItem.getHasSerialization()) {
////                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty()) {
////                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
////                    }
////                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed()) {
////                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
////                    }
////
////                    // Validate serials are available (but don't mark as SOLD)
////                    for (String serialNumber : item.getUsedSerialNumbers()) {
////                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
////                        if (serial == null) {
////                            throw new RuntimeException("Serial number not found: " + serialNumber);
////                        }
////                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
////                            throw new RuntimeException("Serial number not available: " + serialNumber);
////                        }
////                        // NOTE: Serial remains AVAILABLE until invoice is paid
////                    }
////                } else {
////                    // For non-serialized items, check stock availability
////                    if (invItem.getQuantity() < item.getQuantityUsed()) {
////                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
////                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
////                    }
////                    // NOTE: Stock remains undeducted until invoice is paid
////                }
////
////                checkInventoryAndNotify(invItem);
////            }
////        }
////
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        // Send notification
////        sendJobCreatedNotification(saved);
////
////        return saved;
////    }
////
////    /**
////     * Update job card using DTO to avoid detached entity issues
////     */
////    @Transactional
////    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
////        JobCard existing = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        // Store old status for completion check
////        JobStatus oldStatus = existing.getStatus();
////
////        // Update basic fields
////        existing.setCustomerName(updateRequest.getCustomerName());
////        existing.setCustomerPhone(updateRequest.getCustomerPhone());
////        existing.setCustomerEmail(updateRequest.getCustomerEmail());
////        existing.setDeviceType(updateRequest.getDeviceType());
////        existing.setFaultDescription(updateRequest.getFaultDescription());
////        existing.setNotes(updateRequest.getNotes());
////        existing.setEstimatedCost(updateRequest.getEstimatedCost());
////        existing.setAdvancePayment(updateRequest.getAdvancePayment());
////
////        // Update related entities
////        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
////        existing.setModel(loadModelById(updateRequest.getModelId()));
////        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));
////        existing.setDeviceCondition(loadDeviceConditionById(updateRequest.getDeviceConditionId()));
////
////        // Update oneDayService
////        if (updateRequest.getOneDayService() != null) {
////            existing.setOneDayService(updateRequest.getOneDayService());
////        }
////
////        // Update faults
////        if (updateRequest.getFaultIds() != null) {
////            updateFaultsFromIds(existing, updateRequest.getFaultIds());
////        }
////
////        // Update service categories
////        if (updateRequest.getServiceCategoryIds() != null) {
////            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
////        }
////
////        // Update used items
////        if (updateRequest.getUsedItems() != null) {
////            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems());
////        }
////
////        // Handle status change (REMOVED: serial marking on completion)
////        handleStatusChange(existing, updateRequest.getStatus(), oldStatus);
////
////        JobCard saved = jobCardRepository.save(existing);
////        jobCardRepository.flush();
////
////        return saved;
////    }
////
////    /**
////     * Update used items from DTO request - ADD WARRANTY SUPPORT
////     */
////    private void updateUsedItemsFromRequest(JobCard existing, List<JobCardUpdateRequest.UsedItemRequest> usedItems) {
////        existing.getUsedItems().clear();
////
////        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
////            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
////                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));
////
////            UsedItem newUsedItem = new UsedItem();
////            newUsedItem.setInventoryItem(invItem);
////            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
////
////            // SET WARRANTY PERIOD
////            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
////
////            // Set unit price
////            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
////                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
////            } else {
////                newUsedItem.setUnitPrice(invItem.getSellingPrice());
////            }
////
////            // Handle serial numbers (validate but don't mark as SOLD)
////            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
////                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));
////
////                // Validate serial numbers for serialized items
////                if (invItem.getHasSerialization()) {
////                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed()) {
////                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
////                    }
////
////                    // Validate serials are available (but don't mark as SOLD)
////                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
////                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
////                        if (serial == null) {
////                            throw new RuntimeException("Serial number not found: " + serialNumber);
////                        }
////                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
////                            throw new RuntimeException("Serial number not available: " + serialNumber);
////                        }
////                        // NOTE: Serial remains AVAILABLE until invoice is paid
////                    }
////                }
////            } else if (invItem.getHasSerialization()) {
////                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
////            } else {
////                // For non-serialized items, check stock
////                if (invItem.getQuantity() < itemRequest.getQuantityUsed()) {
////                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
////                }
////                // NOTE: Stock remains undeducted until invoice is paid
////            }
////
////            existing.addUsedItem(newUsedItem);
////            checkInventoryAndNotify(invItem);
////        }
////    }
////
////    /**
////     * Handle status change - REMOVED serial marking on completion
////     */
////    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
////        if (newStatus != null) {
////            jobCard.setStatus(newStatus);
////
////            // Handle completion - BUT DON'T mark serials as SOLD anymore
////            if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
////                jobCard.setCompletedAt(LocalDateTime.now());
////
////                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
////                notificationService.sendNotification(
////                        NotificationType.JOB_COMPLETED,
////                        "Job completed: " + jobCard.getJobNumber() + priorityInfo +
////                                " (Serials will be marked as SOLD when invoice is paid)",
////                        jobCard
////                );
////            }
////
////            // Handle status change notifications for new statuses
////            if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL)
////                    && oldStatus != newStatus) {
////                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////                notificationService.sendNotification(
////                        NotificationType.JOB_STATUS_CHANGED,
////                        "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
////                        jobCard
////                );
////            }
////        }
////    }
////
////    /**
////     * Mark job card as waiting for parts
////     */
////    @Transactional
////    public JobCard markWaitingForParts(Long id) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        if (jobCard.getStatus() == JobStatus.CANCELLED) {
////            throw new RuntimeException("Cannot update cancelled job card");
////        }
////
////        if (jobCard.getStatus() == JobStatus.WAITING_FOR_PARTS) {
////            throw new RuntimeException("Job card is already waiting for parts");
////        }
////
////        jobCard.markWaitingForParts();
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////        notificationService.sendNotification(
////                NotificationType.JOB_STATUS_CHANGED,
////                "Job card " + saved.getJobNumber() + " is waiting for parts" + priorityInfo,
////                saved
////        );
////
////        return saved;
////    }
////
////    /**
////     * Mark job card as waiting for approval
////     */
////    @Transactional
////    public JobCard markWaitingForApproval(Long id) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        if (jobCard.getStatus() == JobStatus.CANCELLED) {
////            throw new RuntimeException("Cannot update cancelled job card");
////        }
////
////        if (jobCard.getStatus() == JobStatus.WAITING_FOR_APPROVAL) {
////            throw new RuntimeException("Job card is already waiting for approval");
////        }
////
////        jobCard.markWaitingForApproval();
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////        notificationService.sendNotification(
////                NotificationType.JOB_STATUS_CHANGED,
////                "Job card " + saved.getJobNumber() + " is waiting for approval" + priorityInfo,
////                saved
////        );
////
////        return saved;
////    }
////
////    /**
////     * Mark job card as in progress
////     */
////    @Transactional
////    public JobCard markInProgress(Long id) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        if (jobCard.getStatus() == JobStatus.CANCELLED) {
////            throw new RuntimeException("Cannot update cancelled job card");
////        }
////
////        if (jobCard.getStatus() == JobStatus.IN_PROGRESS) {
////            throw new RuntimeException("Job card is already in progress");
////        }
////
////        jobCard.markInProgress();
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////        notificationService.sendNotification(
////                NotificationType.JOB_STATUS_CHANGED,
////                "Job card " + saved.getJobNumber() + " is back in progress" + priorityInfo,
////                saved
////        );
////
////        return saved;
////    }
////
////    /**
////     * Mark job card as pending
////     */
////    @Transactional
////    public JobCard markPending(Long id) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        if (jobCard.getStatus() == JobStatus.CANCELLED) {
////            throw new RuntimeException("Cannot update cancelled job card");
////        }
////
////        if (jobCard.getStatus() == JobStatus.PENDING) {
////            throw new RuntimeException("Job card is already pending");
////        }
////
////        jobCard.setStatus(JobStatus.PENDING);
////        jobCard.setUpdatedAt(LocalDateTime.now());
////
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////        notificationService.sendNotification(
////                NotificationType.JOB_STATUS_CHANGED,
////                "Job card " + saved.getJobNumber() + " marked as pending" + priorityInfo,
////                saved
////        );
////
////        return saved;
////    }
////
////    // Helper methods for loading related entities by ID
////    private Brand loadBrandById(Long brandId) {
////        if (brandId != null) {
////            Brand dbBrand = brandRepository.findById(brandId)
////                    .orElseThrow(() -> new RuntimeException("Brand not found: " + brandId));
////            if (!dbBrand.getIsActive()) {
////                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
////            }
////            return dbBrand;
////        }
////        return null;
////    }
////
////    private Model loadModelById(Long modelId) {
////        if (modelId != null) {
////            Model dbModel = modelRepository.findById(modelId)
////                    .orElseThrow(() -> new RuntimeException("Model not found: " + modelId));
////            if (!dbModel.getIsActive()) {
////                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
////            }
////            return dbModel;
////        }
////        return null;
////    }
////
////    private Processor loadProcessorById(Long processorId) {
////        if (processorId != null) {
////            Processor dbProcessor = processorRepository.findById(processorId)
////                    .orElseThrow(() -> new RuntimeException("Processor not found: " + processorId));
////            if (!dbProcessor.getIsActive()) {
////                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
////            }
////            return dbProcessor;
////        }
////        return null;
////    }
////
////    private DeviceCondition loadDeviceConditionById(Long deviceConditionId) {
////        if (deviceConditionId != null) {
////            DeviceCondition dbCondition = deviceConditionRepository.findById(deviceConditionId)
////                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + deviceConditionId));
////            if (!dbCondition.getIsActive()) {
////                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
////            }
////            return dbCondition;
////        }
////        return null;
////    }
////
////    // Original helper methods for entity loading
////    private Brand loadBrand(Brand brand) {
////        if (brand != null && brand.getId() != null) {
////            return loadBrandById(brand.getId());
////        }
////        return null;
////    }
////
////    private Model loadModel(Model model) {
////        if (model != null && model.getId() != null) {
////            return loadModelById(model.getId());
////        }
////        return null;
////    }
////
////    private Processor loadProcessor(Processor processor) {
////        if (processor != null && processor.getId() != null) {
////            return loadProcessorById(processor.getId());
////        }
////        return null;
////    }
////
////    private DeviceCondition loadDeviceCondition(DeviceCondition condition) {
////        if (condition != null && condition.getId() != null) {
////            return loadDeviceConditionById(condition.getId());
////        }
////        return null;
////    }
////
////    private void updateFaultsFromIds(JobCard existing, List<Long> faultIds) {
////        existing.clearFaults();
////        for (Long faultId : faultIds) {
////            Fault dbFault = faultRepository.findById(faultId)
////                    .orElseThrow(() -> new RuntimeException("Fault not found: " + faultId));
////            if (!dbFault.getIsActive()) {
////                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
////            }
////            existing.addFault(dbFault);
////        }
////    }
////
////    private void updateServiceCategoriesFromIds(JobCard existing, List<Long> serviceCategoryIds) {
////        existing.clearServiceCategories();
////        for (Long serviceCategoryId : serviceCategoryIds) {
////            ServiceCategory dbService = serviceCategoryRepository.findById(serviceCategoryId)
////                    .orElseThrow(() -> new RuntimeException("Service category not found: " + serviceCategoryId));
////            if (!dbService.getIsActive()) {
////                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
////            }
////            existing.addServiceCategory(dbService);
////        }
////        existing.calculateTotalServicePrice();
////    }
////
////    /**
////     * Cancel a job card with reason, fee, and who cancelled it
////     */
////    @Transactional
////    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
////                                 String reason, Double fee) {
////        JobCard jobCard = jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        if (jobCard.getStatus() == JobStatus.CANCELLED) {
////            throw new RuntimeException("Job card is already cancelled");
////        }
////
////        jobCard.setStatus(JobStatus.CANCELLED);
////        jobCard.setCancelledBy(cancelledBy);
////        jobCard.setCancelledByUserId(cancelledByUserId);
////        jobCard.setCancellationReason(reason);
////        jobCard.setCancellationFee(fee);
////
////        JobCard saved = jobCardRepository.save(jobCard);
////
////        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
////        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
////
////        notificationService.sendNotification(
////                NotificationType.JOB_CANCELLED,
////                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
////                saved
////        );
////
////        return saved;
////    }
////
////    /**
////     * Add a serial to an existing job card
////     */
////    @Transactional
////    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
////        JobCard jobCard = jobCardRepository.findById(jobCardId)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        jobCard.addSerial(serial);
////        return jobCardRepository.save(jobCard);
////    }
////
////    /**
////     * Add fault to an existing job card
////     */
////    @Transactional
////    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
////        JobCard jobCard = jobCardRepository.findById(jobCardId)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        Fault fault = faultRepository.findById(faultId)
////                .orElseThrow(() -> new RuntimeException("Fault not found"));
////
////        if (!fault.getIsActive()) {
////            throw new RuntimeException("Fault is inactive");
////        }
////
////        jobCard.addFault(fault);
////        return jobCardRepository.save(jobCard);
////    }
////
////    /**
////     * Remove fault from an existing job card
////     */
////    @Transactional
////    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
////        JobCard jobCard = jobCardRepository.findById(jobCardId)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        Fault fault = faultRepository.findById(faultId)
////                .orElseThrow(() -> new RuntimeException("Fault not found"));
////
////        jobCard.removeFault(fault);
////        return jobCardRepository.save(jobCard);
////    }
////
////    /**
////     * Add service category to an existing job card
////     */
////    @Transactional
////    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
////        JobCard jobCard = jobCardRepository.findById(jobCardId)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
////                .orElseThrow(() -> new RuntimeException("Service category not found"));
////
////        if (!service.getIsActive()) {
////            throw new RuntimeException("Service category is inactive");
////        }
////
////        jobCard.addServiceCategory(service);
////        jobCard.calculateTotalServicePrice();
////        return jobCardRepository.save(jobCard);
////    }
////
////    /**
////     * Remove service category from an existing job card
////     */
////    @Transactional
////    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
////        JobCard jobCard = jobCardRepository.findById(jobCardId)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////
////        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
////                .orElseThrow(() -> new RuntimeException("Service category not found"));
////
////        jobCard.removeServiceCategory(service);
////        jobCard.calculateTotalServicePrice();
////        return jobCardRepository.save(jobCard);
////    }
////
////    /**
////     * Check inventory level and send notification if low stock
////     */
////    private void checkInventoryAndNotify(InventoryItem item) {
////        if (item.getQuantity() <= item.getMinThreshold()) {
////            notificationService.sendNotification(
////                    NotificationType.LOW_STOCK,
////                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
////                    item
////            );
////        }
////    }
////
////    /**
////     * Send job created notification
////     */
////    private void sendJobCreatedNotification(JobCard jobCard) {
////        String faultNames = jobCard.getFaults().stream()
////                .map(Fault::getFaultName)
////                .reduce((a, b) -> a + ", " + b)
////                .orElse("No faults");
////
////        String serviceNames = jobCard.getServiceCategories().stream()
////                .map(ServiceCategory::getName)
////                .reduce((a, b) -> a + ", " + b)
////                .orElse("No services");
////
////        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
////
////        notificationService.sendNotification(
////                NotificationType.PENDING_JOB,
////                "New job card created: " + jobCard.getJobNumber() +
////                        " - Faults: " + faultNames +
////                        " - Services: " + serviceNames +
////                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
////                        priorityInfo,
////                jobCard
////        );
////    }
////
////    /**
////     * Get all job cards
////     */
////    public List<JobCard> getAllJobCards() {
////        return jobCardRepository.findAll();
////    }
////
////    /**
////     * Get job card by ID
////     */
////    public JobCard getJobCardById(Long id) {
////        return jobCardRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Job card not found"));
////    }
////
////    /**
////     * Get job card by job number
////     */
////    public JobCard getJobCardByNumber(String jobNumber) {
////        return jobCardRepository.findByJobNumber(jobNumber)
////                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
////    }
////
////    /**
////     * Get job cards filtered by status
////     */
////    public List<JobCard> getJobCardsByStatus(JobStatus status) {
////        return jobCardRepository.findByStatus(status);
////    }
////
////    /**
////     * Get job cards by service category
////     */
////    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
////        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
////    }
////
////    /**
////     * Get pending job cards older than specified days (for alerts)
////     */
////    public List<JobCard> getPendingJobsOlderThanDays(int days) {
////        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
////        return jobCardRepository.findPendingJobsOlderThan(threshold);
////    }
////
////    /**
////     * Get job cards waiting for parts
////     */
////    public List<JobCard> getJobsWaitingForParts() {
////        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
////    }
////
////    /**
////     * Get job cards waiting for approval
////     */
////    public List<JobCard> getJobsWaitingForApproval() {
////        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
////    }
////
////    /**
////     * Generate unique job number
////     */
////    private String generateJobNumber() {
////        return "JOB-" + System.currentTimeMillis();
////    }
////
////    /**
////     * Get job card statistics
////     */
////    public JobCardStatistics getJobCardStatistics() {
////        Long total = jobCardRepository.count();
////        Long pending = jobCardRepository.countByStatus(JobStatus.PENDING);
////        Long inProgress = jobCardRepository.countByStatus(JobStatus.IN_PROGRESS);
////        Long waitingForParts = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_PARTS);
////        Long waitingForApproval = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_APPROVAL);
////        Long completed = jobCardRepository.countByStatus(JobStatus.COMPLETED);
////        Long delivered = jobCardRepository.countByStatus(JobStatus.DELIVERED);
////        Long cancelled = jobCardRepository.countByStatus(JobStatus.CANCELLED);
////
////        return new JobCardStatistics(total, pending, inProgress, waitingForParts,
////                waitingForApproval, completed, delivered, cancelled);
////    }
////
////    /**
////     * Statistics DTO
////     */
////    public static class JobCardStatistics {
////        public final Long total;
////        public final Long pending;
////        public final Long inProgress;
////        public final Long waitingForParts;
////        public final Long waitingForApproval;
////        public final Long completed;
////        public final Long delivered;
////        public final Long cancelled;
////
////        public JobCardStatistics(Long total, Long pending, Long inProgress,
////                                 Long waitingForParts, Long waitingForApproval,
////                                 Long completed, Long delivered, Long cancelled) {
////            this.total = total;
////            this.pending = pending;
////            this.inProgress = inProgress;
////            this.waitingForParts = waitingForParts;
////            this.waitingForApproval = waitingForApproval;
////            this.completed = completed;
////            this.delivered = delivered;
////            this.cancelled = cancelled;
////        }
////    }
////}
//
//package com.example.demo.services;
//
//import com.example.demo.dto.JobCardUpdateRequest;
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final JobCardRepository jobCardRepository;
//    private final FaultRepository faultRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//    private final BrandRepository brandRepository;
//    private final ModelRepository modelRepository;
//    private final ProcessorRepository processorRepository;
//    private final DeviceConditionRepository deviceConditionRepository;
//    private final InventoryService inventoryService;
//    private final InventorySerialRepository inventorySerialRepository;
//
//    /**
//     * Cancel a job card with reason, fee, and who cancelled it
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        // Handle used items - return them to inventory
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                // Skip if already returned
//                if (Boolean.TRUE.equals(usedItem.getIsReturned())) {
//                    continue;
//                }
//
//                InventoryItem inventoryItem = usedItem.getInventoryItem();
//
//                if (inventoryItem.getHasSerialization()) {
//                    // For serialized items, mark serials as AVAILABLE again
//                    if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
//                        for (String serialNumber : usedItem.getUsedSerialNumbers()) {
//                            try {
//                                InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
//                                if (serial != null) {
//                                    // Only update if serial is currently SOLD
//                                    if (serial.getStatus() == SerialStatus.SOLD) {
//                                        serial.setStatus(SerialStatus.AVAILABLE);
//                                        serial.setUsedAt(null);
//                                        serial.setUsedBy(null);
//                                        serial.setUsedInReferenceId(null);
//                                        serial.setUsedInReferenceNumber(null);
//                                        serial.setUsedInReferenceType(null);
//                                        serial.setNotes("Returned to inventory due to job cancellation - " + jobCard.getJobNumber());
//                                        // Save the serial status change
//                                        inventorySerialRepository.save(serial);
//                                        System.out.println("Returned serial to inventory: " + serialNumber);
//                                    }
//                                }
//                            } catch (Exception e) {
//                                // Log the error but don't stop the cancellation
//                                System.err.println("Failed to return serial to inventory: " + serialNumber + " - " + e.getMessage());
//                                // Continue with cancellation despite serial issues
//                            }
//                        }
//                    }
//                } else {
//                    // For non-serialized items, return quantity to stock
//                    int returnedQuantity = usedItem.getQuantityUsed() != null ? usedItem.getQuantityUsed() : 0;
//                    if (returnedQuantity > 0) {
//                        int currentQuantity = inventoryItem.getQuantity() != null ? inventoryItem.getQuantity() : 0;
//                        inventoryItem.setQuantity(currentQuantity + returnedQuantity);
//                        inventoryItemRepository.save(inventoryItem);
//                        System.out.println("Returned " + returnedQuantity + " items to inventory: " + inventoryItem.getName());
//                    }
//                }
//
//                // Mark the used item as returned
//                usedItem.setIsReturned(true);
//                System.out.println("Marked used item as returned: " + inventoryItem.getName());
//            }
//        }
//
//        // Update job card status and cancellation details
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee != null ? fee : 0.0);
//        jobCard.setUpdatedAt(LocalDateTime.now());
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//        String feeInfo = (fee != null && fee > 0) ? " (Fee: Rs." + fee + ")" : "";
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + feeInfo + priorityInfo,
//                saved
//        );
//
//        System.out.println("Job card cancelled successfully: " + saved.getJobNumber());
//        return saved;
//    }
//
//    /**
//     * Create a new job card
//     */
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // Validate at least one fault is selected
//        if (jobCard.getFaults() == null || jobCard.getFaults().isEmpty()) {
//            throw new RuntimeException("At least one fault must be selected");
//        }
//
//        // Load and validate faults
//        List<Fault> validFaults = new ArrayList<>();
//        for (Fault fault : jobCard.getFaults()) {
//            if (fault.getId() == null) {
//                throw new RuntimeException("Invalid fault");
//            }
//
//            Fault dbFault = faultRepository.findById(fault.getId())
//                    .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//            validFaults.add(dbFault);
//        }
//
//        // Validate service categories
//        if (jobCard.getServiceCategories() == null || jobCard.getServiceCategories().isEmpty()) {
//            throw new RuntimeException("At least one service category must be selected");
//        }
//
//        List<ServiceCategory> validServices = new ArrayList<>();
//        for (ServiceCategory service : jobCard.getServiceCategories()) {
//            if (service.getId() == null) {
//                throw new RuntimeException("Invalid service category");
//            }
//
//            ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//            validServices.add(dbService);
//        }
//
//        // Load and validate related entities
//        jobCard.setBrand(loadBrand(jobCard.getBrand()));
//        jobCard.setModel(loadModel(jobCard.getModel()));
//        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));
//        jobCard.setDeviceCondition(loadDeviceCondition(jobCard.getDeviceCondition()));
//
//        // Set validated collections
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Set defaults
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//
//        // Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Handle serials
//        if (jobCard.getSerials() != null) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Handle used items - DON'T deduct stock yet, wait for invoice payment
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//
//                // Validate inventory item exists
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                // Set unit price if not provided
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    item.setUnitPrice(invItem.getSellingPrice());
//                }
//
//                // Set default warranty if not provided
//                if (item.getWarrantyPeriod() == null) {
//                    item.setWarrantyPeriod("No Warranty");
//                }
//
//                // Set isReturned to false for new items
//                item.setIsReturned(false);
//
//                // Validate serial numbers for serialized items (but don't mark as SOLD yet)
//                if (invItem.getHasSerialization()) {
//                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty()) {
//                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//                    }
//                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    }
//
//                    // Validate serials are available (but don't mark as SOLD)
//                    for (String serialNumber : item.getUsedSerialNumbers()) {
//                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
//                        if (serial == null) {
//                            throw new RuntimeException("Serial number not found: " + serialNumber);
//                        }
//                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        }
//                        // NOTE: Serial remains AVAILABLE until invoice is paid
//                    }
//                } else {
//                    // For non-serialized items, check stock availability
//                    if (invItem.getQuantity() < item.getQuantityUsed()) {
//                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
//                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
//                    }
//                    // NOTE: Stock remains undeducted until invoice is paid
//                }
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // Send notification
//        sendJobCreatedNotification(saved);
//
//        return saved;
//    }
//
//    /**
//     * Update job card using DTO to avoid detached entity issues
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Store old status for completion check
//        JobStatus oldStatus = existing.getStatus();
//
//        // Update basic fields
//        existing.setCustomerName(updateRequest.getCustomerName());
//        existing.setCustomerPhone(updateRequest.getCustomerPhone());
//        existing.setCustomerEmail(updateRequest.getCustomerEmail());
//        existing.setDeviceType(updateRequest.getDeviceType());
//        existing.setFaultDescription(updateRequest.getFaultDescription());
//        existing.setNotes(updateRequest.getNotes());
//        existing.setEstimatedCost(updateRequest.getEstimatedCost());
//        existing.setAdvancePayment(updateRequest.getAdvancePayment());
//
//        // Update related entities
//        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
//        existing.setModel(loadModelById(updateRequest.getModelId()));
//        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));
//        existing.setDeviceCondition(loadDeviceConditionById(updateRequest.getDeviceConditionId()));
//
//        // Update oneDayService
//        if (updateRequest.getOneDayService() != null) {
//            existing.setOneDayService(updateRequest.getOneDayService());
//        }
//
//        // Update faults
//        if (updateRequest.getFaultIds() != null) {
//            updateFaultsFromIds(existing, updateRequest.getFaultIds());
//        }
//
//        // Update service categories
//        if (updateRequest.getServiceCategoryIds() != null) {
//            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
//        }
//
//        // Update used items
//        if (updateRequest.getUsedItems() != null) {
//            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems());
//        }
//
//        // Handle status change (REMOVED: serial marking on completion)
//        handleStatusChange(existing, updateRequest.getStatus(), oldStatus);
//
//        JobCard saved = jobCardRepository.save(existing);
//        jobCardRepository.flush();
//
//        return saved;
//    }
//
//    /**
//     * Update used items from DTO request - ADD WARRANTY SUPPORT
//     */
//    private void updateUsedItemsFromRequest(JobCard existing, List<JobCardUpdateRequest.UsedItemRequest> usedItems) {
//        existing.getUsedItems().clear();
//
//        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
//            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
//                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));
//
//            UsedItem newUsedItem = new UsedItem();
//            newUsedItem.setInventoryItem(invItem);
//            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
//
//            // SET WARRANTY PERIOD
//            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
//
//            // Set isReturned to false for new items
//            newUsedItem.setIsReturned(false);
//
//            // Set unit price
//            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
//                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
//            } else {
//                newUsedItem.setUnitPrice(invItem.getSellingPrice());
//            }
//
//            // Handle serial numbers (validate but don't mark as SOLD)
//            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
//                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));
//
//                // Validate serial numbers for serialized items
//                if (invItem.getHasSerialization()) {
//                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    }
//
//                    // Validate serials are available (but don't mark as SOLD)
//                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
//                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
//                        if (serial == null) {
//                            throw new RuntimeException("Serial number not found: " + serialNumber);
//                        }
//                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        }
//                        // NOTE: Serial remains AVAILABLE until invoice is paid
//                    }
//                }
//            } else if (invItem.getHasSerialization()) {
//                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//            } else {
//                // For non-serialized items, check stock
//                if (invItem.getQuantity() < itemRequest.getQuantityUsed()) {
//                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
//                }
//                // NOTE: Stock remains undeducted until invoice is paid
//            }
//
//            existing.addUsedItem(newUsedItem);
//            checkInventoryAndNotify(invItem);
//        }
//    }
//
//    /**
//     * Handle status change - REMOVED serial marking on completion
//     */
//    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
//        if (newStatus != null) {
//            jobCard.setStatus(newStatus);
//
//            // Handle completion - BUT DON'T mark serials as SOLD anymore
//            if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//                jobCard.setCompletedAt(LocalDateTime.now());
//
//                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//                notificationService.sendNotification(
//                        NotificationType.JOB_COMPLETED,
//                        "Job completed: " + jobCard.getJobNumber() + priorityInfo +
//                                " (Serials will be marked as SOLD when invoice is paid)",
//                        jobCard
//                );
//            }
//
//            // Handle status change notifications for new statuses
//            if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL)
//                    && oldStatus != newStatus) {
//                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//                notificationService.sendNotification(
//                        NotificationType.JOB_STATUS_CHANGED,
//                        "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
//                        jobCard
//                );
//            }
//        }
//    }
//
//    /**
//     * Mark job card as waiting for parts
//     */
//    @Transactional
//    public JobCard markWaitingForParts(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Cannot update cancelled job card");
//        }
//
//        if (jobCard.getStatus() == JobStatus.WAITING_FOR_PARTS) {
//            throw new RuntimeException("Job card is already waiting for parts");
//        }
//
//        jobCard.markWaitingForParts();
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(
//                NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is waiting for parts" + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Mark job card as waiting for approval
//     */
//    @Transactional
//    public JobCard markWaitingForApproval(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Cannot update cancelled job card");
//        }
//
//        if (jobCard.getStatus() == JobStatus.WAITING_FOR_APPROVAL) {
//            throw new RuntimeException("Job card is already waiting for approval");
//        }
//
//        jobCard.markWaitingForApproval();
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(
//                NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is waiting for approval" + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Mark job card as in progress
//     */
//    @Transactional
//    public JobCard markInProgress(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Cannot update cancelled job card");
//        }
//
//        if (jobCard.getStatus() == JobStatus.IN_PROGRESS) {
//            throw new RuntimeException("Job card is already in progress");
//        }
//
//        jobCard.markInProgress();
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(
//                NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is back in progress" + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Mark job card as pending
//     */
//    @Transactional
//    public JobCard markPending(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Cannot update cancelled job card");
//        }
//
//        if (jobCard.getStatus() == JobStatus.PENDING) {
//            throw new RuntimeException("Job card is already pending");
//        }
//
//        jobCard.setStatus(JobStatus.PENDING);
//        jobCard.setUpdatedAt(LocalDateTime.now());
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(
//                NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " marked as pending" + priorityInfo,
//                saved
//        );
//
//        return saved;
//    }
//
//    // Helper methods for loading related entities by ID
//    private Brand loadBrandById(Long brandId) {
//        if (brandId != null) {
//            Brand dbBrand = brandRepository.findById(brandId)
//                    .orElseThrow(() -> new RuntimeException("Brand not found: " + brandId));
//            if (!dbBrand.getIsActive()) {
//                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            }
//            return dbBrand;
//        }
//        return null;
//    }
//
//    private Model loadModelById(Long modelId) {
//        if (modelId != null) {
//            Model dbModel = modelRepository.findById(modelId)
//                    .orElseThrow(() -> new RuntimeException("Model not found: " + modelId));
//            if (!dbModel.getIsActive()) {
//                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            }
//            return dbModel;
//        }
//        return null;
//    }
//
//    private Processor loadProcessorById(Long processorId) {
//        if (processorId != null) {
//            Processor dbProcessor = processorRepository.findById(processorId)
//                    .orElseThrow(() -> new RuntimeException("Processor not found: " + processorId));
//            if (!dbProcessor.getIsActive()) {
//                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            }
//            return dbProcessor;
//        }
//        return null;
//    }
//
//    private DeviceCondition loadDeviceConditionById(Long deviceConditionId) {
//        if (deviceConditionId != null) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(deviceConditionId)
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + deviceConditionId));
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//            return dbCondition;
//        }
//        return null;
//    }
//
//    // Original helper methods for entity loading
//    private Brand loadBrand(Brand brand) {
//        if (brand != null && brand.getId() != null) {
//            return loadBrandById(brand.getId());
//        }
//        return null;
//    }
//
//    private Model loadModel(Model model) {
//        if (model != null && model.getId() != null) {
//            return loadModelById(model.getId());
//        }
//        return null;
//    }
//
//    private Processor loadProcessor(Processor processor) {
//        if (processor != null && processor.getId() != null) {
//            return loadProcessorById(processor.getId());
//        }
//        return null;
//    }
//
//    private DeviceCondition loadDeviceCondition(DeviceCondition condition) {
//        if (condition != null && condition.getId() != null) {
//            return loadDeviceConditionById(condition.getId());
//        }
//        return null;
//    }
//
//    private void updateFaultsFromIds(JobCard existing, List<Long> faultIds) {
//        existing.clearFaults();
//        for (Long faultId : faultIds) {
//            Fault dbFault = faultRepository.findById(faultId)
//                    .orElseThrow(() -> new RuntimeException("Fault not found: " + faultId));
//            if (!dbFault.getIsActive()) {
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            }
//            existing.addFault(dbFault);
//        }
//    }
//
//    private void updateServiceCategoriesFromIds(JobCard existing, List<Long> serviceCategoryIds) {
//        existing.clearServiceCategories();
//        for (Long serviceCategoryId : serviceCategoryIds) {
//            ServiceCategory dbService = serviceCategoryRepository.findById(serviceCategoryId)
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + serviceCategoryId));
//            if (!dbService.getIsActive()) {
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            }
//            existing.addServiceCategory(dbService);
//        }
//        existing.calculateTotalServicePrice();
//    }
//
//    /**
//     * Add a serial to an existing job card
//     */
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add fault to an existing job card
//     */
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        if (!fault.getIsActive()) {
//            throw new RuntimeException("Fault is inactive");
//        }
//
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove fault from an existing job card
//     */
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        Fault fault = faultRepository.findById(faultId)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Add service category to an existing job card
//     */
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        if (!service.getIsActive()) {
//            throw new RuntimeException("Service category is inactive");
//        }
//
//        jobCard.addServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove service category from an existing job card
//     */
//    @Transactional
//    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
//                .orElseThrow(() -> new RuntimeException("Service category not found"));
//
//        jobCard.removeServiceCategory(service);
//        jobCard.calculateTotalServicePrice();
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    /**
//     * Send job created notification
//     */
//    private void sendJobCreatedNotification(JobCard jobCard) {
//        String faultNames = jobCard.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults");
//
//        String serviceNames = jobCard.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services");
//
//        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + jobCard.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
//                        priorityInfo,
//                jobCard
//        );
//    }
//
//    /**
//     * Get all job cards
//     */
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    /**
//     * Get job card by ID
//     */
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    /**
//     * Get job card by job number
//     */
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    /**
//     * Get job cards filtered by status
//     */
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    /**
//     * Get job cards by service category
//     */
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    /**
//     * Get pending job cards older than specified days (for alerts)
//     */
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(threshold);
//    }
//
//    /**
//     * Get job cards waiting for parts
//     */
//    public List<JobCard> getJobsWaitingForParts() {
//        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
//    }
//
//    /**
//     * Get job cards waiting for approval
//     */
//    public List<JobCard> getJobsWaitingForApproval() {
//        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
//    }
//
//    /**
//     * Generate unique job number
//     */
//    private String generateJobNumber() {
//        return "JOB-" + System.currentTimeMillis();
//    }
//
//    /**
//     * Get job card statistics
//     */
//    public JobCardStatistics getJobCardStatistics() {
//        Long total = jobCardRepository.count();
//        Long pending = jobCardRepository.countByStatus(JobStatus.PENDING);
//        Long inProgress = jobCardRepository.countByStatus(JobStatus.IN_PROGRESS);
//        Long waitingForParts = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_PARTS);
//        Long waitingForApproval = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_APPROVAL);
//        Long completed = jobCardRepository.countByStatus(JobStatus.COMPLETED);
//        Long delivered = jobCardRepository.countByStatus(JobStatus.DELIVERED);
//        Long cancelled = jobCardRepository.countByStatus(JobStatus.CANCELLED);
//
//        return new JobCardStatistics(total, pending, inProgress, waitingForParts,
//                waitingForApproval, completed, delivered, cancelled);
//    }
//
//    /**
//     * Statistics DTO
//     */
//    public static class JobCardStatistics {
//        public final Long total;
//        public final Long pending;
//        public final Long inProgress;
//        public final Long waitingForParts;
//        public final Long waitingForApproval;
//        public final Long completed;
//        public final Long delivered;
//        public final Long cancelled;
//
//        public JobCardStatistics(Long total, Long pending, Long inProgress,
//                                 Long waitingForParts, Long waitingForApproval,
//                                 Long completed, Long delivered, Long cancelled) {
//            this.total = total;
//            this.pending = pending;
//            this.inProgress = inProgress;
//            this.waitingForParts = waitingForParts;
//            this.waitingForApproval = waitingForApproval;
//            this.completed = completed;
//            this.delivered = delivered;
//            this.cancelled = cancelled;
//        }
//    }
//}


package com.example.demo.services;

import com.example.demo.dto.JobCardUpdateRequest;
import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCardService {
    private final JobCardRepository jobCardRepository;
    private final FaultRepository faultRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final NotificationService notificationService;
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;
    private final ProcessorRepository processorRepository;
    private final DeviceConditionRepository deviceConditionRepository;
    private final InventoryService inventoryService;

    /**
     * Create a new job card - FIXED: All fields optional except customer info
     */
    @Transactional
    public JobCard createJobCard(JobCard jobCard) {
        // FIXED: Removed fault validation - faults are now optional
        // FIXED: Removed service category validation - services are now optional

        // Load and validate faults if provided (optional)
        List<Fault> validFaults = new ArrayList<>();
        if (jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()) {
            for (Fault fault : jobCard.getFaults()) {
                if (fault.getId() == null) {
                    throw new RuntimeException("Invalid fault");
                }

                Fault dbFault = faultRepository.findById(fault.getId())
                        .orElseThrow(() -> new RuntimeException("Fault not found"));

                if (!dbFault.getIsActive()) {
                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
                }
                validFaults.add(dbFault);
            }
        }

        // Validate service categories if provided (optional)
        List<ServiceCategory> validServices = new ArrayList<>();
        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
            for (ServiceCategory service : jobCard.getServiceCategories()) {
                if (service.getId() == null) {
                    throw new RuntimeException("Invalid service category");
                }

                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));

                if (!dbService.getIsActive()) {
                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
                }
                validServices.add(dbService);
            }
        }

        // FIXED: Load and validate device conditions if provided (optional) - now supports multiple
        List<DeviceCondition> validDeviceConditions = new ArrayList<>();
        if (jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()) {
            for (DeviceCondition condition : jobCard.getDeviceConditions()) {
                if (condition.getId() == null) {
                    throw new RuntimeException("Invalid device condition");
                }

                DeviceCondition dbCondition = deviceConditionRepository.findById(condition.getId())
                        .orElseThrow(() -> new RuntimeException("Device condition not found: " + condition.getId()));

                if (!dbCondition.getIsActive()) {
                    throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
                }
                validDeviceConditions.add(dbCondition);
            }
        }

        // Load and validate related entities (all optional)
        jobCard.setBrand(loadBrand(jobCard.getBrand()));
        jobCard.setModel(loadModel(jobCard.getModel()));
        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));

        // Set validated collections (can be empty)
        jobCard.setFaults(validFaults);
        jobCard.setServiceCategories(validServices);
        jobCard.setDeviceConditions(validDeviceConditions);
        jobCard.setJobNumber(generateJobNumber());
        jobCard.setStatus(JobStatus.PENDING);

        // Set defaults
        if (jobCard.getOneDayService() == null) {
            jobCard.setOneDayService(false);
        }

        // FIXED: Fault description can be null - no validation

        // Calculate total service price
        jobCard.calculateTotalServicePrice();

        // Handle serials
        if (jobCard.getSerials() != null) {
            for (JobCardSerial serial : jobCard.getSerials()) {
                serial.setJobCard(jobCard);
            }
        }

        // Handle used items - DON'T deduct stock yet, wait for invoice payment
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem item : jobCard.getUsedItems()) {
                item.setJobCard(jobCard);

                // Validate inventory item exists
                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));

                // Set unit price if not provided
                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
                    item.setUnitPrice(invItem.getSellingPrice());
                }

                // Set default warranty if not provided
                if (item.getWarrantyPeriod() == null) {
                    item.setWarrantyPeriod("No Warranty");
                }

                // Validate serial numbers for serialized items (but don't mark as SOLD yet)
                if (invItem.getHasSerialization()) {
                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty()) {
                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
                    }
                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    }

                    // Validate serials are available (but don't mark as SOLD)
                    for (String serialNumber : item.getUsedSerialNumbers()) {
                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
                        if (serial == null) {
                            throw new RuntimeException("Serial number not found: " + serialNumber);
                        }
                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        }
                        // NOTE: Serial remains AVAILABLE until invoice is paid
                    }
                } else {
                    // For non-serialized items, check stock availability
                    if (invItem.getQuantity() < item.getQuantityUsed()) {
                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
                    }
                    // NOTE: Stock remains undeducted until invoice is paid
                }

                checkInventoryAndNotify(invItem);
            }
        }

        JobCard saved = jobCardRepository.save(jobCard);

        // Send notification
        sendJobCreatedNotification(saved);

        return saved;
    }

    /**
     * Update job card using DTO - FIXED: All fields optional
     */
    @Transactional
    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Store old status for completion check
        JobStatus oldStatus = existing.getStatus();

        // Update basic fields
        existing.setCustomerName(updateRequest.getCustomerName());
        existing.setCustomerPhone(updateRequest.getCustomerPhone());
        existing.setCustomerEmail(updateRequest.getCustomerEmail());
        existing.setDeviceType(updateRequest.getDeviceType());

        // FIXED: Fault description is now optional (can be null)
        existing.setFaultDescription(updateRequest.getFaultDescription());

        existing.setNotes(updateRequest.getNotes());
        existing.setEstimatedCost(updateRequest.getEstimatedCost());
        existing.setAdvancePayment(updateRequest.getAdvancePayment());

        // Update related entities (all optional)
        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
        existing.setModel(loadModelById(updateRequest.getModelId()));
        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));

        // FIXED: Update device conditions (optional) - now supports multiple
        if (updateRequest.getDeviceConditionIds() != null) {
            updateDeviceConditionsFromIds(existing, updateRequest.getDeviceConditionIds());
        } else {
            existing.clearDeviceConditions();
        }

        // Update oneDayService
        if (updateRequest.getOneDayService() != null) {
            existing.setOneDayService(updateRequest.getOneDayService());
        }

        // FIXED: Update faults (optional) - can be empty
        if (updateRequest.getFaultIds() != null) {
            updateFaultsFromIds(existing, updateRequest.getFaultIds());
        } else {
            existing.clearFaults();
        }

        // FIXED: Update service categories (optional) - can be empty
        if (updateRequest.getServiceCategoryIds() != null) {
            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
        } else {
            existing.clearServiceCategories();
        }

        // Update used items
        if (updateRequest.getUsedItems() != null) {
            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems());
        }

        // Handle status change
        handleStatusChange(existing, updateRequest.getStatus(), oldStatus);

        JobCard saved = jobCardRepository.save(existing);
        jobCardRepository.flush();

        return saved;
    }

    /**
     * FIXED: Update device conditions from IDs - now supports multiple
     */
    private void updateDeviceConditionsFromIds(JobCard existing, List<Long> deviceConditionIds) {
        existing.clearDeviceConditions();
        for (Long conditionId : deviceConditionIds) {
            DeviceCondition dbCondition = deviceConditionRepository.findById(conditionId)
                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + conditionId));
            if (!dbCondition.getIsActive()) {
                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
            }
            existing.addDeviceCondition(dbCondition);
        }
    }

    /**
     * Update used items from DTO request
     */
    private void updateUsedItemsFromRequest(JobCard existing, List<JobCardUpdateRequest.UsedItemRequest> usedItems) {
        existing.getUsedItems().clear();

        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));

            UsedItem newUsedItem = new UsedItem();
            newUsedItem.setInventoryItem(invItem);
            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());

            // SET WARRANTY PERIOD
            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");

            // Set unit price
            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
            } else {
                newUsedItem.setUnitPrice(invItem.getSellingPrice());
            }

            // Handle serial numbers (validate but don't mark as SOLD)
            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));

                // Validate serial numbers for serialized items
                if (invItem.getHasSerialization()) {
                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    }

                    // Validate serials are available (but don't mark as SOLD)
                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
                        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
                        if (serial == null) {
                            throw new RuntimeException("Serial number not found: " + serialNumber);
                        }
                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        }
                        // NOTE: Serial remains AVAILABLE until invoice is paid
                    }
                }
            } else if (invItem.getHasSerialization()) {
                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
            } else {
                // For non-serialized items, check stock
                if (invItem.getQuantity() < itemRequest.getQuantityUsed()) {
                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
                }
                // NOTE: Stock remains undeducted until invoice is paid
            }

            existing.addUsedItem(newUsedItem);
            checkInventoryAndNotify(invItem);
        }
    }

    /**
     * Handle status change
     */
    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
        if (newStatus != null) {
            jobCard.setStatus(newStatus);

            // Handle completion - BUT DON'T mark serials as SOLD anymore
            if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
                jobCard.setCompletedAt(LocalDateTime.now());

                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
                notificationService.sendNotification(
                        NotificationType.JOB_COMPLETED,
                        "Job completed: " + jobCard.getJobNumber() + priorityInfo +
                                " (Serials will be marked as SOLD when invoice is paid)",
                        jobCard
                );
            }

            // Handle status change notifications for new statuses
            if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL)
                    && oldStatus != newStatus) {
                String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
                notificationService.sendNotification(
                        NotificationType.JOB_STATUS_CHANGED,
                        "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
                        jobCard
                );
            }
        }
    }

    /**
     * Mark job card as waiting for parts
     */
    @Transactional
    public JobCard markWaitingForParts(Long id) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Cannot update cancelled job card");
        }

        if (jobCard.getStatus() == JobStatus.WAITING_FOR_PARTS) {
            throw new RuntimeException("Job card is already waiting for parts");
        }

        jobCard.markWaitingForParts();
        JobCard saved = jobCardRepository.save(jobCard);

        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(
                NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is waiting for parts" + priorityInfo,
                saved
        );

        return saved;
    }

    /**
     * Mark job card as waiting for approval
     */
    @Transactional
    public JobCard markWaitingForApproval(Long id) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Cannot update cancelled job card");
        }

        if (jobCard.getStatus() == JobStatus.WAITING_FOR_APPROVAL) {
            throw new RuntimeException("Job card is already waiting for approval");
        }

        jobCard.markWaitingForApproval();
        JobCard saved = jobCardRepository.save(jobCard);

        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(
                NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is waiting for approval" + priorityInfo,
                saved
        );

        return saved;
    }

    /**
     * Mark job card as in progress
     */
    @Transactional
    public JobCard markInProgress(Long id) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Cannot update cancelled job card");
        }

        if (jobCard.getStatus() == JobStatus.IN_PROGRESS) {
            throw new RuntimeException("Job card is already in progress");
        }

        jobCard.markInProgress();
        JobCard saved = jobCardRepository.save(jobCard);

        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(
                NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is back in progress" + priorityInfo,
                saved
        );

        return saved;
    }

    /**
     * Mark job card as pending
     */
    @Transactional
    public JobCard markPending(Long id) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Cannot update cancelled job card");
        }

        if (jobCard.getStatus() == JobStatus.PENDING) {
            throw new RuntimeException("Job card is already pending");
        }

        jobCard.setStatus(JobStatus.PENDING);
        jobCard.setUpdatedAt(LocalDateTime.now());

        JobCard saved = jobCardRepository.save(jobCard);

        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(
                NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " marked as pending" + priorityInfo,
                saved
        );

        return saved;
    }

    /**
     * FIXED: Add device condition to an existing job card - now supports multiple
     */
    @Transactional
    public JobCard addDeviceConditionToJobCard(Long jobCardId, Long deviceConditionId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId)
                .orElseThrow(() -> new RuntimeException("Device condition not found"));

        if (!deviceCondition.getIsActive()) {
            throw new RuntimeException("Device condition is inactive");
        }

        jobCard.addDeviceCondition(deviceCondition);
        return jobCardRepository.save(jobCard);
    }

    /**
     * FIXED: Remove device condition from an existing job card - now supports multiple
     */
    @Transactional
    public JobCard removeDeviceConditionFromJobCard(Long jobCardId, Long deviceConditionId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId)
                .orElseThrow(() -> new RuntimeException("Device condition not found"));

        jobCard.removeDeviceCondition(deviceCondition);
        return jobCardRepository.save(jobCard);
    }

    // Helper methods for loading related entities by ID
    private Brand loadBrandById(Long brandId) {
        if (brandId != null) {
            Brand dbBrand = brandRepository.findById(brandId)
                    .orElseThrow(() -> new RuntimeException("Brand not found: " + brandId));
            if (!dbBrand.getIsActive()) {
                throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
            }
            return dbBrand;
        }
        return null;
    }

    private Model loadModelById(Long modelId) {
        if (modelId != null) {
            Model dbModel = modelRepository.findById(modelId)
                    .orElseThrow(() -> new RuntimeException("Model not found: " + modelId));
            if (!dbModel.getIsActive()) {
                throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
            }
            return dbModel;
        }
        return null;
    }

    private Processor loadProcessorById(Long processorId) {
        if (processorId != null) {
            Processor dbProcessor = processorRepository.findById(processorId)
                    .orElseThrow(() -> new RuntimeException("Processor not found: " + processorId));
            if (!dbProcessor.getIsActive()) {
                throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
            }
            return dbProcessor;
        }
        return null;
    }

    // Original helper methods for entity loading
    private Brand loadBrand(Brand brand) {
        if (brand != null && brand.getId() != null) {
            return loadBrandById(brand.getId());
        }
        return null;
    }

    private Model loadModel(Model model) {
        if (model != null && model.getId() != null) {
            return loadModelById(model.getId());
        }
        return null;
    }

    private Processor loadProcessor(Processor processor) {
        if (processor != null && processor.getId() != null) {
            return loadProcessorById(processor.getId());
        }
        return null;
    }

    /**
     * FIXED: Update faults from IDs - now optional
     */
    private void updateFaultsFromIds(JobCard existing, List<Long> faultIds) {
        existing.clearFaults();
        for (Long faultId : faultIds) {
            Fault dbFault = faultRepository.findById(faultId)
                    .orElseThrow(() -> new RuntimeException("Fault not found: " + faultId));
            if (!dbFault.getIsActive()) {
                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
            }
            existing.addFault(dbFault);
        }
    }

    /**
     * FIXED: Update service categories from IDs - now optional
     */
    private void updateServiceCategoriesFromIds(JobCard existing, List<Long> serviceCategoryIds) {
        existing.clearServiceCategories();
        for (Long serviceCategoryId : serviceCategoryIds) {
            ServiceCategory dbService = serviceCategoryRepository.findById(serviceCategoryId)
                    .orElseThrow(() -> new RuntimeException("Service category not found: " + serviceCategoryId));
            if (!dbService.getIsActive()) {
                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
            }
            existing.addServiceCategory(dbService);
        }
        existing.calculateTotalServicePrice();
    }

    /**
     * Cancel a job card with reason, fee, and who cancelled it
     */
    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
                                 String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Job card is already cancelled");
        }

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee);

        JobCard saved = jobCardRepository.save(jobCard);

        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";

        notificationService.sendNotification(
                NotificationType.JOB_CANCELLED,
                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
                saved
        );

        return saved;
    }

    /**
     * Add a serial to an existing job card
     */
    @Transactional
    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.addSerial(serial);
        return jobCardRepository.save(jobCard);
    }

    /**
     * FIXED: Add fault to an existing job card - now optional
     */
    @Transactional
    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        Fault fault = faultRepository.findById(faultId)
                .orElseThrow(() -> new RuntimeException("Fault not found"));

        if (!fault.getIsActive()) {
            throw new RuntimeException("Fault is inactive");
        }

        jobCard.addFault(fault);
        return jobCardRepository.save(jobCard);
    }

    /**
     * FIXED: Remove fault from an existing job card - now optional
     */
    @Transactional
    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        Fault fault = faultRepository.findById(faultId)
                .orElseThrow(() -> new RuntimeException("Fault not found"));

        jobCard.removeFault(fault);
        return jobCardRepository.save(jobCard);
    }

    /**
     * FIXED: Add service category to an existing job card - now optional
     */
    @Transactional
    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
                .orElseThrow(() -> new RuntimeException("Service category not found"));

        if (!service.getIsActive()) {
            throw new RuntimeException("Service category is inactive");
        }

        jobCard.addServiceCategory(service);
        jobCard.calculateTotalServicePrice();
        return jobCardRepository.save(jobCard);
    }

    /**
     * FIXED: Remove service category from an existing job card - now optional
     */
    @Transactional
    public JobCard removeServiceCategoryFromJobCard(Long jobCardId, Long serviceCategoryId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId)
                .orElseThrow(() -> new RuntimeException("Service category not found"));

        jobCard.removeServiceCategory(service);
        jobCard.calculateTotalServicePrice();
        return jobCardRepository.save(jobCard);
    }

    /**
     * Check inventory level and send notification if low stock
     */
    private void checkInventoryAndNotify(InventoryItem item) {
        if (item.getQuantity() <= item.getMinThreshold()) {
            notificationService.sendNotification(
                    NotificationType.LOW_STOCK,
                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
                    item
            );
        }
    }

    /**
     * FIXED: Send job created notification - Updated for all optional fields
     */
    private void sendJobCreatedNotification(JobCard jobCard) {
        String faultNames = jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()
                ? jobCard.getFaults().stream()
                .map(Fault::getFaultName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("No faults")
                : "No faults selected";

        String serviceNames = jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()
                ? jobCard.getServiceCategories().stream()
                .map(ServiceCategory::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("No services")
                : "No services selected";

        String deviceConditionNames = jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()
                ? jobCard.getDeviceConditions().stream()
                .map(DeviceCondition::getConditionName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("No conditions")
                : "No conditions selected";

        String faultDescriptionInfo = jobCard.getFaultDescription() != null && !jobCard.getFaultDescription().isEmpty()
                ? "Fault desc: " + (jobCard.getFaultDescription().length() > 50
                ? jobCard.getFaultDescription().substring(0, 50) + "..."
                : jobCard.getFaultDescription())
                : "No fault description";

        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";

        notificationService.sendNotification(
                NotificationType.PENDING_JOB,
                "New job card created: " + jobCard.getJobNumber() +
                        " - Faults: " + faultNames +
                        " - Services: " + serviceNames +
                        " - Device Conditions: " + deviceConditionNames +
                        " - " + faultDescriptionInfo +
                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
                        priorityInfo,
                jobCard
        );
    }

    /**
     * Get all job cards
     */
    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAll();
    }

    /**
     * Get job card by ID
     */
    public JobCard getJobCardById(Long id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
    }

    /**
     * Get job card by job number
     */
    public JobCard getJobCardByNumber(String jobNumber) {
        return jobCardRepository.findByJobNumber(jobNumber)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
    }

    /**
     * Get job cards filtered by status
     */
    public List<JobCard> getJobCardsByStatus(JobStatus status) {
        return jobCardRepository.findByStatus(status);
    }

    /**
     * Get job cards by service category
     */
    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
    }

    /**
     * Get pending job cards older than specified days (for alerts)
     */
    public List<JobCard> getPendingJobsOlderThanDays(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return jobCardRepository.findPendingJobsOlderThan(threshold);
    }

    /**
     * Get job cards waiting for parts
     */
    public List<JobCard> getJobsWaitingForParts() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
    }

    /**
     * Get job cards waiting for approval
     */
    public List<JobCard> getJobsWaitingForApproval() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
    }

    /**
     * Generate unique job number
     */
    private String generateJobNumber() {
        return "JOB-" + System.currentTimeMillis();
    }

    /**
     * Get job card statistics
     */
    public JobCardStatistics getJobCardStatistics() {
        Long total = jobCardRepository.count();
        Long pending = jobCardRepository.countByStatus(JobStatus.PENDING);
        Long inProgress = jobCardRepository.countByStatus(JobStatus.IN_PROGRESS);
        Long waitingForParts = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_PARTS);
        Long waitingForApproval = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_APPROVAL);
        Long completed = jobCardRepository.countByStatus(JobStatus.COMPLETED);
        Long delivered = jobCardRepository.countByStatus(JobStatus.DELIVERED);
        Long cancelled = jobCardRepository.countByStatus(JobStatus.CANCELLED);

        return new JobCardStatistics(total, pending, inProgress, waitingForParts,
                waitingForApproval, completed, delivered, cancelled);
    }

    /**
     * Statistics DTO
     */
    public static class JobCardStatistics {
        public final Long total;
        public final Long pending;
        public final Long inProgress;
        public final Long waitingForParts;
        public final Long waitingForApproval;
        public final Long completed;
        public final Long delivered;
        public final Long cancelled;

        public JobCardStatistics(Long total, Long pending, Long inProgress,
                                 Long waitingForParts, Long waitingForApproval,
                                 Long completed, Long delivered, Long cancelled) {
            this.total = total;
            this.pending = pending;
            this.inProgress = inProgress;
            this.waitingForParts = waitingForParts;
            this.waitingForApproval = waitingForApproval;
            this.completed = completed;
            this.delivered = delivered;
            this.cancelled = cancelled;
        }
    }
}