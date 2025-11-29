
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
     * Create a new job card with serial state management
     */
    @Transactional
    public JobCard createJobCard(JobCard jobCard) {
        // Validate required fields
        if (jobCard.getCustomerName() == null || jobCard.getCustomerName().trim().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }
        if (jobCard.getCustomerPhone() == null || jobCard.getCustomerPhone().trim().isEmpty()) {
            throw new RuntimeException("Customer phone is required");
        }
        if (jobCard.getDeviceType() == null || jobCard.getDeviceType().trim().isEmpty()) {
            throw new RuntimeException("Device type is required");
        }

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

        // Load and validate device conditions if provided (optional)
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
        if (jobCard.getTotalServicePrice() == null) {
            jobCard.setTotalServicePrice(0.0);
        }

        // Calculate total service price
        jobCard.calculateTotalServicePrice();

        // Handle serials
        if (jobCard.getSerials() != null) {
            for (JobCardSerial serial : jobCard.getSerials()) {
                serial.setJobCard(jobCard);
            }
        }

        // Handle used items - MARK SERIALS AS USED
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

                // Validate serial numbers for serialized items AND MARK THEM AS USED
                if (invItem.getHasSerialization()) {
                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty()) {
                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
                    }
                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    }

                    // Validate serials are available AND MARK THEM AS USED
                    for (String serialNumber : item.getUsedSerialNumbers()) {
                        if (!inventoryService.isSerialAvailable(serialNumber)) {
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        }
                        // MARK SERIAL AS USED (job card will be saved first to get ID)
                    }
                } else {
                    // For non-serialized items, check stock availability
                    if (invItem.getQuantity() < item.getQuantityUsed()) {
                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
                    }
                }

                checkInventoryAndNotify(invItem);
            }
        }

        // Save job card first to get ID
        JobCard saved = jobCardRepository.save(jobCard);

        // Now mark serials as USED with the job card ID
        if (saved.getUsedItems() != null && !saved.getUsedItems().isEmpty()) {
            for (UsedItem item : saved.getUsedItems()) {
                if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
                    for (String serialNumber : item.getUsedSerialNumbers()) {
                        inventoryService.markSerialAsUsed(serialNumber, saved.getId(), saved.getJobNumber());
                    }
                }
            }
        }

        sendJobCreatedNotification(saved);
        return saved;
    }

    /**
     * Update job card with serial state management - FIXED VERSION
     */
    @Transactional
    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Store current used items to compare later
        List<UsedItem> oldUsedItems = new ArrayList<>(existing.getUsedItems());

        // Store old status for completion check
        JobStatus oldStatus = existing.getStatus();

        // Update basic fields
        if (updateRequest.getCustomerName() != null) {
            existing.setCustomerName(updateRequest.getCustomerName());
        }
        if (updateRequest.getCustomerPhone() != null) {
            existing.setCustomerPhone(updateRequest.getCustomerPhone());
        }
        if (updateRequest.getCustomerEmail() != null) {
            existing.setCustomerEmail(updateRequest.getCustomerEmail());
        }
        if (updateRequest.getDeviceType() != null) {
            existing.setDeviceType(updateRequest.getDeviceType());
        }
        if (updateRequest.getFaultDescription() != null) {
            existing.setFaultDescription(updateRequest.getFaultDescription());
        }
        if (updateRequest.getNotes() != null) {
            existing.setNotes(updateRequest.getNotes());
        }
        if (updateRequest.getEstimatedCost() != null) {
            existing.setEstimatedCost(updateRequest.getEstimatedCost());
        }
        if (updateRequest.getAdvancePayment() != null) {
            existing.setAdvancePayment(updateRequest.getAdvancePayment());
        }

        // Update related entities (all optional)
        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
        existing.setModel(loadModelById(updateRequest.getModelId()));
        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));

        // Update device conditions (optional)
        if (updateRequest.getDeviceConditionIds() != null) {
            updateDeviceConditionsFromIds(existing, updateRequest.getDeviceConditionIds());
        } else {
            existing.clearDeviceConditions();
        }

        // Update oneDayService
        if (updateRequest.getOneDayService() != null) {
            existing.setOneDayService(updateRequest.getOneDayService());
        }

        // Update faults (optional)
        if (updateRequest.getFaultIds() != null) {
            updateFaultsFromIds(existing, updateRequest.getFaultIds());
        } else {
            existing.clearFaults();
        }

        // Update service categories (optional)
        if (updateRequest.getServiceCategoryIds() != null) {
            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
        } else {
            existing.clearServiceCategories();
        }

        // Update used items with serial state management - FIXED
        if (updateRequest.getUsedItems() != null) {
            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems(), oldUsedItems);
        } else {
            // If no used items provided, clear all and release serials
            releaseAllSerialsFromUsedItems(oldUsedItems);
            existing.getUsedItems().clear();
        }

        // Handle status change
        if (updateRequest.getStatus() != null) {
            handleStatusChange(existing, updateRequest.getStatus(), oldStatus);
        }

        // Recalculate total service price
        existing.calculateTotalServicePrice();

        JobCard saved = jobCardRepository.save(existing);
        return saved;
    }

    /**
     * Update used items with serial state management - FIXED VERSION
     * Allows serials that are already USED in the same job card
     */
    private void updateUsedItemsFromRequest(JobCard existing,
                                            List<JobCardUpdateRequest.UsedItemRequest> usedItems,
                                            List<UsedItem> oldUsedItems) {

        // Release serials from removed items
        releaseSerialsFromRemovedItems(oldUsedItems, usedItems);

        // Clear existing used items
        existing.getUsedItems().clear();

        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));

            UsedItem newUsedItem = new UsedItem();
            newUsedItem.setJobCard(existing);
            newUsedItem.setInventoryItem(invItem);
            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");

            // Set unit price
            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
            } else {
                newUsedItem.setUnitPrice(invItem.getSellingPrice());
            }

            // Handle serial numbers - FIXED: Use job-card-specific validation
            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));

                // Validate serial numbers for serialized items
                if (invItem.getHasSerialization()) {
                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    }

                    // FIXED: Validate serials are available FOR THIS JOB CARD (allows existing USED serials in same job)
                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
                        if (!inventoryService.isSerialAvailableForJobCard(serialNumber, existing.getId())) {
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        }
                        // FIXED: Only mark as USED if not already USED in this job card
                        if (inventoryService.isSerialAvailable(serialNumber)) {
                            inventoryService.markSerialAsUsed(serialNumber, existing.getId(), existing.getJobNumber());
                        }
                        // If already USED in this job card, no need to mark again
                    }
                }
            } else if (invItem.getHasSerialization()) {
                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
            } else {
                // For non-serialized items, check stock
                if (invItem.getQuantity() < itemRequest.getQuantityUsed()) {
                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
                }
            }

            existing.addUsedItem(newUsedItem);
            checkInventoryAndNotify(invItem);
        }
    }

    /**
     * Release serials from items that were removed
     */
    private void releaseSerialsFromRemovedItems(List<UsedItem> oldUsedItems,
                                                List<JobCardUpdateRequest.UsedItemRequest> newUsedItems) {
        for (UsedItem oldItem : oldUsedItems) {
            boolean stillExists = newUsedItems.stream()
                    .anyMatch(newItem ->
                            newItem.getId() != null &&
                                    newItem.getId().equals(oldItem.getId()));

            if (!stillExists && oldItem.getInventoryItem().getHasSerialization() &&
                    oldItem.getUsedSerialNumbers() != null) {
                // Release all serials from removed item
                for (String serialNumber : oldItem.getUsedSerialNumbers()) {
                    try {
                        inventoryService.releaseSerial(serialNumber);
                        System.out.println("✅ Released serial from removed item: " + serialNumber);
                    } catch (Exception e) {
                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    /**
     * Release all serials from used items
     */
    private void releaseAllSerialsFromUsedItems(List<UsedItem> usedItems) {
        for (UsedItem item : usedItems) {
            if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
                for (String serialNumber : item.getUsedSerialNumbers()) {
                    try {
                        inventoryService.releaseSerial(serialNumber);
                        System.out.println("✅ Released serial: " + serialNumber);
                    } catch (Exception e) {
                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    /**
     * Cancel job card - RELEASE ALL SERIALS
     */
    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
                                 String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Job card is already cancelled");
        }

        // RELEASE ALL SERIALS FROM USED ITEMS
        if (jobCard.getUsedItems() != null) {
            releaseAllSerialsFromUsedItems(jobCard.getUsedItems());
        }

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee != null ? fee : 0.0);

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
     * Add device condition to an existing job card
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
     * Remove device condition from an existing job card
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

    /**
     * Add fault to an existing job card
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
     * Remove fault from an existing job card
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
     * Add service category to an existing job card
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
     * Remove service category from an existing job card
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
     * Add serial to an existing job card
     */
    @Transactional
    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        jobCard.addSerial(serial);
        return jobCardRepository.save(jobCard);
    }

    // ========== HELPER METHODS ==========

    /**
     * Handle status change
     */
    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
        jobCard.setStatus(newStatus);

        // Handle completion
        if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
            jobCard.setCompletedAt(LocalDateTime.now());

            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
            notificationService.sendNotification(
                    NotificationType.JOB_COMPLETED,
                    "Job completed: " + jobCard.getJobNumber() + priorityInfo +
                            " (Serials remain USED until invoice payment)",
                    jobCard
            );
        }

        // Handle status change notifications
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

    /**
     * Update device conditions from IDs
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
     * Update faults from IDs
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
     * Update service categories from IDs
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
     * Send job created notification
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
     * Generate unique job number
     */
    private String generateJobNumber() {
        return "JOB-" + System.currentTimeMillis();
    }

    // ========== GETTER METHODS ==========

    public List<JobCard> getAllJobCards() {
        return jobCardRepository.findAll();
    }

    public JobCard getJobCardById(Long id) {
        return jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
    }

    public JobCard getJobCardByNumber(String jobNumber) {
        return jobCardRepository.findByJobNumber(jobNumber)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
    }

    public List<JobCard> getJobCardsByStatus(JobStatus status) {
        return jobCardRepository.findByStatus(status);
    }

    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
    }

    public List<JobCard> getPendingJobsOlderThanDays(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        return jobCardRepository.findPendingJobsOlderThan(threshold);
    }

    public List<JobCard> getJobsWaitingForParts() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
    }

    public List<JobCard> getJobsWaitingForApproval() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
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