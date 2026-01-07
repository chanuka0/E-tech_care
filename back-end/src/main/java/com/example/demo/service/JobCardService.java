package com.example.demo.service;

import com.example.demo.dto.JobCardUpdateRequest;
import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final JobCardSerialRepository jobCardSerialRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InvoiceRepository invoiceRepository;

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

        // Check if barcode already exists
        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
            boolean barcodeExists = checkBarcodeExists(jobCard.getDeviceBarcode());
            if (barcodeExists) {
                throw new RuntimeException("Device barcode already exists: " + jobCard.getDeviceBarcode());
            }
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
        if (jobCard.getWithCharger() == null) {
            jobCard.setWithCharger(false);
        }
        if (jobCard.getTotalServicePrice() == null) {
            jobCard.setTotalServicePrice(0.0);
        }

        // Calculate total service price
        jobCard.calculateTotalServicePrice();

        // Handle device barcode - add as serial
        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
            JobCardSerial deviceSerial = new JobCardSerial();
            deviceSerial.setSerialType("DEVICE_SERIAL");
            deviceSerial.setSerialValue(jobCard.getDeviceBarcode().trim());
            deviceSerial.setJobCard(jobCard);

            if (jobCard.getSerials() == null) {
                jobCard.setSerials(new ArrayList<>());
            }
            jobCard.getSerials().add(deviceSerial);
        }

        // Handle other serials
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
     * Check if barcode already exists
     */
    public boolean checkBarcodeExists(String barcode) {
        // Check in job_card_serials table
        List<JobCardSerial> existingSerials = jobCardSerialRepository.findBySerialValue(barcode);
        if (!existingSerials.isEmpty()) {
            return true;
        }

        // Check in device_barcode field
        List<JobCard> existingJobs = jobCardRepository.findByDeviceBarcode(barcode);
        return !existingJobs.isEmpty();
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

        if (updateRequest.getWithCharger() != null) {
            existing.setWithCharger(updateRequest.getWithCharger());
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
     * Cancel job card - UPDATED with status validation and inventory rollback
     */
    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
                                 String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // NEW: Validate job card status
        if (jobCard.getStatus() != JobStatus.COMPLETED && jobCard.getStatus() != JobStatus.IN_PROGRESS) {
            throw new RuntimeException("Job card can only be cancelled if status is COMPLETED or IN_PROGRESS. Current status: " + jobCard.getStatus());
        }

        if (jobCard.getStatus() == JobStatus.CANCELLED) {
            throw new RuntimeException("Job card is already cancelled");
        }

        // NEW: Rollback inventory and serials for customer cancellation
        if ("CUSTOMER".equals(cancelledBy)) {
            rollbackInventoryFromJobCard(jobCard);
        } else {
            // For technician cancellation, just release serials
            if (jobCard.getUsedItems() != null) {
                releaseAllSerialsFromUsedItems(jobCard.getUsedItems());
            }
        }

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee != null ? fee : 0.0);

        JobCard saved = jobCardRepository.save(jobCard);

        // NEW: Create cancellation invoice if customer cancels with fee
        if ("CUSTOMER".equals(cancelledBy) && fee != null && fee > 0) {
            createCancellationInvoice(saved, fee, reason);
        }

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
     * NEW: Rollback inventory and serials from job card used items
     */
    private void rollbackInventoryFromJobCard(JobCard jobCard) {
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InventoryItem inventoryItem = usedItem.getInventoryItem();

                if (inventoryItem.getHasSerialization()) {
                    // Release serial numbers back to AVAILABLE
                    if (usedItem.getUsedSerialNumbers() != null) {
                        for (String serialNumber : usedItem.getUsedSerialNumbers()) {
                            try {
                                releaseSerialForCancellation(serialNumber);
                            } catch (Exception e) {
                                System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
                            }
                        }
                    }
                } else {
                    // For non-serialized items, add quantity back to inventory
                    int quantityToRestore = usedItem.getQuantityUsed();
                    inventoryItem.setQuantity(inventoryItem.getQuantity() + quantityToRestore);
                    inventoryItemRepository.save(inventoryItem);

                    // Record stock movement for rollback
                    recordStockMovementForRollback(inventoryItem, quantityToRestore, jobCard);
                }
            }
        }
    }

    /**
     * NEW: Release serial for cancellation (mark as AVAILABLE)
     */
    private void releaseSerialForCancellation(String serialNumber) {
        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

        if (serial.getStatus() == SerialStatus.USED) {
            serial.setStatus(SerialStatus.AVAILABLE);
            serial.setUsedAt(null);
            serial.setUsedBy(null);
            serial.setUsedInReferenceType(null);
            serial.setUsedInReferenceId(null);
            serial.setUsedInReferenceNumber(null);
            serial.setNotes((serial.getNotes() != null ? serial.getNotes() + " " : "") +
                    "[Released from cancelled job card at " + LocalDateTime.now() + "]");

            inventorySerialRepository.save(serial);
            System.out.println("✅ Serial released to AVAILABLE from cancellation: " + serialNumber);
        }
    }

    /**
     * NEW: Record stock movement for inventory rollback
     */
    private void recordStockMovementForRollback(InventoryItem item, Integer quantity, JobCard jobCard) {
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(item);
        movement.setMovementType(MovementType.IN); // IN for rollback
        movement.setQuantity(quantity);
        movement.setReferenceType("CANCELLATION_ROLLBACK");
        movement.setReferenceId(jobCard.getId());
        movement.setReferenceNumber(jobCard.getJobNumber());
        movement.setReason("Inventory restored from cancelled job card");
        movement.setPerformedBy(getCurrentUsername());

        int previousQuantity = item.getQuantity() - quantity;
        int newQuantity = item.getQuantity();
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);

        stockMovementRepository.save(movement);
        System.out.println("📝 Recorded rollback stock movement for " + item.getName() + ": +" + quantity);
    }

    /**
     * NEW: Create cancellation invoice with UNPAID status
     */
    private void createCancellationInvoice(JobCard jobCard, Double fee, String reason) {
        try {
            // Generate invoice number
            String invoiceNumber = "CANCEL-" + jobCard.getJobNumber() + "-" + System.currentTimeMillis();

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setJobCard(jobCard);
            invoice.setCustomerName(jobCard.getCustomerName());
            invoice.setCustomerPhone(jobCard.getCustomerPhone());
            invoice.setCustomerEmail(jobCard.getCustomerEmail());
            invoice.setPaymentMethod(PaymentMethod.CASH);

            // Create cancellation fee item
            InvoiceItem feeItem = new InvoiceItem();
            feeItem.setInvoice(invoice);
            feeItem.setItemName("Cancellation Fee");
            feeItem.setQuantity(1);
            feeItem.setUnitPrice(fee);
            feeItem.setTotal(fee);
            feeItem.setWarranty("No Warranty");
            feeItem.setItemType("CANCELLATION_FEE");

            invoice.setItems(List.of(feeItem));

            // Set totals
            invoice.setSubtotal(fee);
            invoice.setTotal(fee);
            invoice.setPaidAmount(0.0); // UNPAID
            invoice.setBalance(fee);
            invoice.setPaymentStatus(PaymentStatus.UNPAID); // Set as UNPAID
            invoice.setPaymentMethod(PaymentMethod.CASH);

            // Save invoice
            invoiceRepository.save(invoice);

            System.out.println("📄 Created cancellation invoice: " + invoiceNumber + " for job: " + jobCard.getJobNumber());

            notificationService.sendNotification(
                    NotificationType.INVOICE_CREATED,
                    "Cancellation invoice created: " + invoiceNumber +
                            " | Amount: Rs." + fee +
                            " | Job: " + jobCard.getJobNumber(),
                    invoice
            );

        } catch (Exception e) {
            System.err.println("❌ Failed to create cancellation invoice: " + e.getMessage());
            // Don't throw - cancellation should proceed even if invoice creation fails
        }
    }

    /**
     * Get current username
     */
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    /**
     * Delete job card (Admin only) - UPDATED with status validation
     */
    @Transactional
    public void deleteJobCard(Long id, String reason) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // UPDATED: Only allow deletion of PENDING or CANCELLED job cards
        if (jobCard.getStatus() != JobStatus.PENDING && jobCard.getStatus() != JobStatus.CANCELLED) {
            throw new RuntimeException("Can only delete PENDING or CANCELLED job cards. Current status: " + jobCard.getStatus());
        }

        // Delete associated serials first
        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
            jobCardSerialRepository.deleteAll(jobCard.getSerials());
        }

        // Delete used items and their serials
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem usedItem : jobCard.getUsedItems()) {
                if (usedItem.getUsedSerialNumbers() != null) {
                    for (String serialNumber : usedItem.getUsedSerialNumbers()) {
                        try {
                            inventoryService.releaseSerial(serialNumber);
                        } catch (Exception e) {
                            System.err.println("Error releasing serial on delete: " + e.getMessage());
                        }
                    }
                }
            }
        }

        jobCardRepository.delete(jobCard);

        notificationService.sendNotification(
                NotificationType.JOB_CANCELLED,
                "Job card deleted: " + jobCard.getJobNumber() + " | Reason: " + reason,
                jobCard
        );
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
    public JobCard removeServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
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
    public JobCard getJobCardByDeviceSerial(String jobNumber) {
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
        return jobCardRepository.findPendingJobsOlderThan(JobStatus.PENDING, threshold);
    }

    public List<JobCard> getJobsWaitingForParts() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
    }

    public List<JobCard> getJobsWaitingForApproval() {
        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
    }
    // Add these methods to your JobCardService class

    /**
     * Search job cards by device serial number (from JobCardSerial)
     */
    public List<JobCard> getJobCardByDeviceSerialNumber(String serialNumber) {
        return jobCardRepository.findByDeviceSerialNumber(serialNumber);
    }

    /**
     * General search across all fields (including serials and faults)
     */
    public List<JobCard> searchJobCards(String query) {
        return jobCardRepository.searchJobCards(query);
    }

    /**
     * Search job cards by barcode (partial match for search functionality)
     */
    public List<JobCard> searchJobCardsByBarcode(String barcode) {
        return jobCardRepository.searchJobCards(barcode);
    }

    /**
     * Get job cards by device barcode (exact match)
     */
    public List<JobCard> getJobCardByBarcode(String barcode) {
        return jobCardRepository.findByDeviceBarcode(barcode);
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

    public Object removeServiceCategoryFromJobCard(Long id, Long serviceCategoryId) {
        return null;
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