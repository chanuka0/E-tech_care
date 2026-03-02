//package com.example.demo.service;
//
//import com.example.demo.dto.JobCardUpdateRequest;
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.text.SimpleDateFormat;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.*;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;
//
//@Service
//@RequiredArgsConstructor
//public class JobCardService {
//    private final CustomerRepository customerRepository;
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
//    private final JobCardSerialRepository jobCardSerialRepository;
//    private final InventorySerialRepository inventorySerialRepository;
//    private final StockMovementRepository stockMovementRepository;
//    private final InvoiceRepository invoiceRepository;
//
//    // Add these constants at the class level
//    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
//    private static final String JOB_NUMBER_PREFIX = "JOB-";
//    private static final Pattern JOB_NUMBER_PATTERN = Pattern.compile("^JOB-(\\d{8})-(\\d{6})$");
//
//    /**
//     * ✅ Helper method to create job card payload for notifications
//     */
//    private Map<String, Object> createJobCardPayload(JobCard jobCard) {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("id", jobCard.getId());
//        payload.put("jobNumber", jobCard.getJobNumber());
//        payload.put("customerName", jobCard.getCustomerName());
//        payload.put("customerPhone", jobCard.getCustomerPhone());
//        payload.put("deviceType", jobCard.getDeviceType());
//        payload.put("status", jobCard.getStatus());
//        payload.put("oneDayService", jobCard.getOneDayService());
//        payload.put("totalServicePrice", jobCard.getTotalServicePrice());
//        payload.put("createdAt", jobCard.getCreatedAt());
//        return payload;
//    }
//
//    /**
//     * Generate job number in format: JOB-YYYYMMDD-XXXXXX
//     * Where XXXXXX continues from the last job number, regardless of date
//     */
//    private String generateJobNumber() {
//        String today = LocalDate.now().format(DATE_FORMATTER);
//
//        // Find the highest job number overall
//        Optional<String> lastJobNumber = jobCardRepository.findMaxJobNumber();
//
//        int nextNumber;
//        if (lastJobNumber.isPresent()) {
//            // Extract the numeric part from the last job number
//            String lastNumberStr = lastJobNumber.get();
//            Matcher matcher = JOB_NUMBER_PATTERN.matcher(lastNumberStr);
//
//            if (matcher.matches()) {
//                // Extract the 6-digit sequence number
//                String sequenceStr = matcher.group(2);
//                int lastSequence = Integer.parseInt(sequenceStr);
//                nextNumber = lastSequence + 1; // Increment by 1
//            } else {
//                // Handle old format job numbers (JOB-timestamp)
//                // Find the maximum sequence number among all job cards
//                nextNumber = findMaxSequenceNumber() + 1;
//            }
//        } else {
//            // No job cards exist yet, start from 000800
//            nextNumber = 800;
//        }
//
//        // Format as 6-digit number
//        return String.format("JOB-%s-%06d", today, nextNumber);
//    }
//
//    /**
//     * ✅ NEW: Generate invoice number using same format as InvoiceService
//     * Format: INV-YYYYMMDD-XXXXX
//     */
//    private String generateInvoiceNumber() {
//        Long count = invoiceRepository.count();
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
//        String datePart = sdf.format(new Date());
//        String sequencePart = String.format("%05d", (count + 1));
//        return "INV-" + datePart + "-" + sequencePart;
//    }
//
//    /**
//     * Helper method to find maximum sequence number from existing job cards
//     * Handles both new format (JOB-YYYYMMDD-XXXXXX) and old format (JOB-timestamp)
//     */
//    private int findMaxSequenceNumber() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        int maxSequence = 799; // Start from 799 so first new job will be 800
//
//        for (JobCard job : allJobCards) {
//            String jobNumber = job.getJobNumber();
//            Matcher matcher = JOB_NUMBER_PATTERN.matcher(jobNumber);
//
//            if (matcher.matches()) {
//                try {
//                    int sequence = Integer.parseInt(matcher.group(2));
//                    if (sequence > maxSequence) {
//                        maxSequence = sequence;
//                    }
//                } catch (NumberFormatException e) {
//                    // Skip invalid numbers
//                }
//            }
//        }
//
//        return maxSequence;
//    }
//
//    /**
//     * Create a new job card with serial state management
//     */
//    // ✅ UPDATED: createJobCard method with regular customer support
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        // ✅ NEW: Handle regular customer
//        if (jobCard.getIsRegularCustomer() != null && jobCard.getIsRegularCustomer() && jobCard.getCustomer() != null) {
//            // Load the regular customer
//            Customer regularCustomer = customerRepository.findById((long) jobCard.getCustomer().getCustomerId())
//                    .orElseThrow(() -> new RuntimeException("Customer not found"));
//            // Auto-populate customer data from regular customer
//            jobCard.loadCustomerData(regularCustomer);
//
//            System.out.println("✓ Regular customer loaded: " + regularCustomer.getCustomerName());
//            System.out.println("  Phone: " + regularCustomer.getPhoneNumber());
//            System.out.println("  Credit Balance: Rs." + regularCustomer.getCreditBalance());
//        }
//
//        // Validate required fields
//        if (jobCard.getCustomerName() == null || jobCard.getCustomerName().trim().isEmpty()) {
//            throw new RuntimeException("Customer name is required");
//        }
//        if (jobCard.getCustomerPhone() == null || jobCard.getCustomerPhone().trim().isEmpty()) {
//            throw new RuntimeException("Customer phone is required");
//        }
//        if (jobCard.getDeviceType() == null || jobCard.getDeviceType().trim().isEmpty()) {
//            throw new RuntimeException("Device type is required");
//        }
//
//        // Check if barcode already exists
//        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
//            boolean barcodeExists = checkBarcodeExists(jobCard.getDeviceBarcode());
//            if (barcodeExists) {
//                throw new RuntimeException("Device barcode already exists: " + jobCard.getDeviceBarcode());
//            }
//        }
//
//        // Load and validate faults if provided (optional)
//        List<Fault> validFaults = new ArrayList<>();
//        if (jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()) {
//            for (Fault fault : jobCard.getFaults()) {
//                if (fault.getId() == null) {
//                    throw new RuntimeException("Invalid fault");
//                }
//
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found"));
//
//                if (!dbFault.getIsActive()) {
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                }
//                validFaults.add(dbFault);
//            }
//        }
//
//        // Validate service categories if provided (optional)
//        List<ServiceCategory> validServices = new ArrayList<>();
//        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
//            for (ServiceCategory service : jobCard.getServiceCategories()) {
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
//                validServices.add(dbService);
//            }
//        }
//
//        // Load and validate device conditions if provided (optional)
//        List<DeviceCondition> validDeviceConditions = new ArrayList<>();
//        if (jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()) {
//            for (DeviceCondition condition : jobCard.getDeviceConditions()) {
//                if (condition.getId() == null) {
//                    throw new RuntimeException("Invalid device condition");
//                }
//
//                DeviceCondition dbCondition = deviceConditionRepository.findById(condition.getId())
//                        .orElseThrow(() -> new RuntimeException("Device condition not found: " + condition.getId()));
//
//                if (!dbCondition.getIsActive()) {
//                    throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//                }
//                validDeviceConditions.add(dbCondition);
//            }
//        }
//
//        // Load and validate related entities (all optional)
//        jobCard.setBrand(loadBrand(jobCard.getBrand()));
//        jobCard.setModel(loadModel(jobCard.getModel()));
//        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));
//
//        // Set validated collections (can be empty)
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setDeviceConditions(validDeviceConditions);
//
//        // Generate new job number
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        // Set defaults
//        if (jobCard.getOneDayService() == null) {
//            jobCard.setOneDayService(false);
//        }
//        if (jobCard.getWithCharger() == null) {
//            jobCard.setWithCharger(false);
//        }
//        if (jobCard.getTotalServicePrice() == null) {
//            jobCard.setTotalServicePrice(0.0);
//        }
//
//        // Calculate total service price
//        jobCard.calculateTotalServicePrice();
//
//        // Handle device barcode - add as serial
//        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
//            JobCardSerial deviceSerial = new JobCardSerial();
//            deviceSerial.setSerialType("DEVICE_SERIAL");
//            deviceSerial.setSerialValue(jobCard.getDeviceBarcode().trim());
//            deviceSerial.setJobCard(jobCard);
//
//            if (jobCard.getSerials() == null) {
//                jobCard.setSerials(new ArrayList<>());
//            }
//            jobCard.getSerials().add(deviceSerial);
//        }
//
//        // Handle other serials
//        if (jobCard.getSerials() != null) {
//            for (JobCardSerial serial : jobCard.getSerials()) {
//                serial.setJobCard(jobCard);
//            }
//        }
//
//        // Handle used items - MARK SERIALS AS USED
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
//                // Validate serial numbers for serialized items AND MARK THEM AS USED
//                if (invItem.getHasSerialization()) {
//                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty()) {
//                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//                    }
//                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    }
//
//                    // Validate serials are available AND MARK THEM AS USED
//                    for (String serialNumber : item.getUsedSerialNumbers()) {
//                        if (!inventoryService.isSerialAvailable(serialNumber)) {
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        }
//                        // MARK SERIAL AS USED (job card will be saved first to get ID)
//                    }
//                } else {
//                    // For non-serialized items, check stock availability
//                    if (invItem.getQuantity() < item.getQuantityUsed()) {
//                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
//                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
//                    }
//                }
//
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        // Save job card first to get ID
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // ✅ NEW: Increment service count and update last visit for regular customer
//        if (saved.getIsRegularCustomer() && saved.getCustomer() != null) {
//            Customer customer = customerRepository.findById((long) saved.getCustomer().getCustomerId())
//                    .orElse(null);
//
//            if (customer != null) {
//                customer.setTotalServiceCount((customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0) + 1);
//                customer.setLastVisit(LocalDateTime.now());
//                customerRepository.save(customer);
//
//                System.out.println("📊 Customer service count updated: " + customer.getTotalServiceCount());
//                System.out.println("📅 Last visit updated: " + customer.getLastVisit());
//            }
//        }
//
//        // Now mark serials as USED with the job card ID
//        if (saved.getUsedItems() != null && !saved.getUsedItems().isEmpty()) {
//            for (UsedItem item : saved.getUsedItems()) {
//                if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
//                    for (String serialNumber : item.getUsedSerialNumbers()) {
//                        inventoryService.markSerialAsUsed(serialNumber, saved.getId(), saved.getJobNumber());
//                    }
//                }
//            }
//        }
//
//        sendJobCreatedNotification(saved);
//        return saved;
//    }
//
//    /**
//     * Check if barcode already exists
//     */
//    public boolean checkBarcodeExists(String barcode) {
//        // Check in job_card_serials table
//        List<JobCardSerial> existingSerials = jobCardSerialRepository.findBySerialValue(barcode);
//        if (!existingSerials.isEmpty()) {
//            return true;
//        }
//
//        // Check in device_barcode field
//        List<JobCard> existingJobs = jobCardRepository.findByDeviceBarcode(barcode);
//        return !existingJobs.isEmpty();
//    }
//
//    /**
//     * Update job card with serial state management - FIXED VERSION
//     */
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Store current used items to compare later
//        List<UsedItem> oldUsedItems = new ArrayList<>(existing.getUsedItems());
//
//        // Store old status for completion check
//        JobStatus oldStatus = existing.getStatus();
//
//        // Update basic fields
//        if (updateRequest.getCustomerName() != null) {
//            existing.setCustomerName(updateRequest.getCustomerName());
//        }
//        if (updateRequest.getCustomerPhone() != null) {
//            existing.setCustomerPhone(updateRequest.getCustomerPhone());
//        }
//        if (updateRequest.getCustomerEmail() != null) {
//            existing.setCustomerEmail(updateRequest.getCustomerEmail());
//        }
//        if (updateRequest.getDeviceType() != null) {
//            existing.setDeviceType(updateRequest.getDeviceType());
//        }
//        if (updateRequest.getFaultDescription() != null) {
//            existing.setFaultDescription(updateRequest.getFaultDescription());
//        }
//        if (updateRequest.getNotes() != null) {
//            existing.setNotes(updateRequest.getNotes());
//        }
//        if (updateRequest.getEstimatedCost() != null) {
//            existing.setEstimatedCost(updateRequest.getEstimatedCost());
//        }
//        if (updateRequest.getAdvancePayment() != null) {
//            existing.setAdvancePayment(updateRequest.getAdvancePayment());
//        }
//
//        // Update related entities (all optional)
//        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
//        existing.setModel(loadModelById(updateRequest.getModelId()));
//        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));
//
//        // Update device conditions (optional)
//        if (updateRequest.getDeviceConditionIds() != null) {
//            updateDeviceConditionsFromIds(existing, updateRequest.getDeviceConditionIds());
//        } else {
//            existing.clearDeviceConditions();
//        }
//
//        // Update oneDayService
//        if (updateRequest.getOneDayService() != null) {
//            existing.setOneDayService(updateRequest.getOneDayService());
//        }
//
//        if (updateRequest.getWithCharger() != null) {
//            existing.setWithCharger(updateRequest.getWithCharger());
//        }
//
//        // Update faults (optional)
//        if (updateRequest.getFaultIds() != null) {
//            updateFaultsFromIds(existing, updateRequest.getFaultIds());
//        } else {
//            existing.clearFaults();
//        }
//
//        // Update service categories (optional)
//        if (updateRequest.getServiceCategoryIds() != null) {
//            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
//        } else {
//            existing.clearServiceCategories();
//        }
//
//        // Update used items with serial state management - FIXED
//        if (updateRequest.getUsedItems() != null) {
//            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems(), oldUsedItems);
//        } else {
//            // If no used items provided, clear all and release serials
//            releaseAllSerialsFromUsedItems(oldUsedItems);
//            existing.getUsedItems().clear();
//        }
//
//        // Handle status change
//        if (updateRequest.getStatus() != null) {
//            handleStatusChange(existing, updateRequest.getStatus(), oldStatus);
//        }
//
//        // Recalculate total service price
//        existing.calculateTotalServicePrice();
//
//        JobCard saved = jobCardRepository.save(existing);
//        return saved;
//    }
//
//    /**
//     * Update used items with serial state management - FIXED VERSION
//     * Allows serials that are already USED in the same job card
//     */
//    private void updateUsedItemsFromRequest(JobCard existing,
//                                            List<JobCardUpdateRequest.UsedItemRequest> usedItems,
//                                            List<UsedItem> oldUsedItems) {
//
//        // Release serials from removed items
//        releaseSerialsFromRemovedItems(oldUsedItems, usedItems);
//
//        // Clear existing used items
//        existing.getUsedItems().clear();
//
//        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
//            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
//                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));
//
//            UsedItem newUsedItem = new UsedItem();
//            newUsedItem.setJobCard(existing);
//            newUsedItem.setInventoryItem(invItem);
//            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
//            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
//
//            // Set unit price
//            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
//                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
//            } else {
//                newUsedItem.setUnitPrice(invItem.getSellingPrice());
//            }
//
//            // Handle serial numbers - FIXED: Use job-card-specific validation
//            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
//                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));
//
//                // Validate serial numbers for serialized items
//                if (invItem.getHasSerialization()) {
//                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    }
//
//                    // FIXED: Validate serials are available FOR THIS JOB CARD (allows existing USED serials in same job)
//                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
//                        if (!inventoryService.isSerialAvailableForJobCard(serialNumber, existing.getId())) {
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        }
//                        // FIXED: Only mark as USED if not already USED in this job card
//                        if (inventoryService.isSerialAvailable(serialNumber)) {
//                            inventoryService.markSerialAsUsed(serialNumber, existing.getId(), existing.getJobNumber());
//                        }
//                        // If already USED in this job card, no need to mark again
//                    }
//                }
//            } else if (invItem.getHasSerialization()) {
//                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//            } else {
//                // For non-serialized items, check stock
//                if (invItem.getQuantity() < itemRequest.getQuantityUsed()) {
//                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
//                }
//            }
//
//            existing.addUsedItem(newUsedItem);
//            checkInventoryAndNotify(invItem);
//        }
//    }
//
//    /**
//     * Release serials from items that were removed
//     */
//    private void releaseSerialsFromRemovedItems(List<UsedItem> oldUsedItems,
//                                                List<JobCardUpdateRequest.UsedItemRequest> newUsedItems) {
//        for (UsedItem oldItem : oldUsedItems) {
//            boolean stillExists = newUsedItems.stream()
//                    .anyMatch(newItem ->
//                            newItem.getId() != null &&
//                                    newItem.getId().equals(oldItem.getId()));
//
//            if (!stillExists && oldItem.getInventoryItem().getHasSerialization() &&
//                    oldItem.getUsedSerialNumbers() != null) {
//                // Release all serials from removed item
//                for (String serialNumber : oldItem.getUsedSerialNumbers()) {
//                    try {
//                        inventoryService.releaseSerial(serialNumber);
//                        System.out.println("✅ Released serial from removed item: " + serialNumber);
//                    } catch (Exception e) {
//                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
//                    }
//                }
//            }
//        }
//    }
//
//    /**
//     * Release all serials from used items
//     */
//    private void releaseAllSerialsFromUsedItems(List<UsedItem> usedItems) {
//        for (UsedItem item : usedItems) {
//            if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
//                for (String serialNumber : item.getUsedSerialNumbers()) {
//                    try {
//                        inventoryService.releaseSerial(serialNumber);
//                        System.out.println("✅ Released serial: " + serialNumber);
//                    } catch (Exception e) {
//                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
//                    }
//                }
//            }
//        }
//    }
//
//    /**
//     * Cancel job card - UPDATED with status validation and inventory rollback
//     */
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId,
//                                 String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // NEW: Validate job card status
//        if (jobCard.getStatus() != JobStatus.COMPLETED && jobCard.getStatus() != JobStatus.IN_PROGRESS) {
//            throw new RuntimeException("Job card can only be cancelled if status is COMPLETED or IN_PROGRESS. Current status: " + jobCard.getStatus());
//        }
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED) {
//            throw new RuntimeException("Job card is already cancelled");
//        }
//
//        // NEW: Rollback inventory and serials for customer cancellation
//        if ("CUSTOMER".equals(cancelledBy)) {
//            rollbackInventoryFromJobCard(jobCard);
//        } else {
//            // For technician cancellation, just release serials
//            if (jobCard.getUsedItems() != null) {
//                releaseAllSerialsFromUsedItems(jobCard.getUsedItems());
//            }
//        }
//
//        jobCard.setStatus(JobStatus.CANCELLED);
//        jobCard.setCancelledBy(cancelledBy);
//        jobCard.setCancelledByUserId(cancelledByUserId);
//        jobCard.setCancellationReason(reason);
//        jobCard.setCancellationFee(fee != null ? fee : 0.0);
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        // NEW: Create cancellation invoice if customer cancels with fee
//        if ("CUSTOMER".equals(cancelledBy) && fee != null && fee > 0) {
//            createCancellationInvoice(saved, fee, reason);
//        }
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
//                createJobCardPayload(saved),
//                NotificationSeverity.WARNING
//        );
//
//        return saved;
//    }
//
//    /**
//     * NEW: Rollback inventory and serials from job card used items
//     */
//    private void rollbackInventoryFromJobCard(JobCard jobCard) {
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InventoryItem inventoryItem = usedItem.getInventoryItem();
//
//                if (inventoryItem.getHasSerialization()) {
//                    // Release serial numbers back to AVAILABLE
//                    if (usedItem.getUsedSerialNumbers() != null) {
//                        for (String serialNumber : usedItem.getUsedSerialNumbers()) {
//                            try {
//                                releaseSerialForCancellation(serialNumber);
//                            } catch (Exception e) {
//                                System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
//                            }
//                        }
//                    }
//                } else {
//                    // For non-serialized items, add quantity back to inventory
//                    int quantityToRestore = usedItem.getQuantityUsed();
//                    inventoryItem.setQuantity(inventoryItem.getQuantity() + quantityToRestore);
//                    inventoryItemRepository.save(inventoryItem);
//
//                    // Record stock movement for rollback
//                    recordStockMovementForRollback(inventoryItem, quantityToRestore, jobCard);
//                }
//            }
//        }
//    }
//
//    /**
//     * NEW: Release serial for cancellation (mark as AVAILABLE)
//     */
//    private void releaseSerialForCancellation(String serialNumber) {
//        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));
//
//        if (serial.getStatus() == SerialStatus.USED) {
//            serial.setStatus(SerialStatus.AVAILABLE);
//            serial.setUsedAt(null);
//            serial.setUsedBy(null);
//            serial.setUsedInReferenceType(null);
//            serial.setUsedInReferenceId(null);
//            serial.setUsedInReferenceNumber(null);
//            serial.setNotes((serial.getNotes() != null ? serial.getNotes() + " " : "") +
//                    "[Released from cancelled job card at " + LocalDateTime.now() + "]");
//
//            inventorySerialRepository.save(serial);
//            System.out.println("✅ Serial released to AVAILABLE from cancellation: " + serialNumber);
//        }
//    }
//
//    /**
//     * NEW: Record stock movement for inventory rollback
//     */
//    private void recordStockMovementForRollback(InventoryItem item, Integer quantity, JobCard jobCard) {
//        StockMovement movement = new StockMovement();
//        movement.setInventoryItem(item);
//        movement.setMovementType(MovementType.IN); // IN for rollback
//        movement.setQuantity(quantity);
//        movement.setReferenceType("CANCELLATION_ROLLBACK");
//        movement.setReferenceId(jobCard.getId());
//        movement.setReferenceNumber(jobCard.getJobNumber());
//        movement.setReason("Inventory restored from cancelled job card");
//        movement.setPerformedBy(getCurrentUsername());
//
//        int previousQuantity = item.getQuantity() - quantity;
//        int newQuantity = item.getQuantity();
//        movement.setPreviousQuantity(previousQuantity);
//        movement.setNewQuantity(newQuantity);
//
//        stockMovementRepository.save(movement);
//        System.out.println("📝 Recorded rollback stock movement for " + item.getName() + ": +" + quantity);
//    }
//
//    /**
//     * ✅ UPDATED: Create cancellation invoice using same numbering as regular invoices
//     * Now uses: INV-YYYYMMDD-XXXXX format instead of CANCEL-JOB-... format
//     */
//    private void createCancellationInvoice(JobCard jobCard, Double fee, String reason) {
//        try {
//            // ✅ FIXED: Use same invoice numbering system as regular invoices
//            String invoiceNumber = generateInvoiceNumber();
//
//            Invoice invoice = new Invoice();
//            invoice.setInvoiceNumber(invoiceNumber);
//            invoice.setJobCard(jobCard);
//            invoice.setCustomerName(jobCard.getCustomerName());
//            invoice.setCustomerPhone(jobCard.getCustomerPhone());
//            invoice.setCustomerEmail(jobCard.getCustomerEmail());
//            invoice.setPaymentMethod(PaymentMethod.CASH);
//
//            // Create cancellation fee item
//            InvoiceItem feeItem = new InvoiceItem();
//            feeItem.setInvoice(invoice);
//            feeItem.setItemName("Cancellation Fee - " + jobCard.getJobNumber());
//            feeItem.setItemCode("CANCEL-FEE");
//            feeItem.setQuantity(1);
//            feeItem.setUnitPrice(fee);
//            feeItem.setTotal(fee);
//            feeItem.setWarranty("No Warranty");
//            feeItem.setItemType("CANCELLATION_FEE");
//
//            invoice.setItems(List.of(feeItem));
//
//            // Set totals
//            invoice.setSubtotal(fee);
//            invoice.setTotal(fee);
//            invoice.setPaidAmount(0.0); // UNPAID
//            invoice.setBalance(fee);
//            invoice.setPaymentStatus(PaymentStatus.UNPAID); // Set as UNPAID
//            invoice.setPaymentMethod(PaymentMethod.CASH);
//
//            // Save invoice
//            invoiceRepository.save(invoice);
//
//            System.out.println("✅ Created cancellation invoice: " + invoiceNumber + " for job: " + jobCard.getJobNumber());
//            System.out.println("   Amount: Rs." + fee);
//            System.out.println("   Status: UNPAID");
//            System.out.println("   Reason: " + reason);
//
//            notificationService.sendNotification(
//                    NotificationType.INVOICE_CREATED,
//                    "Cancellation invoice created: " + invoiceNumber +
//                            " | Amount: Rs." + fee +
//                            " | Job: " + jobCard.getJobNumber(),
//                    createJobCardPayload(jobCard),
//                    NotificationSeverity.WARNING
//            );
//
//        } catch (Exception e) {
//            System.err.println("❌ Failed to create cancellation invoice: " + e.getMessage());
//            e.printStackTrace();
//            // Don't throw - cancellation should proceed even if invoice creation fails
//        }
//    }
//
//    /**
//     * Get current username
//     */
//    private String getCurrentUsername() {
//        try {
//            return SecurityContextHolder.getContext().getAuthentication().getName();
//        } catch (Exception e) {
//            return "SYSTEM";
//        }
//    }
//
//    /**
//     * Delete job card (Admin only) - UPDATED with status validation
//     */
//    @Transactional
//    public void deleteJobCard(Long id, String reason) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // UPDATED: Only allow deletion of PENDING or CANCELLED job cards
//        if (jobCard.getStatus() != JobStatus.PENDING && jobCard.getStatus() != JobStatus.CANCELLED) {
//            throw new RuntimeException("Can only delete PENDING or CANCELLED job cards. Current status: " + jobCard.getStatus());
//        }
//
//        // Delete associated serials first
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty()) {
//            jobCardSerialRepository.deleteAll(jobCard.getSerials());
//        }
//
//        // Delete used items and their serials
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                if (usedItem.getUsedSerialNumbers() != null) {
//                    for (String serialNumber : usedItem.getUsedSerialNumbers()) {
//                        try {
//                            inventoryService.releaseSerial(serialNumber);
//                        } catch (Exception e) {
//                            System.err.println("Error releasing serial on delete: " + e.getMessage());
//                        }
//                    }
//                }
//            }
//        }
//
//        jobCardRepository.delete(jobCard);
//
//        notificationService.sendNotification(
//                NotificationType.JOB_CANCELLED,
//                "Job card deleted: " + jobCard.getJobNumber() + " | Reason: " + reason,
//                createJobCardPayload(jobCard),
//                NotificationSeverity.WARNING
//        );
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
//                createJobCardPayload(saved),
//                NotificationSeverity.WARNING
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
//                createJobCardPayload(saved),
//                NotificationSeverity.WARNING
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
//                createJobCardPayload(saved),
//                NotificationSeverity.INFO
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
//                createJobCardPayload(saved),
//                NotificationSeverity.INFO
//        );
//
//        return saved;
//    }
//
//    /**
//     * Add device condition to an existing job card
//     */
//    @Transactional
//    public JobCard addDeviceConditionToJobCard(Long jobCardId, Long deviceConditionId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId)
//                .orElseThrow(() -> new RuntimeException("Device condition not found"));
//
//        if (!deviceCondition.getIsActive()) {
//            throw new RuntimeException("Device condition is inactive");
//        }
//
//        jobCard.addDeviceCondition(deviceCondition);
//        return jobCardRepository.save(jobCard);
//    }
//
//    /**
//     * Remove device condition from an existing job card
//     */
//    @Transactional
//    public JobCard removeDeviceConditionFromJobCard(Long jobCardId, Long deviceConditionId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId)
//                .orElseThrow(() -> new RuntimeException("Device condition not found"));
//
//        jobCard.removeDeviceCondition(deviceCondition);
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
//    public JobCard removeServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
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
//     * Add serial to an existing job card
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
//     * Handle status change
//     */
//    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
//        jobCard.setStatus(newStatus);
//
//        // Handle completion
//        if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//            jobCard.setCompletedAt(LocalDateTime.now());
//
//            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//            notificationService.sendNotification(
//                    NotificationType.JOB_COMPLETED,
//                    "Job completed: " + jobCard.getJobNumber() + priorityInfo +
//                            " (Serials remain USED until invoice payment)",
//                    createJobCardPayload(jobCard),
//                    NotificationSeverity.SUCCESS
//            );
//        }
//
//        // Handle status change notifications
//        if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL)
//                && oldStatus != newStatus) {
//            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//            notificationService.sendNotification(
//                    NotificationType.JOB_STATUS_CHANGED,
//                    "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
//                    createJobCardPayload(jobCard),
//                    NotificationSeverity.WARNING
//            );
//        }
//    }
//
//    /**
//     * Update device conditions from IDs
//     */
//    private void updateDeviceConditionsFromIds(JobCard existing, List<Long> deviceConditionIds) {
//        existing.clearDeviceConditions();
//        for (Long conditionId : deviceConditionIds) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(conditionId)
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + conditionId));
//            if (!dbCondition.getIsActive()) {
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            }
//            existing.addDeviceCondition(dbCondition);
//        }
//    }
//
//    /**
//     * Update faults from IDs
//     */
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
//    /**
//     * Update service categories from IDs
//     */
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
//     * Helper methods for loading related entities by ID
//     */
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
//    /**
//     * Original helper methods for entity loading
//     */
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
//    /**
//     * Check inventory level and send notification if low stock
//     */
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item,
//                    NotificationSeverity.WARNING
//            );
//        }
//    }
//
//    /**
//     * Send job created notification
//     */
//    private void sendJobCreatedNotification(JobCard jobCard) {
//        String faultNames = jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()
//                ? jobCard.getFaults().stream()
//                .map(Fault::getFaultName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No faults")
//                : "No faults selected";
//
//        String serviceNames = jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()
//                ? jobCard.getServiceCategories().stream()
//                .map(ServiceCategory::getName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No services")
//                : "No services selected";
//
//        String deviceConditionNames = jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()
//                ? jobCard.getDeviceConditions().stream()
//                .map(DeviceCondition::getConditionName)
//                .reduce((a, b) -> a + ", " + b)
//                .orElse("No conditions")
//                : "No conditions selected";
//
//        String faultDescriptionInfo = jobCard.getFaultDescription() != null && !jobCard.getFaultDescription().isEmpty()
//                ? "Fault desc: " + (jobCard.getFaultDescription().length() > 50
//                ? jobCard.getFaultDescription().substring(0, 50) + "..."
//                : jobCard.getFaultDescription())
//                : "No fault description";
//
//        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//
//        notificationService.sendNotification(
//                NotificationType.PENDING_JOB,
//                "New job card created: " + jobCard.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Device Conditions: " + deviceConditionNames +
//                        " - " + faultDescriptionInfo +
//                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
//                        priorityInfo,
//                createJobCardPayload(jobCard),
//                NotificationSeverity.INFO
//        );
//    }
//
//    // ========== GETTER METHODS ==========
//
//    public List<JobCard> getAllJobCards() {
//        return jobCardRepository.findAll();
//    }
//
//    public JobCard getJobCardById(Long id) {
//        return jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//    }
//
//    public JobCard getJobCardByNumber(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    public JobCard getJobCardByDeviceSerial(String jobNumber) {
//        return jobCardRepository.findByJobNumber(jobNumber)
//                .orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber));
//    }
//
//    public List<JobCard> getJobCardsByStatus(JobStatus status) {
//        return jobCardRepository.findByStatus(status);
//    }
//
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) {
//        return jobCardRepository.findByServiceCategoriesId(serviceCategoryId);
//    }
//
//    public List<JobCard> getPendingJobsOlderThanDays(int days) {
//        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
//        return jobCardRepository.findPendingJobsOlderThan(JobStatus.PENDING, threshold);
//    }
//
//    public List<JobCard> getJobsWaitingForParts() {
//        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS);
//    }
//
//    public List<JobCard> getJobsWaitingForApproval() {
//        return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL);
//    }
//
//    /**
//     * Search job cards by device serial number (from JobCardSerial)
//     */
//    public List<JobCard> getJobCardByDeviceSerialNumber(String serialNumber) {
//        return jobCardRepository.findByDeviceSerialNumber(serialNumber);
//    }
//
//    /**
//     * General search across all fields (including serials and faults)
//     */
//    public List<JobCard> searchJobCards(String query) {
//        return jobCardRepository.searchJobCards(query);
//    }
//
//    /**
//     * Search job cards by barcode (partial match for search functionality)
//     */
//    public List<JobCard> searchJobCardsByBarcode(String barcode) {
//        return jobCardRepository.searchJobCards(barcode);
//    }
//
//    /**
//     * Get job cards by device barcode (exact match)
//     */
//    public List<JobCard> getJobCardByBarcode(String barcode) {
//        return jobCardRepository.findByDeviceBarcode(barcode);
//    }
//
//    /**
//     * Get job card statistics including sequence info
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
//        // Get last job number
//        String lastJobNumber = jobCardRepository.findMaxJobNumber().orElse("No jobs yet");
//        String nextJobNumber = generateJobNumber();
//
//        return new JobCardStatistics(total, pending, inProgress, waitingForParts,
//                waitingForApproval, completed, delivered, cancelled,
//                lastJobNumber, nextJobNumber);
//    }
//
//    public Object removeServiceCategoryFromJobCard(Long id, Long serviceCategoryId) {
//        return null;
//    }
//
//    /**
//     * Get next job number preview (for testing)
//     */
//    public String getNextJobNumberPreview() {
//        return generateJobNumber();
//    }
//
//    /**
//     * Get today's job numbers
//     */
//    @Transactional(readOnly = true)
//    public List<String> getTodayJobNumbers() {
//        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
//        return jobCardRepository.findAll().stream()
//                .filter(job -> job.getCreatedAt().isAfter(startOfDay))
//                .map(JobCard::getJobNumber)
//                .sorted()
//                .toList();
//    }
//
//    /**
//     * Statistics DTO - updated to include sequence info
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
//        public final String lastJobNumber;
//        public final String nextJobNumber;
//
//        public JobCardStatistics(Long total, Long pending, Long inProgress,
//                                 Long waitingForParts, Long waitingForApproval,
//                                 Long completed, Long delivered, Long cancelled,
//                                 String lastJobNumber, String nextJobNumber) {
//            this.total = total;
//            this.pending = pending;
//            this.inProgress = inProgress;
//            this.waitingForParts = waitingForParts;
//            this.waitingForApproval = waitingForApproval;
//            this.completed = completed;
//            this.delivered = delivered;
//            this.cancelled = cancelled;
//            this.lastJobNumber = lastJobNumber;
//            this.nextJobNumber = nextJobNumber;
//        }
//    }
//}


package com.example.demo.service;

import com.example.demo.dto.JobCardUpdateRequest;
import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class JobCardService {
    private final CustomerRepository customerRepository;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String JOB_NUMBER_PREFIX = "JOB-";
    private static final Pattern JOB_NUMBER_PATTERN = Pattern.compile("^JOB-(\\d{8})-(\\d{6})$");

    private Map<String, Object> createJobCardPayload(JobCard jobCard) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", jobCard.getId());
        payload.put("jobNumber", jobCard.getJobNumber());
        payload.put("customerName", jobCard.getCustomerName());
        payload.put("customerPhone", jobCard.getCustomerPhone());
        payload.put("deviceType", jobCard.getDeviceType());
        payload.put("status", jobCard.getStatus());
        payload.put("oneDayService", jobCard.getOneDayService());
        payload.put("totalServicePrice", jobCard.getTotalServicePrice());
        payload.put("createdAt", jobCard.getCreatedAt());
        return payload;
    }

    private String generateJobNumber() {
        String today = LocalDate.now().format(DATE_FORMATTER);
        Optional<String> lastJobNumber = jobCardRepository.findMaxJobNumber();
        int nextNumber;
        if (lastJobNumber.isPresent()) {
            String lastNumberStr = lastJobNumber.get();
            Matcher matcher = JOB_NUMBER_PATTERN.matcher(lastNumberStr);
            if (matcher.matches()) {
                String sequenceStr = matcher.group(2);
                int lastSequence = Integer.parseInt(sequenceStr);
                nextNumber = lastSequence + 1;
            } else {
                nextNumber = findMaxSequenceNumber() + 1;
            }
        } else {
            nextNumber = 800;
        }
        return String.format("JOB-%s-%06d", today, nextNumber);
    }

    private String generateInvoiceNumber() {
        Long count = invoiceRepository.count();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String datePart = sdf.format(new Date());
        String sequencePart = String.format("%05d", (count + 1));
        return "INV-" + datePart + "-" + sequencePart;
    }

    private int findMaxSequenceNumber() {
        List<JobCard> allJobCards = jobCardRepository.findAll();
        int maxSequence = 799;
        for (JobCard job : allJobCards) {
            String jobNumber = job.getJobNumber();
            Matcher matcher = JOB_NUMBER_PATTERN.matcher(jobNumber);
            if (matcher.matches()) {
                try {
                    int sequence = Integer.parseInt(matcher.group(2));
                    if (sequence > maxSequence) maxSequence = sequence;
                } catch (NumberFormatException e) {
                    // Skip
                }
            }
        }
        return maxSequence;
    }

    /**
     * Helper: get effective price for an inventory item based on customer type
     */
    private double getEffectiveItemPrice(InventoryItem item, boolean isRegularCustomer) {
        if (isRegularCustomer && item.getSpecialPrice() != null) {
            return item.getSpecialPrice();
        }
        return item.getSellingPrice();
    }

    /**
     * Helper: calculate total service price based on customer type
     */
    private double calculateServiceTotal(List<ServiceCategory> services, boolean isRegularCustomer) {
        return services.stream()
                .mapToDouble(s -> {
                    if (isRegularCustomer && s.getSpecialServicePrice() != null) {
                        return s.getSpecialServicePrice();
                    }
                    return s.getServicePrice();
                })
                .sum();
    }

    @Transactional
    public JobCard createJobCard(JobCard jobCard) {
        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());

        if (isRegular && jobCard.getCustomer() != null) {
            Customer regularCustomer = customerRepository.findById((long) jobCard.getCustomer().getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            jobCard.loadCustomerData(regularCustomer);
            System.out.println("✓ Regular customer loaded: " + regularCustomer.getCustomerName());
        }

        if (jobCard.getCustomerName() == null || jobCard.getCustomerName().trim().isEmpty())
            throw new RuntimeException("Customer name is required");
        if (jobCard.getCustomerPhone() == null || jobCard.getCustomerPhone().trim().isEmpty())
            throw new RuntimeException("Customer phone is required");
        if (jobCard.getDeviceType() == null || jobCard.getDeviceType().trim().isEmpty())
            throw new RuntimeException("Device type is required");

        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
            if (checkBarcodeExists(jobCard.getDeviceBarcode()))
                throw new RuntimeException("Device barcode already exists: " + jobCard.getDeviceBarcode());
        }

        List<Fault> validFaults = new ArrayList<>();
        if (jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()) {
            for (Fault fault : jobCard.getFaults()) {
                if (fault.getId() == null) throw new RuntimeException("Invalid fault");
                Fault dbFault = faultRepository.findById(fault.getId())
                        .orElseThrow(() -> new RuntimeException("Fault not found"));
                if (!dbFault.getIsActive())
                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
                validFaults.add(dbFault);
            }
        }

        List<ServiceCategory> validServices = new ArrayList<>();
        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
            for (ServiceCategory service : jobCard.getServiceCategories()) {
                if (service.getId() == null) throw new RuntimeException("Invalid service category");
                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
                if (!dbService.getIsActive())
                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
                validServices.add(dbService);
            }
        }

        List<DeviceCondition> validDeviceConditions = new ArrayList<>();
        if (jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()) {
            for (DeviceCondition condition : jobCard.getDeviceConditions()) {
                if (condition.getId() == null) throw new RuntimeException("Invalid device condition");
                DeviceCondition dbCondition = deviceConditionRepository.findById(condition.getId())
                        .orElseThrow(() -> new RuntimeException("Device condition not found: " + condition.getId()));
                if (!dbCondition.getIsActive())
                    throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
                validDeviceConditions.add(dbCondition);
            }
        }

        jobCard.setBrand(loadBrand(jobCard.getBrand()));
        jobCard.setModel(loadModel(jobCard.getModel()));
        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));
        jobCard.setFaults(validFaults);
        jobCard.setServiceCategories(validServices);
        jobCard.setDeviceConditions(validDeviceConditions);
        jobCard.setJobNumber(generateJobNumber());
        jobCard.setStatus(JobStatus.PENDING);

        if (jobCard.getOneDayService() == null) jobCard.setOneDayService(false);
        if (jobCard.getWithCharger() == null) jobCard.setWithCharger(false);
        if (jobCard.getTotalServicePrice() == null) jobCard.setTotalServicePrice(0.0);

        // ✅ Use special pricing for regular customers
        if (isRegular) {
            jobCard.setTotalServicePrice(calculateServiceTotal(validServices, true));
        } else {
            jobCard.calculateTotalServicePrice();
        }

        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
            JobCardSerial deviceSerial = new JobCardSerial();
            deviceSerial.setSerialType("DEVICE_SERIAL");
            deviceSerial.setSerialValue(jobCard.getDeviceBarcode().trim());
            deviceSerial.setJobCard(jobCard);
            if (jobCard.getSerials() == null) jobCard.setSerials(new ArrayList<>());
            jobCard.getSerials().add(deviceSerial);
        }

        if (jobCard.getSerials() != null) {
            for (JobCardSerial serial : jobCard.getSerials()) serial.setJobCard(jobCard);
        }

        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem item : jobCard.getUsedItems()) {
                item.setJobCard(jobCard);
                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));

                // ✅ Use special price for regular customers
                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
                    item.setUnitPrice(getEffectiveItemPrice(invItem, isRegular));
                }

                if (item.getWarrantyPeriod() == null) item.setWarrantyPeriod("No Warranty");

                if (invItem.getHasSerialization()) {
                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty())
                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed())
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    for (String serialNumber : item.getUsedSerialNumbers()) {
                        if (!inventoryService.isSerialAvailable(serialNumber))
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                    }
                } else {
                    if (invItem.getQuantity() < item.getQuantityUsed())
                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
                }
                checkInventoryAndNotify(invItem);
            }
        }

        JobCard saved = jobCardRepository.save(jobCard);

        if (Boolean.TRUE.equals(saved.getIsRegularCustomer()) && saved.getCustomer() != null) {
            Customer customer = customerRepository.findById((long) saved.getCustomer().getCustomerId()).orElse(null);
            if (customer != null) {
                customer.setTotalServiceCount((customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0) + 1);
                customer.setLastVisit(LocalDateTime.now());
                customerRepository.save(customer);
            }
        }

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

    public boolean checkBarcodeExists(String barcode) {
        List<JobCardSerial> existingSerials = jobCardSerialRepository.findBySerialValue(barcode);
        if (!existingSerials.isEmpty()) return true;
        List<JobCard> existingJobs = jobCardRepository.findByDeviceBarcode(barcode);
        return !existingJobs.isEmpty();
    }

    @Transactional
    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
        JobCard existing = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        List<UsedItem> oldUsedItems = new ArrayList<>(existing.getUsedItems());
        JobStatus oldStatus = existing.getStatus();

        if (updateRequest.getCustomerName() != null) existing.setCustomerName(updateRequest.getCustomerName());
        if (updateRequest.getCustomerPhone() != null) existing.setCustomerPhone(updateRequest.getCustomerPhone());
        if (updateRequest.getCustomerEmail() != null) existing.setCustomerEmail(updateRequest.getCustomerEmail());
        if (updateRequest.getDeviceType() != null) existing.setDeviceType(updateRequest.getDeviceType());
        if (updateRequest.getFaultDescription() != null) existing.setFaultDescription(updateRequest.getFaultDescription());
        if (updateRequest.getNotes() != null) existing.setNotes(updateRequest.getNotes());
        if (updateRequest.getEstimatedCost() != null) existing.setEstimatedCost(updateRequest.getEstimatedCost());
        if (updateRequest.getAdvancePayment() != null) existing.setAdvancePayment(updateRequest.getAdvancePayment());

        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
        existing.setModel(loadModelById(updateRequest.getModelId()));
        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));

        if (updateRequest.getDeviceConditionIds() != null)
            updateDeviceConditionsFromIds(existing, updateRequest.getDeviceConditionIds());
        else
            existing.clearDeviceConditions();

        if (updateRequest.getOneDayService() != null) existing.setOneDayService(updateRequest.getOneDayService());
        if (updateRequest.getWithCharger() != null) existing.setWithCharger(updateRequest.getWithCharger());

        if (updateRequest.getFaultIds() != null) updateFaultsFromIds(existing, updateRequest.getFaultIds());
        else existing.clearFaults();

        if (updateRequest.getServiceCategoryIds() != null)
            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
        else
            existing.clearServiceCategories();

        if (updateRequest.getUsedItems() != null)
            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems(), oldUsedItems);
        else {
            releaseAllSerialsFromUsedItems(oldUsedItems);
            existing.getUsedItems().clear();
        }

        if (updateRequest.getStatus() != null) handleStatusChange(existing, updateRequest.getStatus(), oldStatus);

        // ✅ Recalculate with special pricing
        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
        if (isRegular) {
            existing.setTotalServicePrice(calculateServiceTotal(existing.getServiceCategories(), true));
        } else {
            existing.calculateTotalServicePrice();
        }

        return jobCardRepository.save(existing);
    }

    private void updateUsedItemsFromRequest(JobCard existing,
                                            List<JobCardUpdateRequest.UsedItemRequest> usedItems,
                                            List<UsedItem> oldUsedItems) {
        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
        releaseSerialsFromRemovedItems(oldUsedItems, usedItems);
        existing.getUsedItems().clear();

        for (JobCardUpdateRequest.UsedItemRequest itemRequest : usedItems) {
            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));

            UsedItem newUsedItem = new UsedItem();
            newUsedItem.setJobCard(existing);
            newUsedItem.setInventoryItem(invItem);
            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");

            // ✅ Use special price for regular customers
            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
            } else {
                newUsedItem.setUnitPrice(getEffectiveItemPrice(invItem, isRegular));
            }

            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));
                if (invItem.getHasSerialization()) {
                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed())
                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
                        if (!inventoryService.isSerialAvailableForJobCard(serialNumber, existing.getId()))
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        if (inventoryService.isSerialAvailable(serialNumber))
                            inventoryService.markSerialAsUsed(serialNumber, existing.getId(), existing.getJobNumber());
                    }
                }
            } else if (invItem.getHasSerialization()) {
                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
            } else {
                if (invItem.getQuantity() < itemRequest.getQuantityUsed())
                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
            }

            existing.addUsedItem(newUsedItem);
            checkInventoryAndNotify(invItem);
        }
    }

    private void releaseSerialsFromRemovedItems(List<UsedItem> oldUsedItems,
                                                List<JobCardUpdateRequest.UsedItemRequest> newUsedItems) {
        for (UsedItem oldItem : oldUsedItems) {
            boolean stillExists = newUsedItems.stream()
                    .anyMatch(newItem -> newItem.getId() != null && newItem.getId().equals(oldItem.getId()));
            if (!stillExists && oldItem.getInventoryItem().getHasSerialization() && oldItem.getUsedSerialNumbers() != null) {
                for (String serialNumber : oldItem.getUsedSerialNumbers()) {
                    try {
                        inventoryService.releaseSerial(serialNumber);
                    } catch (Exception e) {
                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    private void releaseAllSerialsFromUsedItems(List<UsedItem> usedItems) {
        for (UsedItem item : usedItems) {
            if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
                for (String serialNumber : item.getUsedSerialNumbers()) {
                    try {
                        inventoryService.releaseSerial(serialNumber);
                    } catch (Exception e) {
                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId, String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() != JobStatus.COMPLETED && jobCard.getStatus() != JobStatus.IN_PROGRESS)
            throw new RuntimeException("Job card can only be cancelled if status is COMPLETED or IN_PROGRESS. Current status: " + jobCard.getStatus());

        if (jobCard.getStatus() == JobStatus.CANCELLED)
            throw new RuntimeException("Job card is already cancelled");

        if ("CUSTOMER".equals(cancelledBy)) {
            rollbackInventoryFromJobCard(jobCard);
        } else {
            if (jobCard.getUsedItems() != null) releaseAllSerialsFromUsedItems(jobCard.getUsedItems());
        }

        jobCard.setStatus(JobStatus.CANCELLED);
        jobCard.setCancelledBy(cancelledBy);
        jobCard.setCancelledByUserId(cancelledByUserId);
        jobCard.setCancellationReason(reason);
        jobCard.setCancellationFee(fee != null ? fee : 0.0);

        JobCard saved = jobCardRepository.save(jobCard);

        if ("CUSTOMER".equals(cancelledBy) && fee != null && fee > 0)
            createCancellationInvoice(saved, fee, reason);

        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
        notificationService.sendNotification(NotificationType.JOB_CANCELLED,
                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
                createJobCardPayload(saved), NotificationSeverity.WARNING);

        return saved;
    }

    private void rollbackInventoryFromJobCard(JobCard jobCard) {
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InventoryItem inventoryItem = usedItem.getInventoryItem();
                if (inventoryItem.getHasSerialization()) {
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
                    int quantityToRestore = usedItem.getQuantityUsed();
                    inventoryItem.setQuantity(inventoryItem.getQuantity() + quantityToRestore);
                    inventoryItemRepository.save(inventoryItem);
                    recordStockMovementForRollback(inventoryItem, quantityToRestore, jobCard);
                }
            }
        }
    }

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
        }
    }

    private void recordStockMovementForRollback(InventoryItem item, Integer quantity, JobCard jobCard) {
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(item);
        movement.setMovementType(MovementType.IN);
        movement.setQuantity(quantity);
        movement.setReferenceType("CANCELLATION_ROLLBACK");
        movement.setReferenceId(jobCard.getId());
        movement.setReferenceNumber(jobCard.getJobNumber());
        movement.setReason("Inventory restored from cancelled job card");
        movement.setPerformedBy(getCurrentUsername());
        int previousQuantity = item.getQuantity() - quantity;
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(item.getQuantity());
        stockMovementRepository.save(movement);
    }

    private void createCancellationInvoice(JobCard jobCard, Double fee, String reason) {
        try {
            String invoiceNumber = generateInvoiceNumber();
            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setJobCard(jobCard);
            invoice.setCustomerName(jobCard.getCustomerName());
            invoice.setCustomerPhone(jobCard.getCustomerPhone());
            invoice.setCustomerEmail(jobCard.getCustomerEmail());
            invoice.setPaymentMethod(PaymentMethod.CASH);

            InvoiceItem feeItem = new InvoiceItem();
            feeItem.setInvoice(invoice);
            feeItem.setItemName("Cancellation Fee - " + jobCard.getJobNumber());
            feeItem.setItemCode("CANCEL-FEE");
            feeItem.setQuantity(1);
            feeItem.setUnitPrice(fee);
            feeItem.setTotal(fee);
            feeItem.setWarranty("No Warranty");
            feeItem.setItemType("CANCELLATION_FEE");

            invoice.setItems(List.of(feeItem));
            invoice.setSubtotal(fee);
            invoice.setTotal(fee);
            invoice.setPaidAmount(0.0);
            invoice.setBalance(fee);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);

            invoiceRepository.save(invoice);

            notificationService.sendNotification(NotificationType.INVOICE_CREATED,
                    "Cancellation invoice created: " + invoiceNumber + " | Amount: Rs." + fee + " | Job: " + jobCard.getJobNumber(),
                    createJobCardPayload(jobCard), NotificationSeverity.WARNING);
        } catch (Exception e) {
            System.err.println("❌ Failed to create cancellation invoice: " + e.getMessage());
        }
    }

    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    @Transactional
    public void deleteJobCard(Long id, String reason) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() != JobStatus.PENDING && jobCard.getStatus() != JobStatus.CANCELLED)
            throw new RuntimeException("Can only delete PENDING or CANCELLED job cards. Current status: " + jobCard.getStatus());

        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty())
            jobCardSerialRepository.deleteAll(jobCard.getSerials());

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
        notificationService.sendNotification(NotificationType.JOB_CANCELLED,
                "Job card deleted: " + jobCard.getJobNumber() + " | Reason: " + reason,
                createJobCardPayload(jobCard), NotificationSeverity.WARNING);
    }

    @Transactional
    public JobCard markWaitingForParts(Long id) {
        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
        if (jobCard.getStatus() == JobStatus.WAITING_FOR_PARTS) throw new RuntimeException("Job card is already waiting for parts");
        jobCard.markWaitingForParts();
        JobCard saved = jobCardRepository.save(jobCard);
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is waiting for parts" + priorityInfo,
                createJobCardPayload(saved), NotificationSeverity.WARNING);
        return saved;
    }

    @Transactional
    public JobCard markWaitingForApproval(Long id) {
        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
        if (jobCard.getStatus() == JobStatus.WAITING_FOR_APPROVAL) throw new RuntimeException("Job card is already waiting for approval");
        jobCard.markWaitingForApproval();
        JobCard saved = jobCardRepository.save(jobCard);
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is waiting for approval" + priorityInfo,
                createJobCardPayload(saved), NotificationSeverity.WARNING);
        return saved;
    }

    @Transactional
    public JobCard markInProgress(Long id) {
        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
        if (jobCard.getStatus() == JobStatus.IN_PROGRESS) throw new RuntimeException("Job card is already in progress");
        jobCard.markInProgress();
        JobCard saved = jobCardRepository.save(jobCard);
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " is back in progress" + priorityInfo,
                createJobCardPayload(saved), NotificationSeverity.INFO);
        return saved;
    }

    @Transactional
    public JobCard markPending(Long id) {
        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
        if (jobCard.getStatus() == JobStatus.PENDING) throw new RuntimeException("Job card is already pending");
        jobCard.setStatus(JobStatus.PENDING);
        jobCard.setUpdatedAt(LocalDateTime.now());
        JobCard saved = jobCardRepository.save(jobCard);
        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
                "Job card " + saved.getJobNumber() + " marked as pending" + priorityInfo,
                createJobCardPayload(saved), NotificationSeverity.INFO);
        return saved;
    }

    @Transactional
    public JobCard addDeviceConditionToJobCard(Long jobCardId, Long deviceConditionId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId).orElseThrow(() -> new RuntimeException("Device condition not found"));
        if (!deviceCondition.getIsActive()) throw new RuntimeException("Device condition is inactive");
        jobCard.addDeviceCondition(deviceCondition);
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard removeDeviceConditionFromJobCard(Long jobCardId, Long deviceConditionId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId).orElseThrow(() -> new RuntimeException("Device condition not found"));
        jobCard.removeDeviceCondition(deviceCondition);
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        Fault fault = faultRepository.findById(faultId).orElseThrow(() -> new RuntimeException("Fault not found"));
        if (!fault.getIsActive()) throw new RuntimeException("Fault is inactive");
        jobCard.addFault(fault);
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        Fault fault = faultRepository.findById(faultId).orElseThrow(() -> new RuntimeException("Fault not found"));
        jobCard.removeFault(fault);
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId).orElseThrow(() -> new RuntimeException("Service category not found"));
        if (!service.getIsActive()) throw new RuntimeException("Service category is inactive");
        jobCard.addServiceCategory(service);
        // ✅ Recalculate with correct pricing
        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
        if (isRegular) {
            jobCard.setTotalServicePrice(calculateServiceTotal(jobCard.getServiceCategories(), true));
        } else {
            jobCard.calculateTotalServicePrice();
        }
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard removeServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId).orElseThrow(() -> new RuntimeException("Service category not found"));
        jobCard.removeServiceCategory(service);
        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
        if (isRegular) {
            jobCard.setTotalServicePrice(calculateServiceTotal(jobCard.getServiceCategories(), true));
        } else {
            jobCard.calculateTotalServicePrice();
        }
        return jobCardRepository.save(jobCard);
    }

    @Transactional
    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
        jobCard.addSerial(serial);
        return jobCardRepository.save(jobCard);
    }

    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
        jobCard.setStatus(newStatus);
        if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
            jobCard.setCompletedAt(LocalDateTime.now());
            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
            notificationService.sendNotification(NotificationType.JOB_COMPLETED,
                    "Job completed: " + jobCard.getJobNumber() + priorityInfo + " (Serials remain USED until invoice payment)",
                    createJobCardPayload(jobCard), NotificationSeverity.SUCCESS);
        }
        if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL) && oldStatus != newStatus) {
            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
            notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
                    "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
                    createJobCardPayload(jobCard), NotificationSeverity.WARNING);
        }
    }

    private void updateDeviceConditionsFromIds(JobCard existing, List<Long> deviceConditionIds) {
        existing.clearDeviceConditions();
        for (Long conditionId : deviceConditionIds) {
            DeviceCondition dbCondition = deviceConditionRepository.findById(conditionId)
                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + conditionId));
            if (!dbCondition.getIsActive())
                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
            existing.addDeviceCondition(dbCondition);
        }
    }

    private void updateFaultsFromIds(JobCard existing, List<Long> faultIds) {
        existing.clearFaults();
        for (Long faultId : faultIds) {
            Fault dbFault = faultRepository.findById(faultId)
                    .orElseThrow(() -> new RuntimeException("Fault not found: " + faultId));
            if (!dbFault.getIsActive())
                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
            existing.addFault(dbFault);
        }
    }

    private void updateServiceCategoriesFromIds(JobCard existing, List<Long> serviceCategoryIds) {
        existing.clearServiceCategories();
        for (Long serviceCategoryId : serviceCategoryIds) {
            ServiceCategory dbService = serviceCategoryRepository.findById(serviceCategoryId)
                    .orElseThrow(() -> new RuntimeException("Service category not found: " + serviceCategoryId));
            if (!dbService.getIsActive())
                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
            existing.addServiceCategory(dbService);
        }
        // ✅ Use special pricing for regular customers
        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
        if (isRegular) {
            existing.setTotalServicePrice(calculateServiceTotal(existing.getServiceCategories(), true));
        } else {
            existing.calculateTotalServicePrice();
        }
    }

    private Brand loadBrandById(Long brandId) {
        if (brandId != null) {
            Brand dbBrand = brandRepository.findById(brandId).orElseThrow(() -> new RuntimeException("Brand not found: " + brandId));
            if (!dbBrand.getIsActive()) throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
            return dbBrand;
        }
        return null;
    }

    private Model loadModelById(Long modelId) {
        if (modelId != null) {
            Model dbModel = modelRepository.findById(modelId).orElseThrow(() -> new RuntimeException("Model not found: " + modelId));
            if (!dbModel.getIsActive()) throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
            return dbModel;
        }
        return null;
    }

    private Processor loadProcessorById(Long processorId) {
        if (processorId != null) {
            Processor dbProcessor = processorRepository.findById(processorId).orElseThrow(() -> new RuntimeException("Processor not found: " + processorId));
            if (!dbProcessor.getIsActive()) throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
            return dbProcessor;
        }
        return null;
    }

    private Brand loadBrand(Brand brand) {
        if (brand != null && brand.getId() != null) return loadBrandById(brand.getId());
        return null;
    }

    private Model loadModel(Model model) {
        if (model != null && model.getId() != null) return loadModelById(model.getId());
        return null;
    }

    private Processor loadProcessor(Processor processor) {
        if (processor != null && processor.getId() != null) return loadProcessorById(processor.getId());
        return null;
    }

    private void checkInventoryAndNotify(InventoryItem item) {
        if (item.getQuantity() <= item.getMinThreshold()) {
            notificationService.sendNotification(NotificationType.LOW_STOCK,
                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
                    item, NotificationSeverity.WARNING);
        }
    }

    private void sendJobCreatedNotification(JobCard jobCard) {
        String faultNames = jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()
                ? jobCard.getFaults().stream().map(Fault::getFaultName).reduce((a, b) -> a + ", " + b).orElse("No faults")
                : "No faults selected";
        String serviceNames = jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()
                ? jobCard.getServiceCategories().stream().map(ServiceCategory::getName).reduce((a, b) -> a + ", " + b).orElse("No services")
                : "No services selected";
        String deviceConditionNames = jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()
                ? jobCard.getDeviceConditions().stream().map(DeviceCondition::getConditionName).reduce((a, b) -> a + ", " + b).orElse("No conditions")
                : "No conditions selected";
        String faultDescriptionInfo = jobCard.getFaultDescription() != null && !jobCard.getFaultDescription().isEmpty()
                ? "Fault desc: " + (jobCard.getFaultDescription().length() > 50 ? jobCard.getFaultDescription().substring(0, 50) + "..." : jobCard.getFaultDescription())
                : "No fault description";
        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
        String regularInfo = Boolean.TRUE.equals(jobCard.getIsRegularCustomer()) ? " ⭐ REGULAR CUSTOMER" : "";

        notificationService.sendNotification(NotificationType.PENDING_JOB,
                "New job card created: " + jobCard.getJobNumber() +
                        " - Faults: " + faultNames +
                        " - Services: " + serviceNames +
                        " - Device Conditions: " + deviceConditionNames +
                        " - " + faultDescriptionInfo +
                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
                        priorityInfo + regularInfo,
                createJobCardPayload(jobCard), NotificationSeverity.INFO);
    }

    public List<JobCard> getAllJobCards() { return jobCardRepository.findAll(); }
    public JobCard getJobCardById(Long id) { return jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found")); }
    public JobCard getJobCardByNumber(String jobNumber) { return jobCardRepository.findByJobNumber(jobNumber).orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber)); }
    public JobCard getJobCardByDeviceSerial(String jobNumber) { return jobCardRepository.findByJobNumber(jobNumber).orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber)); }
    public List<JobCard> getJobCardsByStatus(JobStatus status) { return jobCardRepository.findByStatus(status); }
    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) { return jobCardRepository.findByServiceCategoriesId(serviceCategoryId); }
    public List<JobCard> getPendingJobsOlderThanDays(int days) { LocalDateTime threshold = LocalDateTime.now().minusDays(days); return jobCardRepository.findPendingJobsOlderThan(JobStatus.PENDING, threshold); }
    public List<JobCard> getJobsWaitingForParts() { return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS); }
    public List<JobCard> getJobsWaitingForApproval() { return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL); }
    public List<JobCard> getJobCardByDeviceSerialNumber(String serialNumber) { return jobCardRepository.findByDeviceSerialNumber(serialNumber); }
    public List<JobCard> searchJobCards(String query) { return jobCardRepository.searchJobCards(query); }
    public List<JobCard> searchJobCardsByBarcode(String barcode) { return jobCardRepository.searchJobCards(barcode); }
    public List<JobCard> getJobCardByBarcode(String barcode) { return jobCardRepository.findByDeviceBarcode(barcode); }

    public JobCardStatistics getJobCardStatistics() {
        Long total = jobCardRepository.count();
        Long pending = jobCardRepository.countByStatus(JobStatus.PENDING);
        Long inProgress = jobCardRepository.countByStatus(JobStatus.IN_PROGRESS);
        Long waitingForParts = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_PARTS);
        Long waitingForApproval = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_APPROVAL);
        Long completed = jobCardRepository.countByStatus(JobStatus.COMPLETED);
        Long delivered = jobCardRepository.countByStatus(JobStatus.DELIVERED);
        Long cancelled = jobCardRepository.countByStatus(JobStatus.CANCELLED);
        String lastJobNumber = jobCardRepository.findMaxJobNumber().orElse("No jobs yet");
        String nextJobNumber = generateJobNumber();
        return new JobCardStatistics(total, pending, inProgress, waitingForParts, waitingForApproval, completed, delivered, cancelled, lastJobNumber, nextJobNumber);
    }

    public Object removeServiceCategoryFromJobCard(Long id, Long serviceCategoryId) { return null; }

    public String getNextJobNumberPreview() { return generateJobNumber(); }

    @Transactional(readOnly = true)
    public List<String> getTodayJobNumbers() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return jobCardRepository.findAll().stream()
                .filter(job -> job.getCreatedAt().isAfter(startOfDay))
                .map(JobCard::getJobNumber).sorted().toList();
    }

    public static class JobCardStatistics {
        public final Long total, pending, inProgress, waitingForParts, waitingForApproval, completed, delivered, cancelled;
        public final String lastJobNumber, nextJobNumber;

        public JobCardStatistics(Long total, Long pending, Long inProgress, Long waitingForParts, Long waitingForApproval,
                                 Long completed, Long delivered, Long cancelled, String lastJobNumber, String nextJobNumber) {
            this.total = total; this.pending = pending; this.inProgress = inProgress;
            this.waitingForParts = waitingForParts; this.waitingForApproval = waitingForApproval;
            this.completed = completed; this.delivered = delivered; this.cancelled = cancelled;
            this.lastJobNumber = lastJobNumber; this.nextJobNumber = nextJobNumber;
        }
    }
}