//
//package com.example.demo.service;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.text.SimpleDateFormat;
//import java.time.LocalDateTime;
//import java.util.*;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Service
//@RequiredArgsConstructor
//public class InvoiceService {
//    private final InvoiceRepository invoiceRepository;
//    private final JobCardRepository jobCardRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final InventorySerialRepository inventorySerialRepository;
//    private final StockMovementRepository stockMovementRepository;
//    private final NotificationService notificationService;
//    private final InventoryService inventoryService;
//    private final PaymentRepository paymentRepository;
//    private final ExpenseRepository expenseRepository;
//
//    private static final Set<Long> processingInvoices = ConcurrentHashMap.newKeySet();
//
//    private Map<String, Object> createInvoicePayload(Invoice invoice) {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("id", invoice.getId());
//        payload.put("invoiceNumber", invoice.getInvoiceNumber());
//        payload.put("customerName", invoice.getCustomerName());
//        payload.put("customerPhone", invoice.getCustomerPhone());
//        payload.put("total", invoice.getTotal());
//        payload.put("paidAmount", invoice.getPaidAmount());
//        payload.put("balance", invoice.getBalance());
//        payload.put("paymentStatus", invoice.getPaymentStatus());
//        payload.put("createdAt", invoice.getCreatedAt());
//        return payload;
//    }
//
//    @Transactional
//    public Invoice returnInvoice(Long invoiceId, Long userId, String reason) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (invoice.getIsReturned()) throw new RuntimeException("Invoice has already been returned");
//        if (invoice.getIsDeleted()) throw new RuntimeException("Cannot return a deleted invoice");
//        if (invoice.getPaymentStatus() != PaymentStatus.PAID)
//            throw new RuntimeException("Only fully paid invoices can be returned");
//        if (reason == null || reason.trim().isEmpty()) throw new RuntimeException("Return reason is required");
//
//        createReturnExpense(invoice, reason, userId);
//        reverseStockForReturnedInvoice(invoice);
//
//        invoice.setIsReturned(true);
//        invoice.setReturnedBy(userId);
//        invoice.setReturnedAt(LocalDateTime.now());
//        invoice.setReturnReason(reason);
//        invoice.setReturnedAmount(invoice.getPaidAmount());
//
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_RETURNED,
//                "Invoice returned: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getReturnedAmount() +
//                        " | Reason: " + reason,
//                createInvoicePayload(savedInvoice),
//                NotificationSeverity.WARNING
//        );
//
//        return savedInvoice;
//    }
//
//    private void createReturnExpense(Invoice invoice, String reason, Long userId) {
//        Expense expense = new Expense();
//        expense.setCategory("Invoice Return");
//        String description = String.format(
//                "Invoice Return - %s | Customer: %s | Phone: %s",
//                invoice.getInvoiceNumber(),
//                invoice.getCustomerName(),
//                invoice.getCustomerPhone() != null ? invoice.getCustomerPhone() : "N/A"
//        );
//        expense.setDescription(description);
//        expense.setAmount(BigDecimal.valueOf(invoice.getPaidAmount()));
//        expense.setAutoCreated(true);
//        expense.setSourceType("INVOICE_RETURN");
//        expense.setInvoiceId(invoice.getId());
//        expense.setInvoiceNumber(invoice.getInvoiceNumber());
//        expenseRepository.save(expense);
//    }
//
//    @Transactional
//    protected void reverseStockForReturnedInvoice(Invoice invoice) {
//        if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;
//
//        for (InvoiceItem item : invoice.getItems()) {
//            if ("SERVICE".equals(item.getItemType())) continue;
//            if (item.getInventoryItem() == null) continue;
//
//            try {
//                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//                if (inventoryItem.getHasSerialization()) {
//                    returnSerializedItems(item, invoice, inventoryItem);
//                } else {
//                    returnNonSerializedItems(item, invoice, inventoryItem);
//                }
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to reverse stock for item: " + item.getItemName(), e);
//            }
//        }
//    }
//
//    private void returnSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
//        if (item.getSerialNumbers() == null) return;
//        for (String serialNumber : item.getSerialNumbers()) {
//            try {
//                InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));
//
//                if (serial.getStatus() != SerialStatus.SOLD) continue;
//
//                serial.setStatus(SerialStatus.AVAILABLE);
//                serial.setUsedAt(null);
//                serial.setUsedBy(null);
//                serial.setUsedInReferenceType(null);
//                serial.setUsedInReferenceId(null);
//                serial.setUsedInReferenceNumber(null);
//                serial.setNotes("Returned from invoice: " + invoice.getInvoiceNumber() + " - " + invoice.getReturnReason());
//                inventorySerialRepository.save(serial);
//
//                int previousQuantity = inventoryItem.getQuantity();
//                inventoryItem.setQuantity(previousQuantity + 1);
//                inventoryItemRepository.save(inventoryItem);
//
//                recordReturnStockMovement(inventoryItem, invoice, serialNumber, 1);
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to return serial: " + serialNumber, e);
//            }
//        }
//    }
//
//    private void returnNonSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
//        int quantityToReturn = item.getQuantity();
//        int previousQuantity = inventoryItem.getQuantity();
//        inventoryItem.setQuantity(previousQuantity + quantityToReturn);
//        inventoryItemRepository.save(inventoryItem);
//        recordReturnStockMovement(inventoryItem, invoice, null, quantityToReturn);
//    }
//
//    private void recordReturnStockMovement(InventoryItem item, Invoice invoice, String serialNumber, Integer quantity) {
//        try {
//            StockMovement movement = new StockMovement();
//            movement.setInventoryItem(item);
//            movement.setMovementType(MovementType.IN);
//            movement.setQuantity(quantity);
//            movement.setReferenceType("INVOICE_RETURN");
//            movement.setReferenceId(invoice.getId());
//            movement.setReferenceNumber(invoice.getInvoiceNumber());
//            movement.setReason("Invoice returned: " + invoice.getReturnReason());
//            movement.setSerialNumber(serialNumber);
//            movement.setPerformedBy(getCurrentUsername());
//            movement.setPreviousQuantity(item.getQuantity() - quantity);
//            movement.setNewQuantity(item.getQuantity());
//            movement.setCreatedAt(LocalDateTime.now());
//            stockMovementRepository.save(movement);
//        } catch (Exception e) {
//            System.err.println("Failed to record stock movement: " + e.getMessage());
//        }
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
//            List<InvoiceItem> feeItems = new ArrayList<>();
//            InvoiceItem feeItem = new InvoiceItem();
//            feeItem.setInvoice(invoice);
//            feeItem.setItemName("Cancellation Fee - " + jobCard.getJobNumber());
//            feeItem.setItemCode("CANCEL-FEE");
//            feeItem.setQuantity(1);
//            feeItem.setUnitPrice(fee);
//            feeItem.setTotal(fee);
//            feeItem.setWarranty("No Warranty");
//            feeItem.setItemType("CANCELLATION_FEE");
//            feeItems.add(feeItem);
//
//            invoice.setItems(feeItems);
//            invoice.setSubtotal(fee);
//            invoice.setTotal(fee);
//            invoice.setPaidAmount(0.0);
//            invoice.setBalance(fee);
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//            invoice.setDiscount(0.0);
//            invoice.setTax(0.0);
//            invoice.setServiceTotal(0.0);
//            invoice.setItemsSubtotal(fee);
//            invoiceRepository.save(invoice);
//
//            notificationService.sendNotification(
//                    NotificationType.INVOICE_CREATED,
//                    "Cancellation invoice created: " + invoiceNumber +
//                            " | Amount: Rs." + fee +
//                            " | Job: " + jobCard.getJobNumber(),
//                    createInvoicePayload(invoice),
//                    NotificationSeverity.WARNING
//            );
//        } catch (Exception e) {
//            System.err.println("Failed to create cancellation invoice: " + e.getMessage());
//        }
//    }
//
//    @Transactional
//    public Invoice createInvoice(Invoice invoice) {
//        if (invoice.getJobCard() != null && invoice.getJobCard().getId() != null) {
//            Optional<Invoice> existingInvoice = invoiceRepository.findByJobCardIdAndIsDeletedFalse(invoice.getJobCard().getId());
//            if (existingInvoice.isPresent()) {
//                return updateExistingInvoice(existingInvoice.get().getId(), invoice);
//            }
//        }
//
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//
//        if (invoice.getJobCard() != null && (invoice.getItems() == null || invoice.getItems().isEmpty())) {
//            autoPopulateItemsFromJobCard(invoice);
//        }
//
//        validateInvoiceItems(invoice);
//        calculateInvoiceTotals(invoice);
//        updatePaymentStatus(invoice);
//        validateInvoiceSerials(invoice);
//
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                item.setInvoice(invoice);
//            }
//        }
//
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
//            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
//            savedInvoice.setLastPaymentDate(LocalDateTime.now());
//
//            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//                savedInvoice.setFullyPaidDate(LocalDateTime.now());
//            }
//
//            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
//                    savedInvoice.getPaymentMethod(), "Initial payment");
//
//            if (savedInvoice.getPayments() == null) {
//                savedInvoice.setPayments(new ArrayList<>());
//            }
//            savedInvoice.getPayments().add(payment);
//            savedInvoice = invoiceRepository.save(savedInvoice);
//        }
//
//        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//            processStockForPaidInvoice(savedInvoice);
//        }
//
//        if (savedInvoice.getJobCard() != null && savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Invoice created: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getTotal() +
//                        " | Status: " + savedInvoice.getPaymentStatus(),
//                createInvoicePayload(savedInvoice),
//                NotificationSeverity.SUCCESS
//        );
//
//        return savedInvoice;
//    }
//
//    private void validateInvoiceItems(Invoice invoice) {
//        if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;
//
//        for (InvoiceItem item : invoice.getItems()) {
//            if (item.getInventoryItem() != null && item.getInventoryItem().getId() != null) {
//                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));
//
//                if (inventoryItem.getHasSerialization()) {
//                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
//                        throw new RuntimeException(
//                                "Serial number is required for item: " + inventoryItem.getName() +
//                                        " (SKU: " + inventoryItem.getSku() + "). " +
//                                        "Please add " + item.getQuantity() + " serial number(s)."
//                        );
//                    }
//
//                    if (item.getSerialNumbers().size() != item.getQuantity()) {
//                        throw new RuntimeException(
//                                "Number of serials (" + item.getSerialNumbers().size() + ") " +
//                                        "must match quantity (" + item.getQuantity() + ") " +
//                                        "for item: " + inventoryItem.getName()
//                        );
//                    }
//
//                    long uniqueSerials = item.getSerialNumbers().stream().distinct().count();
//                    if (uniqueSerials != item.getSerialNumbers().size()) {
//                        throw new RuntimeException("Duplicate serial numbers found for item: " + inventoryItem.getName());
//                    }
//
//                    for (String serialNumber : item.getSerialNumbers()) {
//                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                                .orElseThrow(() -> new RuntimeException(
//                                        "Serial number not found in inventory: " + serialNumber
//                                ));
//
//                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
//                            throw new RuntimeException(
//                                    "Serial number not available for invoicing: " + serialNumber +
//                                            ". Status: " + serial.getStatus()
//                            );
//                        }
//
//                        if (!serial.getInventoryItem().getId().equals(inventoryItem.getId())) {
//                            throw new RuntimeException(
//                                    "Serial number " + serialNumber + " does not belong to item: " +
//                                            inventoryItem.getName()
//                            );
//                        }
//                    }
//                }
//            }
//        }
//    }
//
//    // ─────────────────────────────────────────────
//    // ✅ createDirectInvoice — special prices for regular customers
//    // ─────────────────────────────────────────────
//    @Transactional
//    public Invoice createDirectInvoice(CreateInvoiceRequest request) {
//        boolean hasItems = request.getItems() != null && !request.getItems().isEmpty();
//        if (!hasItems) throw new RuntimeException("Direct invoice must have at least one item");
//
//        boolean isRegular = Boolean.TRUE.equals(request.getIsRegularCustomer())
//                && request.getCustomerId() != null;
//
//        Invoice invoice = new Invoice();
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//        invoice.setCustomerName(request.getCustomerName());
//        invoice.setCustomerPhone(request.getCustomerPhone());
//        invoice.setCustomerEmail(request.getCustomerEmail());
//        invoice.setCustomerId(request.getCustomerId());
//        // ✅ Save regular customer flag to DB
//        invoice.setIsRegularCustomer(isRegular);
//        invoice.setPaymentMethod(PaymentMethod.valueOf(
//                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
//        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
//        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
//        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);
//
//        List<InvoiceItem> invoiceItems = new ArrayList<>();
//        for (CreateInvoiceRequest.ItemRequest itemRequest : request.getItems()) {
//            InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
//                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//            InvoiceItem invoiceItem = new InvoiceItem();
//            invoiceItem.setInvoice(invoice);
//            invoiceItem.setInventoryItem(inventoryItem);
//            invoiceItem.setItemName(inventoryItem.getName());
//            invoiceItem.setItemCode(inventoryItem.getSku());
//            invoiceItem.setQuantity(itemRequest.getQuantity());
//
//            // ✅ Special price for regular customers
//            double unitPrice;
//            if (isRegular && inventoryItem.getSpecialPrice() != null && inventoryItem.getSpecialPrice() > 0) {
//                unitPrice = inventoryItem.getSpecialPrice();
//            } else if (itemRequest.getUnitPrice() != null) {
//                unitPrice = itemRequest.getUnitPrice();
//            } else {
//                unitPrice = inventoryItem.getSellingPrice() != null ? inventoryItem.getSellingPrice() : 0.0;
//            }
//            invoiceItem.setUnitPrice(unitPrice);
//            invoiceItem.setTotal(itemRequest.getQuantity() * unitPrice);
//            invoiceItem.setWarranty(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
//            invoiceItem.setWarrantyNumber(itemRequest.getWarrantyNumber());
//
//            if (itemRequest.getSerialNumbers() != null && !itemRequest.getSerialNumbers().isEmpty()) {
//                invoiceItem.setSerialNumbers(new ArrayList<>(itemRequest.getSerialNumbers()));
//            } else if (inventoryItem.getHasSerialization()) {
//                throw new RuntimeException("Serial number is required for item: " + inventoryItem.getName() +
//                        " (SKU: " + inventoryItem.getSku() + ").");
//            }
//
//            invoiceItem.setItemType("PART");
//            invoiceItems.add(invoiceItem);
//        }
//
//        invoice.setItems(invoiceItems);
//        validateInvoiceItems(invoice);
//
//        double subtotal = invoiceItems.stream().mapToDouble(InvoiceItem::getTotal).sum();
//        double total = subtotal - invoice.getDiscount() + invoice.getTax();
//        double balance = total - invoice.getPaidAmount();
//
//        invoice.setSubtotal(subtotal);
//        invoice.setItemsSubtotal(subtotal);
//        invoice.setServiceTotal(0.0);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//
//        if (invoice.getPaidAmount() >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
//            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
//            savedInvoice.setLastPaymentDate(LocalDateTime.now());
//            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
//                savedInvoice.setFullyPaidDate(LocalDateTime.now());
//
//            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
//                    savedInvoice.getPaymentMethod(), "Initial payment");
//            if (savedInvoice.getPayments() == null) savedInvoice.setPayments(new ArrayList<>());
//            savedInvoice.getPayments().add(payment);
//            savedInvoice = invoiceRepository.save(savedInvoice);
//        }
//
//        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
//            processStockForPaidInvoice(savedInvoice);
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Direct invoice created: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getTotal() +
//                        " | Customer: " + savedInvoice.getCustomerName() +
//                        (isRegular ? " (Regular - Special Prices Applied)" : "") +
//                        " | Status: " + savedInvoice.getPaymentStatus(),
//                createInvoicePayload(savedInvoice), NotificationSeverity.SUCCESS);
//
//        return savedInvoice;
//    }
//
//    // ─────────────────────────────────────────────
//    // ✅ createInvoiceFromJobCard — special prices for regular customers
//    // ─────────────────────────────────────────────
//    @Transactional
//    public Invoice createInvoiceFromJobCard(Long jobCardId, CreateInvoiceRequest request) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // ✅ Determine regular customer: from request OR from the job card itself
//        boolean isRegular = Boolean.TRUE.equals(request.getIsRegularCustomer())
//                || Boolean.TRUE.equals(jobCard.getIsRegularCustomer());
//
//        Invoice invoice = new Invoice();
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//        invoice.setJobCard(jobCard);
//        invoice.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : jobCard.getCustomerName());
//        invoice.setCustomerPhone(jobCard.getCustomerPhone());
//        invoice.setCustomerEmail(jobCard.getCustomerEmail());
//        invoice.setCustomerId(request.getCustomerId() != null ? request.getCustomerId()
//                : (jobCard.getCustomer() != null ? (long) jobCard.getCustomer().getCustomerId() : null));
//        // ✅ Save regular customer flag to DB so InvoiceView/InvoiceEdit can read it
//        invoice.setIsRegularCustomer(isRegular);
//        invoice.setPaymentMethod(PaymentMethod.valueOf(
//                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
//        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
//        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
//        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);
//
//        List<InvoiceItem> invoiceItems = new ArrayList<>();
//
//        // ✅ Services — apply special price for regular customers
//        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
//            for (ServiceCategory service : jobCard.getServiceCategories()) {
//                InvoiceItem serviceItem = new InvoiceItem();
//                serviceItem.setInvoice(invoice);
//                serviceItem.setItemName(service.getName());
//                serviceItem.setQuantity(1);
//
//                double servicePrice;
//                if (isRegular && service.getSpecialServicePrice() != null && service.getSpecialServicePrice() > 0) {
//                    servicePrice = service.getSpecialServicePrice();
//                } else {
//                    servicePrice = service.getServicePrice() != null ? service.getServicePrice() : 0.0;
//                }
//                serviceItem.setUnitPrice(servicePrice);
//                serviceItem.setTotal(servicePrice);
//                serviceItem.setWarranty("Service");
//                serviceItem.setItemType("SERVICE");
//                invoiceItems.add(serviceItem);
//            }
//        }
//
//        // ✅ Parts from job card used items — apply special price for regular customers
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InvoiceItem partItem = new InvoiceItem();
//                partItem.setInvoice(invoice);
//                partItem.setItemName(usedItem.getInventoryItem().getName());
//                partItem.setItemCode(usedItem.getInventoryItem().getSku());
//                partItem.setQuantity(usedItem.getQuantityUsed());
//
//                // ✅ Apply special price for regular customers
//                double unitPrice;
//                if (isRegular
//                        && usedItem.getInventoryItem().getSpecialPrice() != null
//                        && usedItem.getInventoryItem().getSpecialPrice() > 0) {
//                    unitPrice = usedItem.getInventoryItem().getSpecialPrice();
//                } else {
//                    unitPrice = usedItem.getUnitPrice();
//                }
//                partItem.setUnitPrice(unitPrice);
//                partItem.setTotal(usedItem.getQuantityUsed() * unitPrice);
//                partItem.setWarranty(usedItem.getWarrantyPeriod());
//
//                if (request.getItems() != null) {
//                    for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
//                        if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())) {
//                            partItem.setWarrantyNumber(reqItem.getWarrantyNumber());
//                            break;
//                        }
//                    }
//                }
//
//                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
//                    partItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
//                } else if (usedItem.getInventoryItem().getHasSerialization()) {
//                    if (request.getItems() != null) {
//                        for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
//                            if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())
//                                    && reqItem.getSerialNumbers() != null) {
//                                partItem.setSerialNumbers(new ArrayList<>(reqItem.getSerialNumbers()));
//                                break;
//                            }
//                        }
//                    }
//                    if (partItem.getSerialNumbers() == null) partItem.setSerialNumbers(new ArrayList<>());
//                }
//
//                partItem.setItemType("PART");
//                invoiceItems.add(partItem);
//            }
//        }
//
//        invoice.setItems(invoiceItems);
//
//        if (!invoiceItems.isEmpty()) validateInvoiceItems(invoice);
//
//        double itemsSubtotal = invoiceItems.stream()
//                .filter(i -> "PART".equals(i.getItemType()))
//                .mapToDouble(InvoiceItem::getTotal).sum();
//        double serviceTotal = invoiceItems.stream()
//                .filter(i -> "SERVICE".equals(i.getItemType()))
//                .mapToDouble(InvoiceItem::getTotal).sum();
//        double subtotal = itemsSubtotal + serviceTotal;
//        double total = subtotal - invoice.getDiscount() + invoice.getTax();
//        double balance = total - invoice.getPaidAmount();
//
//        invoice.setItemsSubtotal(itemsSubtotal);
//        invoice.setServiceTotal(serviceTotal);
//        invoice.setSubtotal(subtotal);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//
//        if (invoice.getPaidAmount() >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
//            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
//            savedInvoice.setLastPaymentDate(LocalDateTime.now());
//            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
//                savedInvoice.setFullyPaidDate(LocalDateTime.now());
//
//            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
//                    savedInvoice.getPaymentMethod(), "Initial payment");
//            if (savedInvoice.getPayments() == null) savedInvoice.setPayments(new ArrayList<>());
//            savedInvoice.getPayments().add(payment);
//            savedInvoice = invoiceRepository.save(savedInvoice);
//        }
//
//        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//            processStockForPaidInvoice(savedInvoice);
//            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Invoice created from job card: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getTotal() +
//                        (isRegular ? " (Regular Customer - Special Prices Applied)" : "") +
//                        " | Status: " + savedInvoice.getPaymentStatus(),
//                createInvoicePayload(savedInvoice), NotificationSeverity.SUCCESS);
//
//        return savedInvoice;
//    }
//
//    private Payment createPaymentRecord(Invoice invoice, Double amount, PaymentMethod method, String notes) {
//        if (invoice.getId() == null) throw new RuntimeException("Cannot create payment for unsaved invoice");
//        Payment payment = new Payment();
//        payment.setInvoice(invoice);
//        payment.setAmount(amount);
//        payment.setPaymentMethod(method);
//        payment.setNotes(notes);
//        payment.setPaymentDate(LocalDateTime.now());
//        payment.setReceivedBy(getCurrentUserId());
//        return paymentRepository.save(payment);
//    }
//
//    private Long getCurrentUserId() {
//        return 1L;
//    }
//
//    @Transactional
//    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (invoice.getPaymentStatus() == PaymentStatus.PAID)
//            throw new RuntimeException("Invoice is already fully paid");
//        if (amount <= 0) throw new RuntimeException("Payment amount must be greater than 0");
//        if (amount > invoice.getBalance()) throw new RuntimeException("Payment amount cannot exceed balance due");
//
//        PaymentStatus oldStatus = invoice.getPaymentStatus();
//        LocalDateTime paymentTime = LocalDateTime.now();
//
//        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//        invoice.setPaymentMethod(method);
//
//        if (invoice.getFirstPaymentDate() == null) invoice.setFirstPaymentDate(paymentTime);
//        invoice.setLastPaymentDate(paymentTime);
//        if (invoice.getPaidAmount() >= invoice.getTotal()) invoice.setFullyPaidDate(paymentTime);
//
//        updatePaymentStatus(invoice);
//
//        Payment payment = createPaymentRecord(invoice, amount, method, "Payment received");
//        if (invoice.getPayments() == null) invoice.setPayments(new ArrayList<>());
//        invoice.getPayments().add(payment);
//
//        Invoice saved = invoiceRepository.save(invoice);
//
//        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
//            processStockForPaidInvoice(saved);
//        }
//
//        notificationService.sendNotification(
//                NotificationType.PAYMENT_RECEIVED,
//                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
//                        " | New Balance: Rs." + saved.getBalance() +
//                        " | Payment Status: " + saved.getPaymentStatus(),
//                createInvoicePayload(saved),
//                NotificationSeverity.SUCCESS
//        );
//
//        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(saved.getJobCard().getId());
//        }
//
//        return saved;
//    }
//
//    public List<Payment> getPaymentHistory(Long invoiceId) {
//        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
//    }
//
//    public Double getVerifiedPaidAmount(Long invoiceId) {
//        Double verifiedAmount = paymentRepository.getTotalPaidAmountByInvoiceId(invoiceId);
//        return verifiedAmount != null ? verifiedAmount : 0.0;
//    }
//
//    @Transactional
//    protected void processStockForPaidInvoice(Invoice invoice) {
//        if (isInvoiceBeingProcessed(invoice.getId())) return;
//        markInvoiceAsProcessing(invoice.getId());
//
//        try {
//            if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;
//
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() == null) continue;
//                if ("SERVICE".equals(item.getItemType()) || "CANCELLATION_FEE".equals(item.getItemType())) continue;
//
//                try {
//                    if (item.getInventoryItem().getHasSerialization()) {
//                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
//                            markSerialsAsSoldForInvoice(item, invoice);
//                        }
//                    } else {
//                        updateInventoryQuantityForInvoiceItem(item, invoice);
//                    }
//                } catch (Exception e) {
//                    System.err.println("Error processing item: " + item.getItemName() + " - " + e.getMessage());
//                }
//            }
//        } finally {
//            unmarkInvoiceProcessing(invoice.getId());
//        }
//    }
//
//    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
//        for (String serialNumber : item.getSerialNumbers()) {
//            try {
//                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));
//
//                if (inventorySerial.getStatus() == SerialStatus.SOLD) continue;
//
//                if (inventorySerial.getStatus() == SerialStatus.AVAILABLE || inventorySerial.getStatus() == SerialStatus.USED) {
//                    inventorySerial.setStatus(SerialStatus.SOLD);
//                    inventorySerial.setUsedAt(LocalDateTime.now());
//                    inventorySerial.setUsedBy(getCurrentUsername());
//                    inventorySerial.setUsedInReferenceType("INVOICE");
//                    inventorySerial.setUsedInReferenceId(invoice.getId());
//                    inventorySerial.setUsedInReferenceNumber(invoice.getInvoiceNumber());
//                    inventorySerial.setNotes("Sold via invoice payment - " + invoice.getInvoiceNumber());
//                    inventorySerialRepository.save(inventorySerial);
//
//                    updateInventoryQuantityForSerialSale(inventorySerial.getInventoryItem(), 1);
//                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
//                }
//            } catch (Exception e) {
//                System.err.println("Error marking serial as SOLD: " + serialNumber + " - " + e.getMessage());
//            }
//        }
//    }
//
//    private void updateInventoryQuantityForSerialSale(InventoryItem item, int quantity) {
//        int previousQuantity = item.getQuantity();
//        int newQuantity = previousQuantity - quantity;
//        if (newQuantity < 0) throw new RuntimeException("Cannot reduce quantity below 0 for item: " + item.getName());
//        item.setQuantity(newQuantity);
//        inventoryItemRepository.save(item);
//    }
//
//    private void updateInventoryQuantityForInvoiceItem(InvoiceItem item, Invoice invoice) {
//        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//        if (!invItem.getHasSerialization()) {
//            int quantityToDeduct = item.getQuantity();
//            int previousQuantity = invItem.getQuantity();
//            if (previousQuantity < quantityToDeduct)
//                throw new RuntimeException("Insufficient stock for item: " + invItem.getName());
//
//            int newQuantity = previousQuantity - quantityToDeduct;
//            invItem.setQuantity(newQuantity);
//            inventoryItemRepository.save(invItem);
//            recordStockMovementForQuantity(invItem, invoice, quantityToDeduct, previousQuantity, newQuantity);
//        }
//    }
//
//    private void recordStockMovementForSerial(InventoryItem item, Invoice invoice, String serialNumber) {
//        try {
//            StockMovement movement = new StockMovement();
//            movement.setInventoryItem(item);
//            movement.setMovementType(MovementType.OUT);
//            movement.setQuantity(1);
//            movement.setReferenceType("INVOICE");
//            movement.setReferenceId(invoice.getId());
//            movement.setReferenceNumber(invoice.getInvoiceNumber());
//            movement.setReason("Serial sold via invoice payment");
//            movement.setSerialNumber(serialNumber);
//            movement.setPerformedBy(getCurrentUsername());
//            movement.setPreviousQuantity(item.getQuantity() + 1);
//            movement.setNewQuantity(item.getQuantity());
//            movement.setCreatedAt(LocalDateTime.now());
//            stockMovementRepository.save(movement);
//        } catch (Exception e) {
//            System.err.println("Failed to record stock movement for serial: " + e.getMessage());
//        }
//    }
//
//    private void recordStockMovementForQuantity(InventoryItem item, Invoice invoice, Integer quantity,
//                                                Integer previousQuantity, Integer newQuantity) {
//        try {
//            StockMovement movement = new StockMovement();
//            movement.setInventoryItem(item);
//            movement.setMovementType(MovementType.OUT);
//            movement.setQuantity(quantity);
//            movement.setReferenceType("INVOICE");
//            movement.setReferenceId(invoice.getId());
//            movement.setReferenceNumber(invoice.getInvoiceNumber());
//            movement.setReason("Quantity sold via invoice payment");
//            movement.setPerformedBy(getCurrentUsername());
//            movement.setPreviousQuantity(previousQuantity);
//            movement.setNewQuantity(newQuantity);
//            movement.setCreatedAt(LocalDateTime.now());
//            stockMovementRepository.save(movement);
//        } catch (Exception e) {
//            System.err.println("Failed to record stock movement: " + e.getMessage());
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
//    protected void updateJobCardStatusToDelivered(Long jobCardId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getStatus() == JobStatus.COMPLETED) {
//            jobCard.setStatus(JobStatus.DELIVERED);
//            jobCardRepository.save(jobCard);
//
//            Map<String, Object> jobPayload = new HashMap<>();
//            jobPayload.put("id", jobCard.getId());
//            jobPayload.put("jobNumber", jobCard.getJobNumber());
//            jobPayload.put("status", jobCard.getStatus());
//            jobPayload.put("customerName", jobCard.getCustomerName());
//
//            notificationService.sendNotification(
//                    NotificationType.DELIVERED,
//                    "Job card " + jobCard.getJobNumber() + " marked as DELIVERED (Invoice fully paid)",
//                    jobPayload,
//                    NotificationSeverity.INFO
//            );
//        }
//    }
//
//    private void calculateInvoiceTotals(Invoice invoice) {
//        Double itemsSubtotal = 0.0;
//        if (invoice.getItems() != null) {
//            itemsSubtotal = invoice.getItems().stream()
//                    .mapToDouble(item -> {
//                        if (item.getQuantity() != null && item.getUnitPrice() != null)
//                            return item.getQuantity() * item.getUnitPrice();
//                        return 0.0;
//                    }).sum();
//        }
//
//        Double serviceTotal = 0.0;
//        if (invoice.getJobCard() != null) {
//            JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId()).orElse(null);
//            if (jobCard != null && jobCard.getServiceCategories() != null) {
//                boolean isRegular = Boolean.TRUE.equals(invoice.getIsRegularCustomer());
//                serviceTotal = jobCard.getServiceCategories().stream()
//                        .mapToDouble(sc -> {
//                            if (isRegular && sc.getSpecialServicePrice() != null && sc.getSpecialServicePrice() > 0) {
//                                return sc.getSpecialServicePrice();
//                            }
//                            return sc.getServicePrice() != null ? sc.getServicePrice() : 0.0;
//                        })
//                        .sum();
//            }
//        }
//
//        Double combinedSubtotal = itemsSubtotal + serviceTotal;
//        Double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
//        Double tax = invoice.getTax() != null ? invoice.getTax() : 0.0;
//        Double total = combinedSubtotal - discount + tax;
//        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
//        Double balance = total - paidAmount;
//
//        invoice.setItemsSubtotal(itemsSubtotal);
//        invoice.setServiceTotal(serviceTotal);
//        invoice.setSubtotal(combinedSubtotal);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//    }
//
//    private void updatePaymentStatus(Invoice invoice) {
//        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
//        Double total = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
//
//        if (paidAmount >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//            invoice.setBalance(0.0);
//        } else if (paidAmount > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//    }
//
//    @Transactional
//    public Invoice updateInvoice(Long id, Invoice updates) {
//        Invoice existing = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (existing.getPaymentStatus() == PaymentStatus.PAID)
//            throw new RuntimeException("Cannot update a fully paid invoice");
//
//        validateInvoiceItems(updates);
//
//        Double oldPaidAmount = existing.getPaidAmount();
//
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDiscount(updates.getDiscount());
//        existing.setTax(updates.getTax());
//        existing.setPaymentMethod(updates.getPaymentMethod());
//        existing.setPaidAmount(updates.getPaidAmount());
//
//        // ✅ Preserve isRegularCustomer on update
//        if (updates.getIsRegularCustomer() != null) {
//            existing.setIsRegularCustomer(updates.getIsRegularCustomer());
//        }
//
//        if (updates.getItems() != null) {
//            existing.getItems().clear();
//            for (InvoiceItem item : updates.getItems()) {
//                item.setInvoice(existing);
//                existing.getItems().add(item);
//            }
//        }
//
//        calculateInvoiceTotals(existing);
//        updatePaymentStatus(existing);
//
//        if (!oldPaidAmount.equals(existing.getPaidAmount())) {
//            updatePaymentDates(existing, oldPaidAmount);
//        }
//
//        Invoice saved = invoiceRepository.save(existing);
//
//        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(saved.getJobCard().getId());
//        }
//
//        return saved;
//    }
//
//    private void updatePaymentDates(Invoice invoice, Double oldPaidAmount) {
//        LocalDateTime now = LocalDateTime.now();
//        if (invoice.getPaidAmount() > 0 && invoice.getFirstPaymentDate() == null) {
//            invoice.setFirstPaymentDate(now);
//            invoice.setLastPaymentDate(now);
//            if (invoice.getId() != null) {
//                createPaymentRecord(invoice, invoice.getPaidAmount(),
//                        invoice.getPaymentMethod(), "Initial payment (via update)");
//            }
//        } else if (invoice.getPaidAmount() > oldPaidAmount) {
//            invoice.setLastPaymentDate(now);
//            if (invoice.getId() != null) {
//                Double additionalAmount = invoice.getPaidAmount() - oldPaidAmount;
//                createPaymentRecord(invoice, additionalAmount,
//                        invoice.getPaymentMethod(), "Additional payment (via update)");
//            }
//        }
//        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//            invoice.setFullyPaidDate(now);
//        } else {
//            invoice.setFullyPaidDate(null);
//        }
//    }
//
//    private void autoPopulateItemsFromJobCard(Invoice invoice) {
//        if (invoice.getJobCard() == null) return;
//
//        JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId())
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            List<InvoiceItem> invoiceItems = new ArrayList<>();
//
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InvoiceItem invoiceItem = new InvoiceItem();
//                invoiceItem.setInvoice(invoice);
//                invoiceItem.setInventoryItem(usedItem.getInventoryItem());
//                invoiceItem.setItemName(usedItem.getInventoryItem().getName());
//                invoiceItem.setItemCode(usedItem.getInventoryItem().getSku());
//                invoiceItem.setQuantity(usedItem.getQuantityUsed());
//                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
//                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
//                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
//                        usedItem.getWarrantyPeriod() : "No Warranty");
//
//                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
//                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
//                } else if (usedItem.getInventoryItem().getHasSerialization()) {
//                    invoiceItem.setSerialNumbers(new ArrayList<>());
//                }
//
//                invoiceItems.add(invoiceItem);
//            }
//
//            invoice.setItems(invoiceItems);
//        }
//    }
//
//    private void validateInvoiceSerials(Invoice invoice) {
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() != null && item.getInventoryItem().getHasSerialization()) {
//                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
//                        throw new RuntimeException("Serial numbers required for item: " + item.getItemName());
//                    }
//                    if (item.getSerialNumbers().size() != item.getQuantity()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + item.getItemName());
//                    }
//                    for (String serialNumber : item.getSerialNumbers()) {
//                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                                .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));
//                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
//                            throw new RuntimeException("Serial number not available for invoicing: " + serialNumber + ". Status: " + serial.getStatus());
//                        }
//                    }
//                }
//            }
//        }
//    }
//
//    @Transactional
//    public void deleteInvoice(Long id, Long deletedBy, String reason) {
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (invoice.getPaymentStatus() == PaymentStatus.PAID)
//            throw new RuntimeException("Cannot delete a fully paid invoice");
//
//        invoice.setIsDeleted(true);
//        invoice.setDeletedBy(deletedBy);
//        invoice.setDeletedAt(LocalDateTime.now());
//        invoice.setDeletionReason(reason);
//
//        invoiceRepository.save(invoice);
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_DELETED,
//                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
//                createInvoicePayload(invoice),
//                NotificationSeverity.WARNING
//        );
//    }
//
//    private Invoice updateExistingInvoice(Long existingInvoiceId, Invoice newInvoiceData) {
//        Invoice existing = invoiceRepository.findById(existingInvoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        validateInvoiceItems(newInvoiceData);
//
//        existing.setCustomerName(newInvoiceData.getCustomerName());
//        existing.setCustomerPhone(newInvoiceData.getCustomerPhone());
//        existing.setCustomerEmail(newInvoiceData.getCustomerEmail());
//        existing.setDiscount(newInvoiceData.getDiscount());
//        existing.setTax(newInvoiceData.getTax());
//        existing.setPaymentMethod(newInvoiceData.getPaymentMethod());
//
//        existing.getItems().clear();
//        if (newInvoiceData.getItems() != null) {
//            for (InvoiceItem item : newInvoiceData.getItems()) {
//                item.setInvoice(existing);
//                existing.getItems().add(item);
//            }
//        }
//
//        calculateInvoiceTotals(existing);
//        updatePaymentStatus(existing);
//        return invoiceRepository.save(existing);
//    }
//
//    private boolean isInvoiceBeingProcessed(Long invoiceId) {
//        return processingInvoices.contains(invoiceId);
//    }
//
//    private void markInvoiceAsProcessing(Long invoiceId) {
//        processingInvoices.add(invoiceId);
//    }
//
//    private void unmarkInvoiceProcessing(Long invoiceId) {
//        processingInvoices.remove(invoiceId);
//    }
//
//    public Invoice getInvoiceByIdWithItems(Long id) {
//        return invoiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
//    }
//
//    public List<Invoice> getAllInvoices() {
//        return invoiceRepository.findAll().stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
//        return invoiceRepository.findAll().stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .filter(invoice -> invoice.getJobCard() != null)
//                .filter(invoice -> invoice.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
//                .toList();
//    }
//
//    public List<Invoice> searchByCustomerOrInvoice(String term) {
//        return invoiceRepository.searchInvoices(term).stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public InvoiceSummary getInvoiceSummary() {
//        List<Invoice> allInvoices = getAllInvoices();
//
//        Double totalRevenue = allInvoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0).sum();
//        Double totalCollected = allInvoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0).sum();
//        Double totalOutstanding = allInvoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0).sum();
//        Long paidCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID).count();
//        Long partialCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PARTIAL).count();
//        Long unpaidCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID).count();
//
//        return new InvoiceSummary(totalRevenue, totalCollected, totalOutstanding,
//                (long) allInvoices.size(), paidCount, partialCount, unpaidCount);
//    }
//
//    public record InvoiceSummary(
//            Double totalRevenue, Double totalCollected, Double totalOutstanding,
//            Long totalInvoices, Long paidCount, Long partialCount, Long unpaidCount
//    ) {}
//}





package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    private static final Set<Long> processingInvoices = ConcurrentHashMap.newKeySet();

    private Map<String, Object> createInvoicePayload(Invoice invoice) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", invoice.getId());
        payload.put("invoiceNumber", invoice.getInvoiceNumber());
        payload.put("customerName", invoice.getCustomerName());
        payload.put("customerPhone", invoice.getCustomerPhone());
        payload.put("total", invoice.getTotal());
        payload.put("paidAmount", invoice.getPaidAmount());
        payload.put("balance", invoice.getBalance());
        payload.put("paymentStatus", invoice.getPaymentStatus());
        payload.put("createdAt", invoice.getCreatedAt());
        return payload;
    }

    // ========== HELPER: deduct non-serialized quantity for a direct invoice item ==========

    /**
     * Deduct non-serialized inventory quantity at direct invoice creation.
     * Serialized items are NOT touched here.
     */
    private void deductNonSerializedForDirectInvoice(InvoiceItem item, Invoice invoice) {
        if (item.getInventoryItem() == null) return;
        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        if (invItem.getHasSerialization()) return; // serialized: no change here

        int oldQty = invItem.getQuantity();
        if (oldQty < item.getQuantity()) {
            throw new RuntimeException("Insufficient stock for item: " + invItem.getName() +
                    ". Available: " + oldQty + ", Requested: " + item.getQuantity());
        }
        invItem.setQuantity(oldQty - item.getQuantity());
        inventoryItemRepository.save(invItem);

        // Record stock movement
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(invItem);
        movement.setMovementType(MovementType.OUT);
        movement.setQuantity(item.getQuantity());
        movement.setReferenceType("INVOICE");
        movement.setReferenceId(invoice.getId());
        movement.setReferenceNumber(invoice.getInvoiceNumber());
        movement.setReason("Sold via direct invoice");
        movement.setPerformedBy(getCurrentUsername());
        movement.setPreviousQuantity(oldQty);
        movement.setNewQuantity(invItem.getQuantity());
        movement.setCreatedAt(LocalDateTime.now());
        stockMovementRepository.save(movement);

        System.out.println("📦 Non-serialized deducted at direct invoice: " + invItem.getName()
                + " | Qty: -" + item.getQuantity() + " | New stock: " + invItem.getQuantity());
    }

    /**
     * Restore non-serialized inventory quantity for a direct invoice item.
     * Used when invoice is updated (item removed) or deleted.
     * Serialized items are NOT touched here.
     */
    private void restoreNonSerializedForDirectInvoice(InvoiceItem item, Invoice invoice) {
        if (item.getInventoryItem() == null) return;
        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                .orElse(null);
        if (invItem == null) return;
        if (invItem.getHasSerialization()) return; // serialized: no change

        int oldQty = invItem.getQuantity();
        invItem.setQuantity(oldQty + item.getQuantity());
        inventoryItemRepository.save(invItem);

        // Record stock movement
        StockMovement movement = new StockMovement();
        movement.setInventoryItem(invItem);
        movement.setMovementType(MovementType.IN);
        movement.setQuantity(item.getQuantity());
        movement.setReferenceType("INVOICE_RESTORE");
        movement.setReferenceId(invoice.getId());
        movement.setReferenceNumber(invoice.getInvoiceNumber());
        movement.setReason("Stock restored from invoice update/deletion");
        movement.setPerformedBy(getCurrentUsername());
        movement.setPreviousQuantity(oldQty);
        movement.setNewQuantity(invItem.getQuantity());
        movement.setCreatedAt(LocalDateTime.now());
        stockMovementRepository.save(movement);

        System.out.println("📦 Non-serialized restored from invoice: " + invItem.getName()
                + " | Qty: +" + item.getQuantity() + " | New stock: " + invItem.getQuantity());
    }

    // ========== returnInvoice (unchanged) ==========

    @Transactional
    public Invoice returnInvoice(Long invoiceId, Long userId, String reason) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getIsReturned()) throw new RuntimeException("Invoice has already been returned");
        if (invoice.getIsDeleted()) throw new RuntimeException("Cannot return a deleted invoice");
        if (invoice.getPaymentStatus() != PaymentStatus.PAID)
            throw new RuntimeException("Only fully paid invoices can be returned");
        if (reason == null || reason.trim().isEmpty()) throw new RuntimeException("Return reason is required");

        createReturnExpense(invoice, reason, userId);
        reverseStockForReturnedInvoice(invoice);

        invoice.setIsReturned(true);
        invoice.setReturnedBy(userId);
        invoice.setReturnedAt(LocalDateTime.now());
        invoice.setReturnReason(reason);
        invoice.setReturnedAmount(invoice.getPaidAmount());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_RETURNED,
                "Invoice returned: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getReturnedAmount() +
                        " | Reason: " + reason,
                createInvoicePayload(savedInvoice),
                NotificationSeverity.WARNING
        );

        return savedInvoice;
    }

    private void createReturnExpense(Invoice invoice, String reason, Long userId) {
        Expense expense = new Expense();
        expense.setCategory("Invoice Return");
        String description = String.format(
                "Invoice Return - %s | Customer: %s | Phone: %s",
                invoice.getInvoiceNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerPhone() != null ? invoice.getCustomerPhone() : "N/A"
        );
        expense.setDescription(description);
        expense.setAmount(BigDecimal.valueOf(invoice.getPaidAmount()));
        expense.setAutoCreated(true);
        expense.setSourceType("INVOICE_RETURN");
        expense.setInvoiceId(invoice.getId());
        expense.setInvoiceNumber(invoice.getInvoiceNumber());
        expenseRepository.save(expense);
    }

    @Transactional
    protected void reverseStockForReturnedInvoice(Invoice invoice) {
        if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;

        for (InvoiceItem item : invoice.getItems()) {
            if ("SERVICE".equals(item.getItemType())) continue;
            if (item.getInventoryItem() == null) continue;

            try {
                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));

                if (inventoryItem.getHasSerialization()) {
                    returnSerializedItems(item, invoice, inventoryItem);
                } else {
                    returnNonSerializedItems(item, invoice, inventoryItem);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to reverse stock for item: " + item.getItemName(), e);
            }
        }
    }

    private void returnSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
        if (item.getSerialNumbers() == null) return;
        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

                if (serial.getStatus() != SerialStatus.SOLD) continue;

                serial.setStatus(SerialStatus.AVAILABLE);
                serial.setUsedAt(null);
                serial.setUsedBy(null);
                serial.setUsedInReferenceType(null);
                serial.setUsedInReferenceId(null);
                serial.setUsedInReferenceNumber(null);
                serial.setNotes("Returned from invoice: " + invoice.getInvoiceNumber() + " - " + invoice.getReturnReason());
                inventorySerialRepository.save(serial);

                int previousQuantity = inventoryItem.getQuantity();
                inventoryItem.setQuantity(previousQuantity + 1);
                inventoryItemRepository.save(inventoryItem);

                recordReturnStockMovement(inventoryItem, invoice, serialNumber, 1);
            } catch (Exception e) {
                throw new RuntimeException("Failed to return serial: " + serialNumber, e);
            }
        }
    }

    private void returnNonSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
        int quantityToReturn = item.getQuantity();
        int previousQuantity = inventoryItem.getQuantity();
        inventoryItem.setQuantity(previousQuantity + quantityToReturn);
        inventoryItemRepository.save(inventoryItem);
        recordReturnStockMovement(inventoryItem, invoice, null, quantityToReturn);
    }

    private void recordReturnStockMovement(InventoryItem item, Invoice invoice, String serialNumber, Integer quantity) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.IN);
            movement.setQuantity(quantity);
            movement.setReferenceType("INVOICE_RETURN");
            movement.setReferenceId(invoice.getId());
            movement.setReferenceNumber(invoice.getInvoiceNumber());
            movement.setReason("Invoice returned: " + invoice.getReturnReason());
            movement.setSerialNumber(serialNumber);
            movement.setPerformedBy(getCurrentUsername());
            movement.setPreviousQuantity(item.getQuantity() - quantity);
            movement.setNewQuantity(item.getQuantity());
            movement.setCreatedAt(LocalDateTime.now());
            stockMovementRepository.save(movement);
        } catch (Exception e) {
            System.err.println("Failed to record stock movement: " + e.getMessage());
        }
    }

    private String generateInvoiceNumber() {
        Long count = invoiceRepository.count();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String datePart = sdf.format(new Date());
        String sequencePart = String.format("%05d", (count + 1));
        return "INV-" + datePart + "-" + sequencePart;
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

            List<InvoiceItem> feeItems = new ArrayList<>();
            InvoiceItem feeItem = new InvoiceItem();
            feeItem.setInvoice(invoice);
            feeItem.setItemName("Cancellation Fee - " + jobCard.getJobNumber());
            feeItem.setItemCode("CANCEL-FEE");
            feeItem.setQuantity(1);
            feeItem.setUnitPrice(fee);
            feeItem.setTotal(fee);
            feeItem.setWarranty("No Warranty");
            feeItem.setItemType("CANCELLATION_FEE");
            feeItems.add(feeItem);

            invoice.setItems(feeItems);
            invoice.setSubtotal(fee);
            invoice.setTotal(fee);
            invoice.setPaidAmount(0.0);
            invoice.setBalance(fee);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setDiscount(0.0);
            invoice.setTax(0.0);
            invoice.setServiceTotal(0.0);
            invoice.setItemsSubtotal(fee);
            invoiceRepository.save(invoice);

            notificationService.sendNotification(
                    NotificationType.INVOICE_CREATED,
                    "Cancellation invoice created: " + invoiceNumber +
                            " | Amount: Rs." + fee +
                            " | Job: " + jobCard.getJobNumber(),
                    createInvoicePayload(invoice),
                    NotificationSeverity.WARNING
            );
        } catch (Exception e) {
            System.err.println("Failed to create cancellation invoice: " + e.getMessage());
        }
    }

    // ========== createInvoice (unchanged) ==========

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getJobCard() != null && invoice.getJobCard().getId() != null) {
            Optional<Invoice> existingInvoice = invoiceRepository.findByJobCardIdAndIsDeletedFalse(invoice.getJobCard().getId());
            if (existingInvoice.isPresent()) {
                return updateExistingInvoice(existingInvoice.get().getId(), invoice);
            }
        }

        invoice.setInvoiceNumber(generateInvoiceNumber());

        if (invoice.getJobCard() != null && (invoice.getItems() == null || invoice.getItems().isEmpty())) {
            autoPopulateItemsFromJobCard(invoice);
        }

        validateInvoiceItems(invoice);
        calculateInvoiceTotals(invoice);
        updatePaymentStatus(invoice);
        validateInvoiceSerials(invoice);

        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
            }
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
            savedInvoice.setLastPaymentDate(LocalDateTime.now());

            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
                savedInvoice.setFullyPaidDate(LocalDateTime.now());
            }

            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
                    savedInvoice.getPaymentMethod(), "Initial payment");

            if (savedInvoice.getPayments() == null) {
                savedInvoice.setPayments(new ArrayList<>());
            }
            savedInvoice.getPayments().add(payment);
            savedInvoice = invoiceRepository.save(savedInvoice);
        }

        // Deduct non-serialized quantities immediately.
        // - No job card: deduct now (direct sale, not previously deducted)
        // - Has job card: already deducted at job card creation — skip
        if (savedInvoice.getJobCard() == null && invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if ("SERVICE".equals(item.getItemType()) || "CANCELLATION_FEE".equals(item.getItemType())) continue;
                if (item.getInventoryItem() == null) continue;
                deductNonSerializedForDirectInvoice(item, savedInvoice);
            }
        }

        // processStockForPaidInvoice handles serialized SOLD marking only
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
        }

        if (savedInvoice.getJobCard() != null && savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                createInvoicePayload(savedInvoice),
                NotificationSeverity.SUCCESS
        );

        return savedInvoice;
    }

    private void validateInvoiceItems(Invoice invoice) {
        if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;

        for (InvoiceItem item : invoice.getItems()) {
            if (item.getInventoryItem() != null && item.getInventoryItem().getId() != null) {
                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));

                if (inventoryItem.getHasSerialization()) {
                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
                        throw new RuntimeException(
                                "Serial number is required for item: " + inventoryItem.getName() +
                                        " (SKU: " + inventoryItem.getSku() + "). " +
                                        "Please add " + item.getQuantity() + " serial number(s)."
                        );
                    }

                    if (item.getSerialNumbers().size() != item.getQuantity()) {
                        throw new RuntimeException(
                                "Number of serials (" + item.getSerialNumbers().size() + ") " +
                                        "must match quantity (" + item.getQuantity() + ") " +
                                        "for item: " + inventoryItem.getName()
                        );
                    }

                    long uniqueSerials = item.getSerialNumbers().stream().distinct().count();
                    if (uniqueSerials != item.getSerialNumbers().size()) {
                        throw new RuntimeException("Duplicate serial numbers found for item: " + inventoryItem.getName());
                    }

                    for (String serialNumber : item.getSerialNumbers()) {
                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                                .orElseThrow(() -> new RuntimeException(
                                        "Serial number not found in inventory: " + serialNumber
                                ));

                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
                            throw new RuntimeException(
                                    "Serial number not available for invoicing: " + serialNumber +
                                            ". Status: " + serial.getStatus()
                            );
                        }

                        if (!serial.getInventoryItem().getId().equals(inventoryItem.getId())) {
                            throw new RuntimeException(
                                    "Serial number " + serialNumber + " does not belong to item: " +
                                            inventoryItem.getName()
                            );
                        }
                    }
                }
            }
        }
    }

    // ========== CHANGE 5: createDirectInvoice — deduct non-serialized immediately ==========

    @Transactional
    public Invoice createDirectInvoice(CreateInvoiceRequest request) {
        boolean hasItems = request.getItems() != null && !request.getItems().isEmpty();
        if (!hasItems) throw new RuntimeException("Direct invoice must have at least one item");

        boolean isRegular = Boolean.TRUE.equals(request.getIsRegularCustomer())
                && request.getCustomerId() != null;

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCustomerName(request.getCustomerName());
        invoice.setCustomerPhone(request.getCustomerPhone());
        invoice.setCustomerEmail(request.getCustomerEmail());
        invoice.setCustomerId(request.getCustomerId());
        invoice.setIsRegularCustomer(isRegular);
        invoice.setPaymentMethod(PaymentMethod.valueOf(
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);

        List<InvoiceItem> invoiceItems = new ArrayList<>();
        for (CreateInvoiceRequest.ItemRequest itemRequest : request.getItems()) {
            InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));

            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.setInvoice(invoice);
            invoiceItem.setInventoryItem(inventoryItem);
            invoiceItem.setItemName(inventoryItem.getName());
            invoiceItem.setItemCode(inventoryItem.getSku());
            invoiceItem.setQuantity(itemRequest.getQuantity());

            // Special price for regular customers
            double unitPrice;
            if (isRegular && inventoryItem.getSpecialPrice() != null && inventoryItem.getSpecialPrice() > 0) {
                unitPrice = inventoryItem.getSpecialPrice();
            } else if (itemRequest.getUnitPrice() != null) {
                unitPrice = itemRequest.getUnitPrice();
            } else {
                unitPrice = inventoryItem.getSellingPrice() != null ? inventoryItem.getSellingPrice() : 0.0;
            }
            invoiceItem.setUnitPrice(unitPrice);
            invoiceItem.setTotal(itemRequest.getQuantity() * unitPrice);
            invoiceItem.setWarranty(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
            invoiceItem.setWarrantyNumber(itemRequest.getWarrantyNumber());

            if (itemRequest.getSerialNumbers() != null && !itemRequest.getSerialNumbers().isEmpty()) {
                invoiceItem.setSerialNumbers(new ArrayList<>(itemRequest.getSerialNumbers()));
            } else if (inventoryItem.getHasSerialization()) {
                throw new RuntimeException("Serial number is required for item: " + inventoryItem.getName() +
                        " (SKU: " + inventoryItem.getSku() + ").");
            }

            invoiceItem.setItemType("PART");
            invoiceItems.add(invoiceItem);
        }

        invoice.setItems(invoiceItems);
        validateInvoiceItems(invoice);

        double subtotal = invoiceItems.stream().mapToDouble(InvoiceItem::getTotal).sum();
        double total = subtotal - invoice.getDiscount() + invoice.getTax();
        double balance = total - invoice.getPaidAmount();

        invoice.setSubtotal(subtotal);
        invoice.setItemsSubtotal(subtotal);
        invoice.setServiceTotal(0.0);
        invoice.setTotal(total);
        invoice.setBalance(balance);

        if (invoice.getPaidAmount() >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
            savedInvoice.setLastPaymentDate(LocalDateTime.now());
            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
                savedInvoice.setFullyPaidDate(LocalDateTime.now());

            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
                    savedInvoice.getPaymentMethod(), "Initial payment");
            if (savedInvoice.getPayments() == null) savedInvoice.setPayments(new ArrayList<>());
            savedInvoice.getPayments().add(payment);
            savedInvoice = invoiceRepository.save(savedInvoice);
        }

        // ── CHANGE 5: Deduct non-serialized quantities immediately for direct invoice ──
        // Use invoiceItems (pre-save list) to guarantee inventoryItem is fully populated.
        // Serialized items are handled by processStockForPaidInvoice (SOLD marking on payment)
        for (InvoiceItem item : invoiceItems) {
            if ("SERVICE".equals(item.getItemType()) || "CANCELLATION_FEE".equals(item.getItemType())) continue;
            if (item.getInventoryItem() == null) continue;
            deductNonSerializedForDirectInvoice(item, savedInvoice);
        }

        // Serialized SOLD marking — only when PAID
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
            processStockForPaidInvoice(savedInvoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Direct invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Customer: " + savedInvoice.getCustomerName() +
                        (isRegular ? " (Regular - Special Prices Applied)" : "") +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                createInvoicePayload(savedInvoice), NotificationSeverity.SUCCESS);

        return savedInvoice;
    }

    // ========== CHANGE 6: createInvoiceFromJobCard — NO non-serialized deduction ==========

    @Transactional
    public Invoice createInvoiceFromJobCard(Long jobCardId, CreateInvoiceRequest request) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        boolean isRegular = Boolean.TRUE.equals(request.getIsRegularCustomer())
                || Boolean.TRUE.equals(jobCard.getIsRegularCustomer());

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setJobCard(jobCard);
        invoice.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : jobCard.getCustomerName());
        invoice.setCustomerPhone(jobCard.getCustomerPhone());
        invoice.setCustomerEmail(jobCard.getCustomerEmail());
        invoice.setCustomerId(request.getCustomerId() != null ? request.getCustomerId()
                : (jobCard.getCustomer() != null ? (long) jobCard.getCustomer().getCustomerId() : null));
        invoice.setIsRegularCustomer(isRegular);
        invoice.setPaymentMethod(PaymentMethod.valueOf(
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);

        List<InvoiceItem> invoiceItems = new ArrayList<>();

        // Services
        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
            for (ServiceCategory service : jobCard.getServiceCategories()) {
                InvoiceItem serviceItem = new InvoiceItem();
                serviceItem.setInvoice(invoice);
                serviceItem.setItemName(service.getName());
                serviceItem.setQuantity(1);

                double servicePrice;
                if (isRegular && service.getSpecialServicePrice() != null && service.getSpecialServicePrice() > 0) {
                    servicePrice = service.getSpecialServicePrice();
                } else {
                    servicePrice = service.getServicePrice() != null ? service.getServicePrice() : 0.0;
                }
                serviceItem.setUnitPrice(servicePrice);
                serviceItem.setTotal(servicePrice);
                serviceItem.setWarranty("Service");
                serviceItem.setItemType("SERVICE");
                invoiceItems.add(serviceItem);
            }
        }

        // Parts from job card used items
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InvoiceItem partItem = new InvoiceItem();
                partItem.setInvoice(invoice);
                partItem.setItemName(usedItem.getInventoryItem().getName());
                partItem.setItemCode(usedItem.getInventoryItem().getSku());
                partItem.setQuantity(usedItem.getQuantityUsed());

                double unitPrice;
                if (isRegular
                        && usedItem.getInventoryItem().getSpecialPrice() != null
                        && usedItem.getInventoryItem().getSpecialPrice() > 0) {
                    unitPrice = usedItem.getInventoryItem().getSpecialPrice();
                } else {
                    unitPrice = usedItem.getUnitPrice();
                }
                partItem.setUnitPrice(unitPrice);
                partItem.setTotal(usedItem.getQuantityUsed() * unitPrice);
                partItem.setWarranty(usedItem.getWarrantyPeriod());

                if (request.getItems() != null) {
                    for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
                        if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())) {
                            partItem.setWarrantyNumber(reqItem.getWarrantyNumber());
                            break;
                        }
                    }
                }

                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
                    partItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
                } else if (usedItem.getInventoryItem().getHasSerialization()) {
                    if (request.getItems() != null) {
                        for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
                            if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())
                                    && reqItem.getSerialNumbers() != null) {
                                partItem.setSerialNumbers(new ArrayList<>(reqItem.getSerialNumbers()));
                                break;
                            }
                        }
                    }
                    if (partItem.getSerialNumbers() == null) partItem.setSerialNumbers(new ArrayList<>());
                }

                partItem.setItemType("PART");
                invoiceItems.add(partItem);
            }
        }

        invoice.setItems(invoiceItems);

        if (!invoiceItems.isEmpty()) validateInvoiceItems(invoice);

        double itemsSubtotal = invoiceItems.stream()
                .filter(i -> "PART".equals(i.getItemType()))
                .mapToDouble(InvoiceItem::getTotal).sum();
        double serviceTotal = invoiceItems.stream()
                .filter(i -> "SERVICE".equals(i.getItemType()))
                .mapToDouble(InvoiceItem::getTotal).sum();
        double subtotal = itemsSubtotal + serviceTotal;
        double total = subtotal - invoice.getDiscount() + invoice.getTax();
        double balance = total - invoice.getPaidAmount();

        invoice.setItemsSubtotal(itemsSubtotal);
        invoice.setServiceTotal(serviceTotal);
        invoice.setSubtotal(subtotal);
        invoice.setTotal(total);
        invoice.setBalance(balance);

        if (invoice.getPaidAmount() >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
            savedInvoice.setLastPaymentDate(LocalDateTime.now());
            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID)
                savedInvoice.setFullyPaidDate(LocalDateTime.now());

            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
                    savedInvoice.getPaymentMethod(), "Initial payment");
            if (savedInvoice.getPayments() == null) savedInvoice.setPayments(new ArrayList<>());
            savedInvoice.getPayments().add(payment);
            savedInvoice = invoiceRepository.save(savedInvoice);
        }

        // ── CHANGE 6: NO non-serialized deduction here — already deducted at job card creation ──
        // Only process serialized SOLD marking when PAID
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created from job card: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        (isRegular ? " (Regular Customer - Special Prices Applied)" : "") +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                createInvoicePayload(savedInvoice), NotificationSeverity.SUCCESS);

        return savedInvoice;
    }

    private Payment createPaymentRecord(Invoice invoice, Double amount, PaymentMethod method, String notes) {
        if (invoice.getId() == null) throw new RuntimeException("Cannot create payment for unsaved invoice");
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setNotes(notes);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setReceivedBy(getCurrentUserId());
        return paymentRepository.save(payment);
    }

    private Long getCurrentUserId() {
        return 1L;
    }

    @Transactional
    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID)
            throw new RuntimeException("Invoice is already fully paid");
        if (amount <= 0) throw new RuntimeException("Payment amount must be greater than 0");
        if (amount > invoice.getBalance()) throw new RuntimeException("Payment amount cannot exceed balance due");

        PaymentStatus oldStatus = invoice.getPaymentStatus();
        LocalDateTime paymentTime = LocalDateTime.now();

        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
        invoice.setPaymentMethod(method);

        if (invoice.getFirstPaymentDate() == null) invoice.setFirstPaymentDate(paymentTime);
        invoice.setLastPaymentDate(paymentTime);
        if (invoice.getPaidAmount() >= invoice.getTotal()) invoice.setFullyPaidDate(paymentTime);

        updatePaymentStatus(invoice);

        Payment payment = createPaymentRecord(invoice, amount, method, "Payment received");
        if (invoice.getPayments() == null) invoice.setPayments(new ArrayList<>());
        invoice.getPayments().add(payment);

        Invoice saved = invoiceRepository.save(invoice);

        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
            processStockForPaidInvoice(saved);
        }

        notificationService.sendNotification(
                NotificationType.PAYMENT_RECEIVED,
                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
                        " | New Balance: Rs." + saved.getBalance() +
                        " | Payment Status: " + saved.getPaymentStatus(),
                createInvoicePayload(saved),
                NotificationSeverity.SUCCESS
        );

        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    public List<Payment> getPaymentHistory(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
    }

    public Double getVerifiedPaidAmount(Long invoiceId) {
        Double verifiedAmount = paymentRepository.getTotalPaidAmountByInvoiceId(invoiceId);
        return verifiedAmount != null ? verifiedAmount : 0.0;
    }

    // ========== CHANGE 7: processStockForPaidInvoice — serialized SOLD only, no non-serialized ==========

    @Transactional
    protected void processStockForPaidInvoice(Invoice invoice) {
        if (isInvoiceBeingProcessed(invoice.getId())) return;
        markInvoiceAsProcessing(invoice.getId());

        try {
            if (invoice.getItems() == null || invoice.getItems().isEmpty()) return;

            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() == null) continue;
                if ("SERVICE".equals(item.getItemType()) || "CANCELLATION_FEE".equals(item.getItemType())) continue;

                try {
                    InventoryItem invItem = inventoryItemRepository
                            .findById(item.getInventoryItem().getId())
                            .orElse(null);
                    if (invItem == null) continue;

                    if (invItem.getHasSerialization()) {
                        // ── Serialized: mark as SOLD (unchanged) ──
                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                            markSerialsAsSoldForInvoice(item, invoice);
                        }
                    }
                    // ── CHANGE 7: Non-serialized: NO deduction here ──
                    // For direct invoices: already deducted at createDirectInvoice
                    // For job card invoices: already deducted at createJobCard

                } catch (Exception e) {
                    System.err.println("Error processing item: " + item.getItemName() + " - " + e.getMessage());
                }
            }
        } finally {
            unmarkInvoiceProcessing(invoice.getId());
        }
    }

    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                if (inventorySerial.getStatus() == SerialStatus.SOLD) continue;

                if (inventorySerial.getStatus() == SerialStatus.AVAILABLE || inventorySerial.getStatus() == SerialStatus.USED) {
                    inventorySerial.setStatus(SerialStatus.SOLD);
                    inventorySerial.setUsedAt(LocalDateTime.now());
                    inventorySerial.setUsedBy(getCurrentUsername());
                    inventorySerial.setUsedInReferenceType("INVOICE");
                    inventorySerial.setUsedInReferenceId(invoice.getId());
                    inventorySerial.setUsedInReferenceNumber(invoice.getInvoiceNumber());
                    inventorySerial.setNotes("Sold via invoice payment - " + invoice.getInvoiceNumber());
                    inventorySerialRepository.save(inventorySerial);

                    updateInventoryQuantityForSerialSale(inventorySerial.getInventoryItem(), 1);
                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
                }
            } catch (Exception e) {
                System.err.println("Error marking serial as SOLD: " + serialNumber + " - " + e.getMessage());
            }
        }
    }

    private void updateInventoryQuantityForSerialSale(InventoryItem item, int quantity) {
        int previousQuantity = item.getQuantity();
        int newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) throw new RuntimeException("Cannot reduce quantity below 0 for item: " + item.getName());
        item.setQuantity(newQuantity);
        inventoryItemRepository.save(item);
    }

    private void recordStockMovementForSerial(InventoryItem item, Invoice invoice, String serialNumber) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.OUT);
            movement.setQuantity(1);
            movement.setReferenceType("INVOICE");
            movement.setReferenceId(invoice.getId());
            movement.setReferenceNumber(invoice.getInvoiceNumber());
            movement.setReason("Serial sold via invoice payment");
            movement.setSerialNumber(serialNumber);
            movement.setPerformedBy(getCurrentUsername());
            movement.setPreviousQuantity(item.getQuantity() + 1);
            movement.setNewQuantity(item.getQuantity());
            movement.setCreatedAt(LocalDateTime.now());
            stockMovementRepository.save(movement);
        } catch (Exception e) {
            System.err.println("Failed to record stock movement for serial: " + e.getMessage());
        }
    }

    private void recordStockMovementForQuantity(InventoryItem item, Invoice invoice, Integer quantity,
                                                Integer previousQuantity, Integer newQuantity) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.OUT);
            movement.setQuantity(quantity);
            movement.setReferenceType("INVOICE");
            movement.setReferenceId(invoice.getId());
            movement.setReferenceNumber(invoice.getInvoiceNumber());
            movement.setReason("Quantity sold via invoice payment");
            movement.setPerformedBy(getCurrentUsername());
            movement.setPreviousQuantity(previousQuantity);
            movement.setNewQuantity(newQuantity);
            movement.setCreatedAt(LocalDateTime.now());
            stockMovementRepository.save(movement);
        } catch (Exception e) {
            System.err.println("Failed to record stock movement: " + e.getMessage());
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
    protected void updateJobCardStatusToDelivered(Long jobCardId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getStatus() == JobStatus.COMPLETED) {
            jobCard.setStatus(JobStatus.DELIVERED);
            jobCardRepository.save(jobCard);

            Map<String, Object> jobPayload = new HashMap<>();
            jobPayload.put("id", jobCard.getId());
            jobPayload.put("jobNumber", jobCard.getJobNumber());
            jobPayload.put("status", jobCard.getStatus());
            jobPayload.put("customerName", jobCard.getCustomerName());

            notificationService.sendNotification(
                    NotificationType.DELIVERED,
                    "Job card " + jobCard.getJobNumber() + " marked as DELIVERED (Invoice fully paid)",
                    jobPayload,
                    NotificationSeverity.INFO
            );
        }
    }

    private void calculateInvoiceTotals(Invoice invoice) {
        Double itemsSubtotal = 0.0;
        if (invoice.getItems() != null) {
            itemsSubtotal = invoice.getItems().stream()
                    .mapToDouble(item -> {
                        if (item.getQuantity() != null && item.getUnitPrice() != null)
                            return item.getQuantity() * item.getUnitPrice();
                        return 0.0;
                    }).sum();
        }

        Double serviceTotal = 0.0;
        if (invoice.getJobCard() != null) {
            JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId()).orElse(null);
            if (jobCard != null && jobCard.getServiceCategories() != null) {
                boolean isRegular = Boolean.TRUE.equals(invoice.getIsRegularCustomer());
                serviceTotal = jobCard.getServiceCategories().stream()
                        .mapToDouble(sc -> {
                            if (isRegular && sc.getSpecialServicePrice() != null && sc.getSpecialServicePrice() > 0) {
                                return sc.getSpecialServicePrice();
                            }
                            return sc.getServicePrice() != null ? sc.getServicePrice() : 0.0;
                        })
                        .sum();
            }
        }

        Double combinedSubtotal = itemsSubtotal + serviceTotal;
        Double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
        Double tax = invoice.getTax() != null ? invoice.getTax() : 0.0;
        Double total = combinedSubtotal - discount + tax;
        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        Double balance = total - paidAmount;

        invoice.setItemsSubtotal(itemsSubtotal);
        invoice.setServiceTotal(serviceTotal);
        invoice.setSubtotal(combinedSubtotal);
        invoice.setTotal(total);
        invoice.setBalance(balance);
    }

    private void updatePaymentStatus(Invoice invoice) {
        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        Double total = invoice.getTotal() != null ? invoice.getTotal() : 0.0;

        if (paidAmount >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setBalance(0.0);
        } else if (paidAmount > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }
    }

    // ========== CHANGE 8: updateInvoice — restore non-serialized for removed items ==========

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updates) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (existing.getPaymentStatus() == PaymentStatus.PAID)
            throw new RuntimeException("Cannot update a fully paid invoice");

        validateInvoiceItems(updates);

        Double oldPaidAmount = existing.getPaidAmount();

        // ── CHANGE 8: Determine removed items for non-serialized restore ──
        // Only apply for DIRECT invoices (no job card), since job card deducted at creation
        boolean isDirectInvoice = existing.getJobCard() == null;

        if (isDirectInvoice && existing.getItems() != null && updates.getItems() != null) {
            // Find items in existing but NOT in updates (removed items)
            for (InvoiceItem existingItem : existing.getItems()) {
                if (existingItem.getInventoryItem() == null) continue;
                if ("SERVICE".equals(existingItem.getItemType())) continue;

                boolean stillPresent = updates.getItems().stream()
                        .anyMatch(ui -> ui.getId() != null && ui.getId().equals(existingItem.getId()));

                if (!stillPresent) {
                    restoreNonSerializedForDirectInvoice(existingItem, existing);
                }
            }
        }

        existing.setCustomerName(updates.getCustomerName());
        existing.setCustomerPhone(updates.getCustomerPhone());
        existing.setCustomerEmail(updates.getCustomerEmail());
        existing.setDiscount(updates.getDiscount());
        existing.setTax(updates.getTax());
        existing.setPaymentMethod(updates.getPaymentMethod());
        existing.setPaidAmount(updates.getPaidAmount());

        // Preserve isRegularCustomer on update
        if (updates.getIsRegularCustomer() != null) {
            existing.setIsRegularCustomer(updates.getIsRegularCustomer());
        }

        if (updates.getItems() != null) {
            existing.getItems().clear();
            for (InvoiceItem item : updates.getItems()) {
                item.setInvoice(existing);
                existing.getItems().add(item);
            }
        }

        calculateInvoiceTotals(existing);
        updatePaymentStatus(existing);

        if (!oldPaidAmount.equals(existing.getPaidAmount())) {
            updatePaymentDates(existing, oldPaidAmount);
        }

        Invoice saved = invoiceRepository.save(existing);

        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    private void updatePaymentDates(Invoice invoice, Double oldPaidAmount) {
        LocalDateTime now = LocalDateTime.now();
        if (invoice.getPaidAmount() > 0 && invoice.getFirstPaymentDate() == null) {
            invoice.setFirstPaymentDate(now);
            invoice.setLastPaymentDate(now);
            if (invoice.getId() != null) {
                createPaymentRecord(invoice, invoice.getPaidAmount(),
                        invoice.getPaymentMethod(), "Initial payment (via update)");
            }
        } else if (invoice.getPaidAmount() > oldPaidAmount) {
            invoice.setLastPaymentDate(now);
            if (invoice.getId() != null) {
                Double additionalAmount = invoice.getPaidAmount() - oldPaidAmount;
                createPaymentRecord(invoice, additionalAmount,
                        invoice.getPaymentMethod(), "Additional payment (via update)");
            }
        }
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setFullyPaidDate(now);
        } else {
            invoice.setFullyPaidDate(null);
        }
    }

    private void autoPopulateItemsFromJobCard(Invoice invoice) {
        if (invoice.getJobCard() == null) return;

        JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId())
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            List<InvoiceItem> invoiceItems = new ArrayList<>();

            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(invoice);
                invoiceItem.setInventoryItem(usedItem.getInventoryItem());
                invoiceItem.setItemName(usedItem.getInventoryItem().getName());
                invoiceItem.setItemCode(usedItem.getInventoryItem().getSku());
                invoiceItem.setQuantity(usedItem.getQuantityUsed());
                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
                        usedItem.getWarrantyPeriod() : "No Warranty");

                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
                } else if (usedItem.getInventoryItem().getHasSerialization()) {
                    invoiceItem.setSerialNumbers(new ArrayList<>());
                }

                invoiceItems.add(invoiceItem);
            }

            invoice.setItems(invoiceItems);
        }
    }

    private void validateInvoiceSerials(Invoice invoice) {
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() != null && item.getInventoryItem().getHasSerialization()) {
                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
                        throw new RuntimeException("Serial numbers required for item: " + item.getItemName());
                    }
                    if (item.getSerialNumbers().size() != item.getQuantity()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + item.getItemName());
                    }
                    for (String serialNumber : item.getSerialNumbers()) {
                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                                .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));
                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
                            throw new RuntimeException("Serial number not available for invoicing: " + serialNumber + ". Status: " + serial.getStatus());
                        }
                    }
                }
            }
        }
    }

    // ========== CHANGE 9: deleteInvoice — restore non-serialized for direct invoices only ==========

    @Transactional
    public void deleteInvoice(Long id, Long deletedBy, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID)
            throw new RuntimeException("Cannot delete a fully paid invoice");

        // ── CHANGE 9: Restore non-serialized quantities for DIRECT invoices only ──
        // Job card invoices: qty was deducted at job card creation — job card handles restore
        boolean isDirectInvoice = invoice.getJobCard() == null;

        if (isDirectInvoice && invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() == null) continue;
                if ("SERVICE".equals(item.getItemType()) || "CANCELLATION_FEE".equals(item.getItemType())) continue;
                restoreNonSerializedForDirectInvoice(item, invoice);
            }
        }

        invoice.setIsDeleted(true);
        invoice.setDeletedBy(deletedBy);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletionReason(reason);

        invoiceRepository.save(invoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_DELETED,
                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
                createInvoicePayload(invoice),
                NotificationSeverity.WARNING
        );
    }

    private Invoice updateExistingInvoice(Long existingInvoiceId, Invoice newInvoiceData) {
        Invoice existing = invoiceRepository.findById(existingInvoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        validateInvoiceItems(newInvoiceData);

        existing.setCustomerName(newInvoiceData.getCustomerName());
        existing.setCustomerPhone(newInvoiceData.getCustomerPhone());
        existing.setCustomerEmail(newInvoiceData.getCustomerEmail());
        existing.setDiscount(newInvoiceData.getDiscount());
        existing.setTax(newInvoiceData.getTax());
        existing.setPaymentMethod(newInvoiceData.getPaymentMethod());

        existing.getItems().clear();
        if (newInvoiceData.getItems() != null) {
            for (InvoiceItem item : newInvoiceData.getItems()) {
                item.setInvoice(existing);
                existing.getItems().add(item);
            }
        }

        calculateInvoiceTotals(existing);
        updatePaymentStatus(existing);
        return invoiceRepository.save(existing);
    }

    private boolean isInvoiceBeingProcessed(Long invoiceId) {
        return processingInvoices.contains(invoiceId);
    }

    private void markInvoiceAsProcessing(Long invoiceId) {
        processingInvoices.add(invoiceId);
    }

    private void unmarkInvoiceProcessing(Long invoiceId) {
        processingInvoices.remove(invoiceId);
    }

    public Invoice getInvoiceByIdWithItems(Long id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .filter(invoice -> invoice.getJobCard() != null)
                .filter(invoice -> invoice.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
                .toList();
    }

    public List<Invoice> searchByCustomerOrInvoice(String term) {
        return invoiceRepository.searchInvoices(term).stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public InvoiceSummary getInvoiceSummary() {
        List<Invoice> allInvoices = getAllInvoices();

        Double totalRevenue = allInvoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0).sum();
        Double totalCollected = allInvoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0).sum();
        Double totalOutstanding = allInvoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0).sum();
        Long paidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID).count();
        Long partialCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PARTIAL).count();
        Long unpaidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID).count();

        return new InvoiceSummary(totalRevenue, totalCollected, totalOutstanding,
                (long) allInvoices.size(), paidCount, partialCount, unpaidCount);
    }

    public record InvoiceSummary(
            Double totalRevenue, Double totalCollected, Double totalOutstanding,
            Long totalInvoices, Long paidCount, Long partialCount, Long unpaidCount
    ) {}
}