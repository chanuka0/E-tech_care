//
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
//    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
//    private static final String JOB_NUMBER_PREFIX = "JOB-";
//    private static final Pattern JOB_NUMBER_PATTERN = Pattern.compile("^JOB-(\\d{8})-(\\d{6})$");
//
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
//    private String generateJobNumber() {
//        String today = LocalDate.now().format(DATE_FORMATTER);
//        Optional<String> lastJobNumber = jobCardRepository.findMaxJobNumber();
//        int nextNumber;
//        if (lastJobNumber.isPresent()) {
//            String lastNumberStr = lastJobNumber.get();
//            Matcher matcher = JOB_NUMBER_PATTERN.matcher(lastNumberStr);
//            if (matcher.matches()) {
//                String sequenceStr = matcher.group(2);
//                int lastSequence = Integer.parseInt(sequenceStr);
//                nextNumber = lastSequence + 1;
//            } else {
//                nextNumber = findMaxSequenceNumber() + 1;
//            }
//        } else {
//            nextNumber = 800;
//        }
//        return String.format("JOB-%s-%06d", today, nextNumber);
//    }
//
//    private String generateInvoiceNumber() {
//        Long count = invoiceRepository.count();
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
//        String datePart = sdf.format(new Date());
//        String sequencePart = String.format("%05d", (count + 1));
//        return "INV-" + datePart + "-" + sequencePart;
//    }
//
//    private int findMaxSequenceNumber() {
//        List<JobCard> allJobCards = jobCardRepository.findAll();
//        int maxSequence = 799;
//        for (JobCard job : allJobCards) {
//            String jobNumber = job.getJobNumber();
//            Matcher matcher = JOB_NUMBER_PATTERN.matcher(jobNumber);
//            if (matcher.matches()) {
//                try {
//                    int sequence = Integer.parseInt(matcher.group(2));
//                    if (sequence > maxSequence) maxSequence = sequence;
//                } catch (NumberFormatException e) {
//                    // Skip
//                }
//            }
//        }
//        return maxSequence;
//    }
//
//    /**
//     * Helper: get effective price for an inventory item based on customer type
//     */
//    private double getEffectiveItemPrice(InventoryItem item, boolean isRegularCustomer) {
//        if (isRegularCustomer && item.getSpecialPrice() != null) {
//            return item.getSpecialPrice();
//        }
//        return item.getSellingPrice();
//    }
//
//    /**
//     * Helper: calculate total service price based on customer type
//     */
//    private double calculateServiceTotal(List<ServiceCategory> services, boolean isRegularCustomer) {
//        return services.stream()
//                .mapToDouble(s -> {
//                    if (isRegularCustomer && s.getSpecialServicePrice() != null) {
//                        return s.getSpecialServicePrice();
//                    }
//                    return s.getServicePrice();
//                })
//                .sum();
//    }
//
//    @Transactional
//    public JobCard createJobCard(JobCard jobCard) {
//        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
//
//        if (isRegular && jobCard.getCustomer() != null) {
//            Customer regularCustomer = customerRepository.findById((long) jobCard.getCustomer().getCustomerId())
//                    .orElseThrow(() -> new RuntimeException("Customer not found"));
//            jobCard.loadCustomerData(regularCustomer);
//            System.out.println("✓ Regular customer loaded: " + regularCustomer.getCustomerName());
//        }
//
//        if (jobCard.getCustomerName() == null || jobCard.getCustomerName().trim().isEmpty())
//            throw new RuntimeException("Customer name is required");
//        if (jobCard.getCustomerPhone() == null || jobCard.getCustomerPhone().trim().isEmpty())
//            throw new RuntimeException("Customer phone is required");
//        if (jobCard.getDeviceType() == null || jobCard.getDeviceType().trim().isEmpty())
//            throw new RuntimeException("Device type is required");
//
//        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
//            if (checkBarcodeExists(jobCard.getDeviceBarcode()))
//                throw new RuntimeException("Device barcode already exists: " + jobCard.getDeviceBarcode());
//        }
//
//        List<Fault> validFaults = new ArrayList<>();
//        if (jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()) {
//            for (Fault fault : jobCard.getFaults()) {
//                if (fault.getId() == null) throw new RuntimeException("Invalid fault");
//                Fault dbFault = faultRepository.findById(fault.getId())
//                        .orElseThrow(() -> new RuntimeException("Fault not found"));
//                if (!dbFault.getIsActive())
//                    throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//                validFaults.add(dbFault);
//            }
//        }
//
//        List<ServiceCategory> validServices = new ArrayList<>();
//        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
//            for (ServiceCategory service : jobCard.getServiceCategories()) {
//                if (service.getId() == null) throw new RuntimeException("Invalid service category");
//                ServiceCategory dbService = serviceCategoryRepository.findById(service.getId())
//                        .orElseThrow(() -> new RuntimeException("Service category not found: " + service.getId()));
//                if (!dbService.getIsActive())
//                    throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//                validServices.add(dbService);
//            }
//        }
//
//        List<DeviceCondition> validDeviceConditions = new ArrayList<>();
//        if (jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()) {
//            for (DeviceCondition condition : jobCard.getDeviceConditions()) {
//                if (condition.getId() == null) throw new RuntimeException("Invalid device condition");
//                DeviceCondition dbCondition = deviceConditionRepository.findById(condition.getId())
//                        .orElseThrow(() -> new RuntimeException("Device condition not found: " + condition.getId()));
//                if (!dbCondition.getIsActive())
//                    throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//                validDeviceConditions.add(dbCondition);
//            }
//        }
//
//        jobCard.setBrand(loadBrand(jobCard.getBrand()));
//        jobCard.setModel(loadModel(jobCard.getModel()));
//        jobCard.setProcessor(loadProcessor(jobCard.getProcessor()));
//        jobCard.setFaults(validFaults);
//        jobCard.setServiceCategories(validServices);
//        jobCard.setDeviceConditions(validDeviceConditions);
//        jobCard.setJobNumber(generateJobNumber());
//        jobCard.setStatus(JobStatus.PENDING);
//
//        if (jobCard.getOneDayService() == null) jobCard.setOneDayService(false);
//        if (jobCard.getWithCharger() == null) jobCard.setWithCharger(false);
//        if (jobCard.getTotalServicePrice() == null) jobCard.setTotalServicePrice(0.0);
//
//        // ✅ Use special pricing for regular customers
//        if (isRegular) {
//            jobCard.setTotalServicePrice(calculateServiceTotal(validServices, true));
//        } else {
//            jobCard.calculateTotalServicePrice();
//        }
//
//        if (jobCard.getDeviceBarcode() != null && !jobCard.getDeviceBarcode().trim().isEmpty()) {
//            JobCardSerial deviceSerial = new JobCardSerial();
//            deviceSerial.setSerialType("DEVICE_SERIAL");
//            deviceSerial.setSerialValue(jobCard.getDeviceBarcode().trim());
//            deviceSerial.setJobCard(jobCard);
//            if (jobCard.getSerials() == null) jobCard.setSerials(new ArrayList<>());
//            jobCard.getSerials().add(deviceSerial);
//        }
//
//        if (jobCard.getSerials() != null) {
//            for (JobCardSerial serial : jobCard.getSerials()) serial.setJobCard(jobCard);
//        }
//
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem item : jobCard.getUsedItems()) {
//                item.setJobCard(jobCard);
//                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                // ✅ Use special price for regular customers
//                if (item.getUnitPrice() == null || item.getUnitPrice() == 0) {
//                    item.setUnitPrice(getEffectiveItemPrice(invItem, isRegular));
//                }
//
//                if (item.getWarrantyPeriod() == null) item.setWarrantyPeriod("No Warranty");
//
//                if (invItem.getHasSerialization()) {
//                    if (item.getUsedSerialNumbers() == null || item.getUsedSerialNumbers().isEmpty())
//                        throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//                    if (item.getUsedSerialNumbers().size() != item.getQuantityUsed())
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    for (String serialNumber : item.getUsedSerialNumbers()) {
//                        if (!inventoryService.isSerialAvailable(serialNumber))
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                    }
//                } else {
//                    if (invItem.getQuantity() < item.getQuantityUsed())
//                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
//                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
//                }
//                checkInventoryAndNotify(invItem);
//            }
//        }
//
//        JobCard saved = jobCardRepository.save(jobCard);
//
//        if (Boolean.TRUE.equals(saved.getIsRegularCustomer()) && saved.getCustomer() != null) {
//            Customer customer = customerRepository.findById((long) saved.getCustomer().getCustomerId()).orElse(null);
//            if (customer != null) {
//                customer.setTotalServiceCount((customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0) + 1);
//                customer.setLastVisit(LocalDateTime.now());
//                customerRepository.save(customer);
//            }
//        }
//
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
//    public boolean checkBarcodeExists(String barcode) {
//        List<JobCardSerial> existingSerials = jobCardSerialRepository.findBySerialValue(barcode);
//        if (!existingSerials.isEmpty()) return true;
//        List<JobCard> existingJobs = jobCardRepository.findByDeviceBarcode(barcode);
//        return !existingJobs.isEmpty();
//    }
//
//    @Transactional
//    public JobCard updateJobCard(Long id, JobCardUpdateRequest updateRequest) {
//        JobCard existing = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        List<UsedItem> oldUsedItems = new ArrayList<>(existing.getUsedItems());
//        JobStatus oldStatus = existing.getStatus();
//
//        if (updateRequest.getCustomerName() != null) existing.setCustomerName(updateRequest.getCustomerName());
//        if (updateRequest.getCustomerPhone() != null) existing.setCustomerPhone(updateRequest.getCustomerPhone());
//        if (updateRequest.getCustomerEmail() != null) existing.setCustomerEmail(updateRequest.getCustomerEmail());
//        if (updateRequest.getDeviceType() != null) existing.setDeviceType(updateRequest.getDeviceType());
//        if (updateRequest.getFaultDescription() != null) existing.setFaultDescription(updateRequest.getFaultDescription());
//        if (updateRequest.getNotes() != null) existing.setNotes(updateRequest.getNotes());
//        if (updateRequest.getEstimatedCost() != null) existing.setEstimatedCost(updateRequest.getEstimatedCost());
//        if (updateRequest.getAdvancePayment() != null) existing.setAdvancePayment(updateRequest.getAdvancePayment());
//
//        existing.setBrand(loadBrandById(updateRequest.getBrandId()));
//        existing.setModel(loadModelById(updateRequest.getModelId()));
//        existing.setProcessor(loadProcessorById(updateRequest.getProcessorId()));
//
//        if (updateRequest.getDeviceConditionIds() != null)
//            updateDeviceConditionsFromIds(existing, updateRequest.getDeviceConditionIds());
//        else
//            existing.clearDeviceConditions();
//
//        if (updateRequest.getOneDayService() != null) existing.setOneDayService(updateRequest.getOneDayService());
//        if (updateRequest.getWithCharger() != null) existing.setWithCharger(updateRequest.getWithCharger());
//
//        if (updateRequest.getFaultIds() != null) updateFaultsFromIds(existing, updateRequest.getFaultIds());
//        else existing.clearFaults();
//
//        if (updateRequest.getServiceCategoryIds() != null)
//            updateServiceCategoriesFromIds(existing, updateRequest.getServiceCategoryIds());
//        else
//            existing.clearServiceCategories();
//
//        if (updateRequest.getUsedItems() != null)
//            updateUsedItemsFromRequest(existing, updateRequest.getUsedItems(), oldUsedItems);
//        else {
//            releaseAllSerialsFromUsedItems(oldUsedItems);
//            existing.getUsedItems().clear();
//        }
//
//        if (updateRequest.getStatus() != null) handleStatusChange(existing, updateRequest.getStatus(), oldStatus);
//
//        // ✅ Recalculate with special pricing
//        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
//        if (isRegular) {
//            existing.setTotalServicePrice(calculateServiceTotal(existing.getServiceCategories(), true));
//        } else {
//            existing.calculateTotalServicePrice();
//        }
//
//        return jobCardRepository.save(existing);
//    }
//
//    private void updateUsedItemsFromRequest(JobCard existing,
//                                            List<JobCardUpdateRequest.UsedItemRequest> usedItems,
//                                            List<UsedItem> oldUsedItems) {
//        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
//        releaseSerialsFromRemovedItems(oldUsedItems, usedItems);
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
//            // ✅ Use special price for regular customers
//            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
//                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
//            } else {
//                newUsedItem.setUnitPrice(getEffectiveItemPrice(invItem, isRegular));
//            }
//
//            if (itemRequest.getUsedSerialNumbers() != null && !itemRequest.getUsedSerialNumbers().isEmpty()) {
//                newUsedItem.setUsedSerialNumbers(new ArrayList<>(itemRequest.getUsedSerialNumbers()));
//                if (invItem.getHasSerialization()) {
//                    if (itemRequest.getUsedSerialNumbers().size() != itemRequest.getQuantityUsed())
//                        throw new RuntimeException("Number of serials must match quantity for item: " + invItem.getName());
//                    for (String serialNumber : itemRequest.getUsedSerialNumbers()) {
//                        if (!inventoryService.isSerialAvailableForJobCard(serialNumber, existing.getId()))
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        if (inventoryService.isSerialAvailable(serialNumber))
//                            inventoryService.markSerialAsUsed(serialNumber, existing.getId(), existing.getJobNumber());
//                    }
//                }
//            } else if (invItem.getHasSerialization()) {
//                throw new RuntimeException("Serial numbers required for item: " + invItem.getName());
//            } else {
//                if (invItem.getQuantity() < itemRequest.getQuantityUsed())
//                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
//            }
//
//            existing.addUsedItem(newUsedItem);
//            checkInventoryAndNotify(invItem);
//        }
//    }
//
//    private void releaseSerialsFromRemovedItems(List<UsedItem> oldUsedItems,
//                                                List<JobCardUpdateRequest.UsedItemRequest> newUsedItems) {
//        for (UsedItem oldItem : oldUsedItems) {
//            boolean stillExists = newUsedItems.stream()
//                    .anyMatch(newItem -> newItem.getId() != null && newItem.getId().equals(oldItem.getId()));
//            if (!stillExists && oldItem.getInventoryItem().getHasSerialization() && oldItem.getUsedSerialNumbers() != null) {
//                for (String serialNumber : oldItem.getUsedSerialNumbers()) {
//                    try {
//                        inventoryService.releaseSerial(serialNumber);
//                    } catch (Exception e) {
//                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
//                    }
//                }
//            }
//        }
//    }
//
//    private void releaseAllSerialsFromUsedItems(List<UsedItem> usedItems) {
//        for (UsedItem item : usedItems) {
//            if (item.getInventoryItem().getHasSerialization() && item.getUsedSerialNumbers() != null) {
//                for (String serialNumber : item.getUsedSerialNumbers()) {
//                    try {
//                        inventoryService.releaseSerial(serialNumber);
//                    } catch (Exception e) {
//                        System.err.println("❌ Error releasing serial " + serialNumber + ": " + e.getMessage());
//                    }
//                }
//            }
//        }
//    }
//
//    @Transactional
//    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId, String reason, Double fee) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() != JobStatus.COMPLETED && jobCard.getStatus() != JobStatus.IN_PROGRESS)
//            throw new RuntimeException("Job card can only be cancelled if status is COMPLETED or IN_PROGRESS. Current status: " + jobCard.getStatus());
//
//        if (jobCard.getStatus() == JobStatus.CANCELLED)
//            throw new RuntimeException("Job card is already cancelled");
//
//        if ("CUSTOMER".equals(cancelledBy)) {
//            rollbackInventoryFromJobCard(jobCard);
//        } else {
//            if (jobCard.getUsedItems() != null) releaseAllSerialsFromUsedItems(jobCard.getUsedItems());
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
//        if ("CUSTOMER".equals(cancelledBy) && fee != null && fee > 0)
//            createCancellationInvoice(saved, fee, reason);
//
//        String cancellerInfo = "CUSTOMER".equals(cancelledBy) ? "Customer" : "Technician";
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE CANCELLED" : "";
//        notificationService.sendNotification(NotificationType.JOB_CANCELLED,
//                "Job cancelled by " + cancellerInfo + ": " + saved.getJobNumber() + priorityInfo,
//                createJobCardPayload(saved), NotificationSeverity.WARNING);
//
//        return saved;
//    }
//
//    private void rollbackInventoryFromJobCard(JobCard jobCard) {
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InventoryItem inventoryItem = usedItem.getInventoryItem();
//                if (inventoryItem.getHasSerialization()) {
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
//                    int quantityToRestore = usedItem.getQuantityUsed();
//                    inventoryItem.setQuantity(inventoryItem.getQuantity() + quantityToRestore);
//                    inventoryItemRepository.save(inventoryItem);
//                    recordStockMovementForRollback(inventoryItem, quantityToRestore, jobCard);
//                }
//            }
//        }
//    }
//
//    private void releaseSerialForCancellation(String serialNumber) {
//        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));
//        if (serial.getStatus() == SerialStatus.USED) {
//            serial.setStatus(SerialStatus.AVAILABLE);
//            serial.setUsedAt(null);
//            serial.setUsedBy(null);
//            serial.setUsedInReferenceType(null);
//            serial.setUsedInReferenceId(null);
//            serial.setUsedInReferenceNumber(null);
//            serial.setNotes((serial.getNotes() != null ? serial.getNotes() + " " : "") +
//                    "[Released from cancelled job card at " + LocalDateTime.now() + "]");
//            inventorySerialRepository.save(serial);
//        }
//    }
//
//    private void recordStockMovementForRollback(InventoryItem item, Integer quantity, JobCard jobCard) {
//        StockMovement movement = new StockMovement();
//        movement.setInventoryItem(item);
//        movement.setMovementType(MovementType.IN);
//        movement.setQuantity(quantity);
//        movement.setReferenceType("CANCELLATION_ROLLBACK");
//        movement.setReferenceId(jobCard.getId());
//        movement.setReferenceNumber(jobCard.getJobNumber());
//        movement.setReason("Inventory restored from cancelled job card");
//        movement.setPerformedBy(getCurrentUsername());
//        int previousQuantity = item.getQuantity() - quantity;
//        movement.setPreviousQuantity(previousQuantity);
//        movement.setNewQuantity(item.getQuantity());
//        stockMovementRepository.save(movement);
//    }
//
//    private void createCancellationInvoice(JobCard jobCard, Double fee, String reason) {
//        try {
//            String invoiceNumber = generateInvoiceNumber();
//            Invoice invoice = new Invoice();
//            invoice.setInvoiceNumber(invoiceNumber);
//            invoice.setJobCard(jobCard);
//            invoice.setCustomerName(jobCard.getCustomerName());
//            invoice.setCustomerPhone(jobCard.getCustomerPhone());
//            invoice.setCustomerEmail(jobCard.getCustomerEmail());
//            invoice.setPaymentMethod(PaymentMethod.CASH);
//
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
//            invoice.setSubtotal(fee);
//            invoice.setTotal(fee);
//            invoice.setPaidAmount(0.0);
//            invoice.setBalance(fee);
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//
//            invoiceRepository.save(invoice);
//
//            notificationService.sendNotification(NotificationType.INVOICE_CREATED,
//                    "Cancellation invoice created: " + invoiceNumber + " | Amount: Rs." + fee + " | Job: " + jobCard.getJobNumber(),
//                    createJobCardPayload(jobCard), NotificationSeverity.WARNING);
//        } catch (Exception e) {
//            System.err.println("❌ Failed to create cancellation invoice: " + e.getMessage());
//        }
//    }
//
//    private String getCurrentUsername() {
//        try {
//            return SecurityContextHolder.getContext().getAuthentication().getName();
//        } catch (Exception e) {
//            return "SYSTEM";
//        }
//    }
//
//    @Transactional
//    public void deleteJobCard(Long id, String reason) {
//        JobCard jobCard = jobCardRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() != JobStatus.PENDING && jobCard.getStatus() != JobStatus.CANCELLED)
//            throw new RuntimeException("Can only delete PENDING or CANCELLED job cards. Current status: " + jobCard.getStatus());
//
//        if (jobCard.getSerials() != null && !jobCard.getSerials().isEmpty())
//            jobCardSerialRepository.deleteAll(jobCard.getSerials());
//
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
//        notificationService.sendNotification(NotificationType.JOB_CANCELLED,
//                "Job card deleted: " + jobCard.getJobNumber() + " | Reason: " + reason,
//                createJobCardPayload(jobCard), NotificationSeverity.WARNING);
//    }
//
//    @Transactional
//    public JobCard markWaitingForParts(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
//        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
//        if (jobCard.getStatus() == JobStatus.WAITING_FOR_PARTS) throw new RuntimeException("Job card is already waiting for parts");
//        jobCard.markWaitingForParts();
//        JobCard saved = jobCardRepository.save(jobCard);
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is waiting for parts" + priorityInfo,
//                createJobCardPayload(saved), NotificationSeverity.WARNING);
//        return saved;
//    }
//
//    @Transactional
//    public JobCard markWaitingForApproval(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
//        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
//        if (jobCard.getStatus() == JobStatus.WAITING_FOR_APPROVAL) throw new RuntimeException("Job card is already waiting for approval");
//        jobCard.markWaitingForApproval();
//        JobCard saved = jobCardRepository.save(jobCard);
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is waiting for approval" + priorityInfo,
//                createJobCardPayload(saved), NotificationSeverity.WARNING);
//        return saved;
//    }
//
//    @Transactional
//    public JobCard markInProgress(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
//        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
//        if (jobCard.getStatus() == JobStatus.IN_PROGRESS) throw new RuntimeException("Job card is already in progress");
//        jobCard.markInProgress();
//        JobCard saved = jobCardRepository.save(jobCard);
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " is back in progress" + priorityInfo,
//                createJobCardPayload(saved), NotificationSeverity.INFO);
//        return saved;
//    }
//
//    @Transactional
//    public JobCard markPending(Long id) {
//        JobCard jobCard = jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found"));
//        if (jobCard.getStatus() == JobStatus.CANCELLED) throw new RuntimeException("Cannot update cancelled job card");
//        if (jobCard.getStatus() == JobStatus.PENDING) throw new RuntimeException("Job card is already pending");
//        jobCard.setStatus(JobStatus.PENDING);
//        jobCard.setUpdatedAt(LocalDateTime.now());
//        JobCard saved = jobCardRepository.save(jobCard);
//        String priorityInfo = saved.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
//                "Job card " + saved.getJobNumber() + " marked as pending" + priorityInfo,
//                createJobCardPayload(saved), NotificationSeverity.INFO);
//        return saved;
//    }
//
//    @Transactional
//    public JobCard addDeviceConditionToJobCard(Long jobCardId, Long deviceConditionId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId).orElseThrow(() -> new RuntimeException("Device condition not found"));
//        if (!deviceCondition.getIsActive()) throw new RuntimeException("Device condition is inactive");
//        jobCard.addDeviceCondition(deviceCondition);
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard removeDeviceConditionFromJobCard(Long jobCardId, Long deviceConditionId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        DeviceCondition deviceCondition = deviceConditionRepository.findById(deviceConditionId).orElseThrow(() -> new RuntimeException("Device condition not found"));
//        jobCard.removeDeviceCondition(deviceCondition);
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard addFaultToJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        Fault fault = faultRepository.findById(faultId).orElseThrow(() -> new RuntimeException("Fault not found"));
//        if (!fault.getIsActive()) throw new RuntimeException("Fault is inactive");
//        jobCard.addFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard removeFaultFromJobCard(Long jobCardId, Long faultId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        Fault fault = faultRepository.findById(faultId).orElseThrow(() -> new RuntimeException("Fault not found"));
//        jobCard.removeFault(fault);
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard addServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId).orElseThrow(() -> new RuntimeException("Service category not found"));
//        if (!service.getIsActive()) throw new RuntimeException("Service category is inactive");
//        jobCard.addServiceCategory(service);
//        // ✅ Recalculate with correct pricing
//        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
//        if (isRegular) {
//            jobCard.setTotalServicePrice(calculateServiceTotal(jobCard.getServiceCategories(), true));
//        } else {
//            jobCard.calculateTotalServicePrice();
//        }
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard removeServiceCategoryToJobCard(Long jobCardId, Long serviceCategoryId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        ServiceCategory service = serviceCategoryRepository.findById(serviceCategoryId).orElseThrow(() -> new RuntimeException("Service category not found"));
//        jobCard.removeServiceCategory(service);
//        boolean isRegular = Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
//        if (isRegular) {
//            jobCard.setTotalServicePrice(calculateServiceTotal(jobCard.getServiceCategories(), true));
//        } else {
//            jobCard.calculateTotalServicePrice();
//        }
//        return jobCardRepository.save(jobCard);
//    }
//
//    @Transactional
//    public JobCard addSerialToJobCard(Long jobCardId, JobCardSerial serial) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId).orElseThrow(() -> new RuntimeException("Job card not found"));
//        jobCard.addSerial(serial);
//        return jobCardRepository.save(jobCard);
//    }
//
//    private void handleStatusChange(JobCard jobCard, JobStatus newStatus, JobStatus oldStatus) {
//        jobCard.setStatus(newStatus);
//        if (newStatus == JobStatus.COMPLETED && oldStatus != JobStatus.COMPLETED) {
//            jobCard.setCompletedAt(LocalDateTime.now());
//            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE COMPLETED" : "";
//            notificationService.sendNotification(NotificationType.JOB_COMPLETED,
//                    "Job completed: " + jobCard.getJobNumber() + priorityInfo + " (Serials remain USED until invoice payment)",
//                    createJobCardPayload(jobCard), NotificationSeverity.SUCCESS);
//        }
//        if ((newStatus == JobStatus.WAITING_FOR_PARTS || newStatus == JobStatus.WAITING_FOR_APPROVAL) && oldStatus != newStatus) {
//            String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//            notificationService.sendNotification(NotificationType.JOB_STATUS_CHANGED,
//                    "Job status changed to " + newStatus + ": " + jobCard.getJobNumber() + priorityInfo,
//                    createJobCardPayload(jobCard), NotificationSeverity.WARNING);
//        }
//    }
//
//    private void updateDeviceConditionsFromIds(JobCard existing, List<Long> deviceConditionIds) {
//        existing.clearDeviceConditions();
//        for (Long conditionId : deviceConditionIds) {
//            DeviceCondition dbCondition = deviceConditionRepository.findById(conditionId)
//                    .orElseThrow(() -> new RuntimeException("Device condition not found: " + conditionId));
//            if (!dbCondition.getIsActive())
//                throw new RuntimeException("Selected device condition is inactive: " + dbCondition.getConditionName());
//            existing.addDeviceCondition(dbCondition);
//        }
//    }
//
//    private void updateFaultsFromIds(JobCard existing, List<Long> faultIds) {
//        existing.clearFaults();
//        for (Long faultId : faultIds) {
//            Fault dbFault = faultRepository.findById(faultId)
//                    .orElseThrow(() -> new RuntimeException("Fault not found: " + faultId));
//            if (!dbFault.getIsActive())
//                throw new RuntimeException("Selected fault is inactive: " + dbFault.getFaultName());
//            existing.addFault(dbFault);
//        }
//    }
//
//    private void updateServiceCategoriesFromIds(JobCard existing, List<Long> serviceCategoryIds) {
//        existing.clearServiceCategories();
//        for (Long serviceCategoryId : serviceCategoryIds) {
//            ServiceCategory dbService = serviceCategoryRepository.findById(serviceCategoryId)
//                    .orElseThrow(() -> new RuntimeException("Service category not found: " + serviceCategoryId));
//            if (!dbService.getIsActive())
//                throw new RuntimeException("Selected service category is inactive: " + dbService.getName());
//            existing.addServiceCategory(dbService);
//        }
//        // ✅ Use special pricing for regular customers
//        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
//        if (isRegular) {
//            existing.setTotalServicePrice(calculateServiceTotal(existing.getServiceCategories(), true));
//        } else {
//            existing.calculateTotalServicePrice();
//        }
//    }
//
//    private Brand loadBrandById(Long brandId) {
//        if (brandId != null) {
//            Brand dbBrand = brandRepository.findById(brandId).orElseThrow(() -> new RuntimeException("Brand not found: " + brandId));
//            if (!dbBrand.getIsActive()) throw new RuntimeException("Selected brand is inactive: " + dbBrand.getBrandName());
//            return dbBrand;
//        }
//        return null;
//    }
//
//    private Model loadModelById(Long modelId) {
//        if (modelId != null) {
//            Model dbModel = modelRepository.findById(modelId).orElseThrow(() -> new RuntimeException("Model not found: " + modelId));
//            if (!dbModel.getIsActive()) throw new RuntimeException("Selected model is inactive: " + dbModel.getModelName());
//            return dbModel;
//        }
//        return null;
//    }
//
//    private Processor loadProcessorById(Long processorId) {
//        if (processorId != null) {
//            Processor dbProcessor = processorRepository.findById(processorId).orElseThrow(() -> new RuntimeException("Processor not found: " + processorId));
//            if (!dbProcessor.getIsActive()) throw new RuntimeException("Selected processor is inactive: " + dbProcessor.getProcessorName());
//            return dbProcessor;
//        }
//        return null;
//    }
//
//    private Brand loadBrand(Brand brand) {
//        if (brand != null && brand.getId() != null) return loadBrandById(brand.getId());
//        return null;
//    }
//
//    private Model loadModel(Model model) {
//        if (model != null && model.getId() != null) return loadModelById(model.getId());
//        return null;
//    }
//
//    private Processor loadProcessor(Processor processor) {
//        if (processor != null && processor.getId() != null) return loadProcessorById(processor.getId());
//        return null;
//    }
//
//    private void checkInventoryAndNotify(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item, NotificationSeverity.WARNING);
//        }
//    }
//
//    private void sendJobCreatedNotification(JobCard jobCard) {
//        String faultNames = jobCard.getFaults() != null && !jobCard.getFaults().isEmpty()
//                ? jobCard.getFaults().stream().map(Fault::getFaultName).reduce((a, b) -> a + ", " + b).orElse("No faults")
//                : "No faults selected";
//        String serviceNames = jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()
//                ? jobCard.getServiceCategories().stream().map(ServiceCategory::getName).reduce((a, b) -> a + ", " + b).orElse("No services")
//                : "No services selected";
//        String deviceConditionNames = jobCard.getDeviceConditions() != null && !jobCard.getDeviceConditions().isEmpty()
//                ? jobCard.getDeviceConditions().stream().map(DeviceCondition::getConditionName).reduce((a, b) -> a + ", " + b).orElse("No conditions")
//                : "No conditions selected";
//        String faultDescriptionInfo = jobCard.getFaultDescription() != null && !jobCard.getFaultDescription().isEmpty()
//                ? "Fault desc: " + (jobCard.getFaultDescription().length() > 50 ? jobCard.getFaultDescription().substring(0, 50) + "..." : jobCard.getFaultDescription())
//                : "No fault description";
//        String priorityInfo = jobCard.getOneDayService() ? " 🚨 ONE DAY SERVICE" : "";
//        String regularInfo = Boolean.TRUE.equals(jobCard.getIsRegularCustomer()) ? " ⭐ REGULAR CUSTOMER" : "";
//
//        notificationService.sendNotification(NotificationType.PENDING_JOB,
//                "New job card created: " + jobCard.getJobNumber() +
//                        " - Faults: " + faultNames +
//                        " - Services: " + serviceNames +
//                        " - Device Conditions: " + deviceConditionNames +
//                        " - " + faultDescriptionInfo +
//                        " - Total Service Price: " + jobCard.getTotalServicePrice() +
//                        priorityInfo + regularInfo,
//                createJobCardPayload(jobCard), NotificationSeverity.INFO);
//    }
//
//    public List<JobCard> getAllJobCards() { return jobCardRepository.findAll(); }
//    public JobCard getJobCardById(Long id) { return jobCardRepository.findById(id).orElseThrow(() -> new RuntimeException("Job card not found")); }
//    public JobCard getJobCardByNumber(String jobNumber) { return jobCardRepository.findByJobNumber(jobNumber).orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber)); }
//    public JobCard getJobCardByDeviceSerial(String jobNumber) { return jobCardRepository.findByJobNumber(jobNumber).orElseThrow(() -> new RuntimeException("Job card not found: " + jobNumber)); }
//    public List<JobCard> getJobCardsByStatus(JobStatus status) { return jobCardRepository.findByStatus(status); }
//    public List<JobCard> getJobCardsByServiceCategory(Long serviceCategoryId) { return jobCardRepository.findByServiceCategoriesId(serviceCategoryId); }
//    public List<JobCard> getPendingJobsOlderThanDays(int days) { LocalDateTime threshold = LocalDateTime.now().minusDays(days); return jobCardRepository.findPendingJobsOlderThan(JobStatus.PENDING, threshold); }
//    public List<JobCard> getJobsWaitingForParts() { return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_PARTS); }
//    public List<JobCard> getJobsWaitingForApproval() { return jobCardRepository.findByStatus(JobStatus.WAITING_FOR_APPROVAL); }
//    public List<JobCard> getJobCardByDeviceSerialNumber(String serialNumber) { return jobCardRepository.findByDeviceSerialNumber(serialNumber); }
//    public List<JobCard> searchJobCards(String query) { return jobCardRepository.searchJobCards(query); }
//    public List<JobCard> searchJobCardsByBarcode(String barcode) { return jobCardRepository.searchJobCards(barcode); }
//    public List<JobCard> getJobCardByBarcode(String barcode) { return jobCardRepository.findByDeviceBarcode(barcode); }
//
//    public JobCardStatistics getJobCardStatistics() {
//        Long total = jobCardRepository.count();
//        Long pending = jobCardRepository.countByStatus(JobStatus.PENDING);
//        Long inProgress = jobCardRepository.countByStatus(JobStatus.IN_PROGRESS);
//        Long waitingForParts = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_PARTS);
//        Long waitingForApproval = jobCardRepository.countByStatus(JobStatus.WAITING_FOR_APPROVAL);
//        Long completed = jobCardRepository.countByStatus(JobStatus.COMPLETED);
//        Long delivered = jobCardRepository.countByStatus(JobStatus.DELIVERED);
//        Long cancelled = jobCardRepository.countByStatus(JobStatus.CANCELLED);
//        String lastJobNumber = jobCardRepository.findMaxJobNumber().orElse("No jobs yet");
//        String nextJobNumber = generateJobNumber();
//        return new JobCardStatistics(total, pending, inProgress, waitingForParts, waitingForApproval, completed, delivered, cancelled, lastJobNumber, nextJobNumber);
//    }
//
//    public Object removeServiceCategoryFromJobCard(Long id, Long serviceCategoryId) { return null; }
//
//    public String getNextJobNumberPreview() { return generateJobNumber(); }
//
//    @Transactional(readOnly = true)
//    public List<String> getTodayJobNumbers() {
//        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
//        return jobCardRepository.findAll().stream()
//                .filter(job -> job.getCreatedAt().isAfter(startOfDay))
//                .map(JobCard::getJobNumber).sorted().toList();
//    }
//
//    public static class JobCardStatistics {
//        public final Long total, pending, inProgress, waitingForParts, waitingForApproval, completed, delivered, cancelled;
//        public final String lastJobNumber, nextJobNumber;
//
//        public JobCardStatistics(Long total, Long pending, Long inProgress, Long waitingForParts, Long waitingForApproval,
//                                 Long completed, Long delivered, Long cancelled, String lastJobNumber, String nextJobNumber) {
//            this.total = total; this.pending = pending; this.inProgress = inProgress;
//            this.waitingForParts = waitingForParts; this.waitingForApproval = waitingForApproval;
//            this.completed = completed; this.delivered = delivered; this.cancelled = cancelled;
//            this.lastJobNumber = lastJobNumber; this.nextJobNumber = nextJobNumber;
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

    // ========== CHANGE 1: deduct non-serialized quantity at job card creation ==========

    /**
     * Deduct non-serialized inventory quantity when item is added to a job card.
     * Serialized items are NOT touched here — their serial is marked USED separately.
     */
    private void deductNonSerializedForJobCard(UsedItem item, JobCard jobCard) {
        InventoryItem invItem = item.getInventoryItem();
        if (invItem.getHasSerialization()) return; // serialized: no change

        int oldQty = invItem.getQuantity();
        if (oldQty < item.getQuantityUsed()) {
            throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                    ". Available: " + oldQty + ", Requested: " + item.getQuantityUsed());
        }
        invItem.setQuantity(oldQty - item.getQuantityUsed());
        inventoryItemRepository.save(invItem);

        // Record stock movement
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(invItem);
        movement.setMovementType(MovementType.OUT);
        movement.setQuantity(item.getQuantityUsed());
        movement.setReferenceType("JOB_CARD");
        movement.setReferenceId(jobCard.getId());
        movement.setReferenceNumber(jobCard.getJobNumber());
        movement.setReason("Used in job card");
        movement.setPerformedBy(getCurrentUsername());
        movement.setPreviousQuantity(oldQty);
        movement.setNewQuantity(invItem.getQuantity());
        stockMovementRepository.save(movement);

        System.out.println("📦 Non-serialized deducted at job card creation: " + invItem.getName()
                + " | Qty: -" + item.getQuantityUsed() + " | New stock: " + invItem.getQuantity());
    }

    /**
     * Restore non-serialized inventory quantity (used when item removed / job cancelled / deleted).
     * Serialized items are NOT touched here.
     */
    private void restoreNonSerializedForJobCard(UsedItem item, String referenceType,
                                                Long referenceId, String referenceNumber) {
        InventoryItem invItem = item.getInventoryItem();
        if (invItem.getHasSerialization()) return; // serialized: no change

        // Re-fetch to get current quantity
        InventoryItem freshItem = inventoryItemRepository.findById(invItem.getId())
                .orElse(invItem);

        int oldQty = freshItem.getQuantity();
        freshItem.setQuantity(oldQty + item.getQuantityUsed());
        inventoryItemRepository.save(freshItem);

        // Record stock movement
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(freshItem);
        movement.setMovementType(MovementType.IN);
        movement.setQuantity(item.getQuantityUsed());
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setReferenceNumber(referenceNumber);
        movement.setReason("Stock restored from " + referenceType.toLowerCase().replace("_", " "));
        movement.setPerformedBy(getCurrentUsername());
        movement.setPreviousQuantity(oldQty);
        movement.setNewQuantity(freshItem.getQuantity());
        stockMovementRepository.save(movement);

        System.out.println("📦 Non-serialized restored from " + referenceType + ": " + freshItem.getName()
                + " | Qty: +" + item.getQuantityUsed() + " | New stock: " + freshItem.getQuantity());
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

        // Use special pricing for regular customers
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

        // ── Validate used items BEFORE saving ──
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem item : jobCard.getUsedItems()) {
                item.setJobCard(jobCard);
                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));

                // Use special price for regular customers
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
                    // ── CHANGE 1: validate stock is sufficient (deduction happens after save) ──
                    if (invItem.getQuantity() < item.getQuantityUsed())
                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                                ". Available: " + invItem.getQuantity() + ", Requested: " + item.getQuantityUsed());
                }
                checkInventoryAndNotify(invItem);
            }
        }

        JobCard saved = jobCardRepository.save(jobCard);

        // Update regular customer stats
        if (Boolean.TRUE.equals(saved.getIsRegularCustomer()) && saved.getCustomer() != null) {
            Customer customer = customerRepository.findById((long) saved.getCustomer().getCustomerId()).orElse(null);
            if (customer != null) {
                customer.setTotalServiceCount((customer.getTotalServiceCount() != null ? customer.getTotalServiceCount() : 0) + 1);
                customer.setLastVisit(LocalDateTime.now());
                customerRepository.save(customer);
            }
        }

        // ── CHANGE 1: Post-save — deduct non-serialized, mark serials as USED ──
        if (saved.getUsedItems() != null && !saved.getUsedItems().isEmpty()) {
            for (UsedItem item : saved.getUsedItems()) {
                InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));

                if (invItem.getHasSerialization()) {
                    // Serialized: mark serials as USED (unchanged)
                    if (item.getUsedSerialNumbers() != null) {
                        for (String serialNumber : item.getUsedSerialNumbers()) {
                            inventoryService.markSerialAsUsed(serialNumber, saved.getId(), saved.getJobNumber());
                        }
                    }
                } else {
                    // Non-serialized: deduct quantity NOW
                    deductNonSerializedForJobCard(item, saved);
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
            // All items removed — restore all non-serialized + release all serials
            restoreAllNonSerializedFromUsedItems(oldUsedItems, existing);
            releaseAllSerialsFromUsedItems(oldUsedItems);
            existing.getUsedItems().clear();
        }

        if (updateRequest.getStatus() != null) handleStatusChange(existing, updateRequest.getStatus(), oldStatus);

        // Recalculate with special pricing
        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());
        if (isRegular) {
            existing.setTotalServicePrice(calculateServiceTotal(existing.getServiceCategories(), true));
        } else {
            existing.calculateTotalServicePrice();
        }

        return jobCardRepository.save(existing);
    }

    // ========== CHANGE 2: updateUsedItemsFromRequest — restore qty for removed, deduct for new ==========

    private void updateUsedItemsFromRequest(JobCard existing,
                                            List<JobCardUpdateRequest.UsedItemRequest> newUsedItems,
                                            List<UsedItem> oldUsedItems) {
        boolean isRegular = Boolean.TRUE.equals(existing.getIsRegularCustomer());

        // ── Step 1: For each OLD item not present in new list → restore non-serialized + release serials ──
        for (UsedItem oldItem : oldUsedItems) {
            boolean stillExists = newUsedItems.stream()
                    .anyMatch(newItem -> newItem.getId() != null && newItem.getId().equals(oldItem.getId()));

            if (!stillExists) {
                // Restore non-serialized quantity
                if (!oldItem.getInventoryItem().getHasSerialization()) {
                    restoreNonSerializedForJobCard(oldItem, "JOB_CARD_UPDATE",
                            existing.getId(), existing.getJobNumber());
                }
                // Release serialized serials
                if (oldItem.getInventoryItem().getHasSerialization() && oldItem.getUsedSerialNumbers() != null) {
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

        existing.getUsedItems().clear();

        // ── Step 2: Add new/existing items ──
        for (JobCardUpdateRequest.UsedItemRequest itemRequest : newUsedItems) {
            InventoryItem invItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found: " + itemRequest.getInventoryItemId()));

            UsedItem newUsedItem = new UsedItem();
            newUsedItem.setJobCard(existing);
            newUsedItem.setInventoryItem(invItem);
            newUsedItem.setQuantityUsed(itemRequest.getQuantityUsed());
            newUsedItem.setWarrantyPeriod(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");

            // Use special price for regular customers
            if (itemRequest.getUnitPrice() != null && itemRequest.getUnitPrice() > 0) {
                newUsedItem.setUnitPrice(itemRequest.getUnitPrice());
            } else {
                newUsedItem.setUnitPrice(getEffectiveItemPrice(invItem, isRegular));
            }

            boolean isExistingItem = itemRequest.getId() != null &&
                    oldUsedItems.stream().anyMatch(old -> old.getId().equals(itemRequest.getId()));

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
                // ── CHANGE 2: Non-serialized NEW item → deduct quantity ──
                if (!isExistingItem) {
                    if (invItem.getQuantity() < itemRequest.getQuantityUsed())
                        throw new RuntimeException("Not enough stock for item: " + invItem.getName() +
                                ". Available: " + invItem.getQuantity() + ", Requested: " + itemRequest.getQuantityUsed());
                    newUsedItem.setUsedSerialNumbers(new ArrayList<>());
                    existing.addUsedItem(newUsedItem);
                    deductNonSerializedForJobCard(newUsedItem, existing);
                    checkInventoryAndNotify(invItem);
                    continue; // skip the addUsedItem below since already added
                }
            }

            existing.addUsedItem(newUsedItem);
            checkInventoryAndNotify(invItem);
        }
    }

    /**
     * Restore non-serialized quantities for ALL used items in a list.
     * Used when all items are cleared at once (e.g. null usedItems in update request).
     */
    private void restoreAllNonSerializedFromUsedItems(List<UsedItem> usedItems, JobCard jobCard) {
        for (UsedItem item : usedItems) {
            if (!item.getInventoryItem().getHasSerialization()) {
                restoreNonSerializedForJobCard(item, "JOB_CARD_UPDATE",
                        jobCard.getId(), jobCard.getJobNumber());
            }
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

    // ========== CHANGE 3: cancelJobCard — rollback for ALL cancellers ==========

    @Transactional
    public JobCard cancelJobCard(Long id, String cancelledBy, Long cancelledByUserId, String reason, Double fee) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() != JobStatus.COMPLETED && jobCard.getStatus() != JobStatus.IN_PROGRESS)
            throw new RuntimeException("Job card can only be cancelled if status is COMPLETED or IN_PROGRESS. Current status: " + jobCard.getStatus());

        if (jobCard.getStatus() == JobStatus.CANCELLED)
            throw new RuntimeException("Job card is already cancelled");

        // ── CHANGE 3: Rollback inventory for ALL cancellers (not just CUSTOMER) ──
        rollbackInventoryFromJobCard(jobCard);

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

    /**
     * Rollback inventory for a cancelled job card:
     * - Non-serialized: restore quantity
     * - Serialized: release serial back to AVAILABLE
     */
    private void rollbackInventoryFromJobCard(JobCard jobCard) {
        if (jobCard.getUsedItems() == null || jobCard.getUsedItems().isEmpty()) return;

        for (UsedItem usedItem : jobCard.getUsedItems()) {
            InventoryItem inventoryItem = usedItem.getInventoryItem();

            if (inventoryItem.getHasSerialization()) {
                // Serialized: release serials (unchanged)
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
                // ── CHANGE 3: Non-serialized: restore quantity for ALL cancellations ──
                restoreNonSerializedForJobCard(usedItem, "CANCELLATION_ROLLBACK",
                        jobCard.getId(), jobCard.getJobNumber());
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

    // ========== CHANGE 4: deleteJobCard — restore non-serialized quantities ==========

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
                if (usedItem.getInventoryItem().getHasSerialization()) {
                    // Serialized: release serials (unchanged)
                    if (usedItem.getUsedSerialNumbers() != null) {
                        for (String serialNumber : usedItem.getUsedSerialNumbers()) {
                            try {
                                inventoryService.releaseSerial(serialNumber);
                            } catch (Exception e) {
                                System.err.println("Error releasing serial on delete: " + e.getMessage());
                            }
                        }
                    }
                } else {
                    // ── CHANGE 4: Non-serialized: restore quantity on delete ──
                    // Only restore if job was PENDING (CANCELLED already restored at cancellation time)
                    if (jobCard.getStatus() == JobStatus.PENDING) {
                        restoreNonSerializedForJobCard(usedItem, "JOB_CARD_DELETE",
                                jobCard.getId(), jobCard.getJobNumber());
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