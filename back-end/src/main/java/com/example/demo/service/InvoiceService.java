

package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final com.example.demo.service.NotificationService notificationService;
    private final InventoryService inventoryService;
    private final PaymentRepository paymentRepository;

    /**
     * ✅ FIXED: Generate unique invoice number (auto-increment format)
     */
    private String generateInvoiceNumber() {
        Long count = invoiceRepository.count();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String datePart = sdf.format(new Date());
        String sequencePart = String.format("%05d", (count + 1));
        return "INV-" + datePart + "-" + sequencePart;
        // Example: INV-20251202-00001
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        // CHECK: Prevent multiple invoices for the same job card
        if (invoice.getJobCard() != null && invoice.getJobCard().getId() != null) {
            Optional<Invoice> existingInvoice = invoiceRepository.findByJobCardIdAndIsDeletedFalse(invoice.getJobCard().getId());
            if (existingInvoice.isPresent()) {
                // Instead of creating new, update existing invoice
                return updateExistingInvoice(existingInvoice.get().getId(), invoice);
            }
        }

        // ✅ Generate invoice number automatically using the new method
        invoice.setInvoiceNumber(generateInvoiceNumber());

        // Auto-populate used items from job card if not already provided
        if (invoice.getJobCard() != null && (invoice.getItems() == null || invoice.getItems().isEmpty())) {
            autoPopulateItemsFromJobCard(invoice);
        }

        // Calculate totals (INCLUDING SERVICE CATEGORIES)
        calculateInvoiceTotals(invoice);

        // Set payment status based on paid amount
        updatePaymentStatus(invoice);

        // Validate serial numbers before creating invoice
        validateInvoiceSerials(invoice);

        // Set bidirectional relationships for items
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
            }
        }

        // STEP 1: Save the invoice first (without payments) to get an ID
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // STEP 2: Now create payment record if there's an initial payment
        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
            savedInvoice.setLastPaymentDate(LocalDateTime.now());

            // If fully paid, set fully paid date
            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
                savedInvoice.setFullyPaidDate(LocalDateTime.now());
            }

            // Create payment record for initial payment (invoice now has ID)
            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
                    savedInvoice.getPaymentMethod(), "Initial payment");

            // Add payment to invoice's payment list
            if (savedInvoice.getPayments() == null) {
                savedInvoice.setPayments(new ArrayList<>());
            }
            savedInvoice.getPayments().add(payment);

            // Update the invoice with payment info
            savedInvoice = invoiceRepository.save(savedInvoice);
        }

        // Deduct inventory stock when invoice is created (for direct invoices only)
        if (savedInvoice.getItems() != null) {
            for (InvoiceItem item : savedInvoice.getItems()) {
                if (item.getInventoryItem() != null && savedInvoice.getJobCard() == null) {
                    deductInventoryForInvoiceItem(savedInvoice, item);
                }
            }
        }

        // If invoice is created as PAID (full payment upfront), process stock
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
        }

        // Update job card status if invoice is fully paid
        if (savedInvoice.getJobCard() != null && savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                savedInvoice
        );

        return savedInvoice;
    }

    /**
     * ✅ Create Invoice from Job Card (WITH SERVICES) - NEW METHOD
     */
    @Transactional
    public Invoice createInvoiceFromJobCard(Long jobCardId, CreateInvoiceRequest request) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setJobCard(jobCard);
        invoice.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : jobCard.getCustomerName());
        invoice.setCustomerPhone(jobCard.getCustomerPhone());
        invoice.setCustomerEmail(jobCard.getCustomerEmail());
        invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);

        List<InvoiceItem> invoiceItems = new ArrayList<>();

        // Add services from job card as invoice items
        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
            for (ServiceCategory service : jobCard.getServiceCategories()) {
                InvoiceItem serviceItem = new InvoiceItem();
                serviceItem.setInvoice(invoice);
                serviceItem.setItemName(service.getName());
                serviceItem.setQuantity(1);
                serviceItem.setUnitPrice(service.getServicePrice() != null ? service.getServicePrice() : 0.0);
                serviceItem.setTotal(service.getServicePrice() != null ? service.getServicePrice() : 0.0);
                serviceItem.setWarranty("Service");
                serviceItem.setItemType("SERVICE");
                invoiceItems.add(serviceItem);
            }
        }

        // Add parts from used items
        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InvoiceItem partItem = new InvoiceItem();
                partItem.setInvoice(invoice);
                partItem.setItemName(usedItem.getInventoryItem().getName());

                // ✅ NEW: Set item code (SKU)
                partItem.setItemCode(usedItem.getInventoryItem().getSku());

                partItem.setQuantity(usedItem.getQuantityUsed());
                partItem.setUnitPrice(usedItem.getUnitPrice());
                partItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
                partItem.setWarranty(usedItem.getWarrantyPeriod());

                // ✅ NEW: Set warranty number (if provided in request or from usedItem)
                if (request.getItems() != null) {
                    for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
                        if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())) {
                            partItem.setWarrantyNumber(reqItem.getWarrantyNumber());
                            break;
                        }
                    }
                }

                partItem.setItemType("PART");
                invoiceItems.add(partItem);
            }
        }

        invoice.setItems(invoiceItems);

        // Calculate totals
        double subtotal = invoiceItems.stream()
                .mapToDouble(InvoiceItem::getTotal)
                .sum();
        double total = subtotal - invoice.getDiscount() + invoice.getTax();
        double balance = total - invoice.getPaidAmount();

        invoice.setSubtotal(subtotal);
        invoice.setTotal(total);
        invoice.setBalance(balance);

        // Determine payment status
        if (invoice.getPaidAmount() >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        // Save and process the invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Process payments if any
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

        // If fully paid, process stock and update job card
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created from job card: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                savedInvoice
        );

        return savedInvoice;
    }
//    @Transactional
//    public Invoice createInvoiceFromJobCard(Long jobCardId, CreateInvoiceRequest request) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // ✅ Generate invoice number automatically
//        String invoiceNumber = generateInvoiceNumber();
//
//        Invoice invoice = new Invoice();
//        invoice.setInvoiceNumber(invoiceNumber); // ✅ AUTO-GENERATED
//        invoice.setJobCard(jobCard);
//        invoice.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : jobCard.getCustomerName());
//        invoice.setCustomerPhone(jobCard.getCustomerPhone());
//        invoice.setCustomerEmail(jobCard.getCustomerEmail());
//        invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
//        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
//        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
//        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);
//
//        // ✅ Add invoice items (services + parts)
//        List<InvoiceItem> invoiceItems = new ArrayList<>();
//
//        // Add services from job card as invoice items
//        if (jobCard.getServiceCategories() != null && !jobCard.getServiceCategories().isEmpty()) {
//            for (ServiceCategory service : jobCard.getServiceCategories()) {
//                InvoiceItem serviceItem = new InvoiceItem();
//                serviceItem.setInvoice(invoice);
//                serviceItem.setItemName(service.getName());
//                serviceItem.setQuantity(1);
//                serviceItem.setUnitPrice(service.getServicePrice() != null ? service.getServicePrice() : 0.0);
//                serviceItem.setTotal(service.getServicePrice() != null ? service.getServicePrice() : 0.0);
//                serviceItem.setWarranty("Service");
//                serviceItem.setItemType("SERVICE"); // ✅ Mark as SERVICE
//                invoiceItems.add(serviceItem);
//            }
//        }
//
//        // Add parts from used items
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InvoiceItem partItem = new InvoiceItem();
//                partItem.setInvoice(invoice);
//                partItem.setItemName(usedItem.getInventoryItem().getName());
//                partItem.setQuantity(usedItem.getQuantityUsed());
//                partItem.setUnitPrice(usedItem.getUnitPrice());
//                partItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
//                partItem.setWarranty(usedItem.getWarrantyPeriod());
//                partItem.setItemType("PART"); // ✅ Mark as PART
//                invoiceItems.add(partItem);
//            }
//        }
//
//        invoice.setItems(invoiceItems);
//
//        // Calculate totals
//        double subtotal = invoiceItems.stream()
//                .mapToDouble(InvoiceItem::getTotal)
//                .sum();
//        double total = subtotal - invoice.getDiscount() + invoice.getTax();
//        double balance = total - invoice.getPaidAmount();
//
//        invoice.setSubtotal(subtotal);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//
//        // Determine payment status
//        if (invoice.getPaidAmount() >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        // Save and process the invoice
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        // Process payments if any
//        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
//            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
//            savedInvoice.setLastPaymentDate(LocalDateTime.now());
//
//            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//                savedInvoice.setFullyPaidDate(LocalDateTime.now());
//            }
//
//            // Create payment record
//            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
//                    savedInvoice.getPaymentMethod(), "Initial payment");
//
//            if (savedInvoice.getPayments() == null) {
//                savedInvoice.setPayments(new ArrayList<>());
//            }
//            savedInvoice.getPayments().add(payment);
//
//            savedInvoice = invoiceRepository.save(savedInvoice);
//        }
//
//        // If fully paid, process stock and update job card
//        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//            processStockForPaidInvoice(savedInvoice);
//            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Invoice created from job card: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getTotal() +
//                        " | Status: " + savedInvoice.getPaymentStatus(),
//                savedInvoice
//        );
//
//        return savedInvoice;
//    }

    /**
     * ✅ Create Direct Invoice (WITHOUT Job Card) - NEW METHOD
     */
    @Transactional
    public Invoice createDirectInvoice(CreateInvoiceRequest request) {
        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setCustomerName(request.getCustomerName());
        invoice.setCustomerPhone(request.getCustomerPhone());
        invoice.setCustomerEmail(request.getCustomerEmail());
        invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);

        List<InvoiceItem> invoiceItems = new ArrayList<>();
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateInvoiceRequest.ItemRequest itemRequest : request.getItems()) {
                InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));

                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(invoice);
                invoiceItem.setItemName(inventoryItem.getName());

                // ✅ NEW: Set item code (SKU)
                invoiceItem.setItemCode(inventoryItem.getSku());

                invoiceItem.setQuantity(itemRequest.getQuantity());
                invoiceItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : inventoryItem.getSellingPrice());
                invoiceItem.setTotal(invoiceItem.getQuantity() * invoiceItem.getUnitPrice());
                invoiceItem.setWarranty(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");

                // ✅ NEW: Set warranty number from request
                invoiceItem.setWarrantyNumber(itemRequest.getWarrantyNumber());

                invoiceItem.setItemType("PART");
                invoiceItems.add(invoiceItem);
            }
        }

        invoice.setItems(invoiceItems);

        // Calculate totals
        double subtotal = invoiceItems.stream()
                .mapToDouble(InvoiceItem::getTotal)
                .sum();
        double total = subtotal - invoice.getDiscount() + invoice.getTax();
        double balance = total - invoice.getPaidAmount();

        invoice.setSubtotal(subtotal);
        invoice.setTotal(total);
        invoice.setBalance(balance);

        // Determine payment status
        if (invoice.getPaidAmount() >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        // Save the invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Process payments if any
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

        // Deduct inventory for direct invoice
        if (savedInvoice.getItems() != null) {
            for (InvoiceItem item : savedInvoice.getItems()) {
                if (item.getInventoryItem() != null) {
                    deductInventoryForInvoiceItem(savedInvoice, item);
                }
            }
        }

        // If fully paid, process stock
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Direct invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                savedInvoice
        );

        return savedInvoice;
    }
//    @Transactional
//    public Invoice createDirectInvoice(CreateInvoiceRequest request) {
//        // ✅ Generate invoice number automatically
//        String invoiceNumber = generateInvoiceNumber();
//
//        Invoice invoice = new Invoice();
//        invoice.setInvoiceNumber(invoiceNumber); // ✅ AUTO-GENERATED
//        invoice.setCustomerName(request.getCustomerName());
//        invoice.setCustomerPhone(request.getCustomerPhone());
//        invoice.setCustomerEmail(request.getCustomerEmail());
//        invoice.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH"));
//        invoice.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
//        invoice.setTax(request.getTax() != null ? request.getTax() : 0.0);
//        invoice.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : 0.0);
//
//        // Add items from request
//        List<InvoiceItem> invoiceItems = new ArrayList<>();
//        if (request.getItems() != null && !request.getItems().isEmpty()) {
//            for (CreateInvoiceRequest.ItemRequest itemRequest : request.getItems()) {
//                InventoryItem inventoryItem = inventoryItemRepository.findById(itemRequest.getInventoryItemId())
//                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//                InvoiceItem invoiceItem = new InvoiceItem();
//                invoiceItem.setInvoice(invoice);
//                invoiceItem.setItemName(inventoryItem.getName());
//                invoiceItem.setQuantity(itemRequest.getQuantity());
//                invoiceItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : inventoryItem.getSellingPrice());
//                invoiceItem.setTotal(invoiceItem.getQuantity() * invoiceItem.getUnitPrice());
//                invoiceItem.setWarranty(itemRequest.getWarranty() != null ? itemRequest.getWarranty() : "No Warranty");
//                invoiceItem.setItemType("PART"); // ✅ Mark as PART
//                invoiceItems.add(invoiceItem);
//            }
//        }
//
//        invoice.setItems(invoiceItems);
//
//        // Calculate totals
//        double subtotal = invoiceItems.stream()
//                .mapToDouble(InvoiceItem::getTotal)
//                .sum();
//        double total = subtotal - invoice.getDiscount() + invoice.getTax();
//        double balance = total - invoice.getPaidAmount();
//
//        invoice.setSubtotal(subtotal);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//
//        // Determine payment status
//        if (invoice.getPaidAmount() >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        // Save the invoice
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        // Process payments if any
//        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
//            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
//            savedInvoice.setLastPaymentDate(LocalDateTime.now());
//
//            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//                savedInvoice.setFullyPaidDate(LocalDateTime.now());
//            }
//
//            // Create payment record
//            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
//                    savedInvoice.getPaymentMethod(), "Initial payment");
//
//            if (savedInvoice.getPayments() == null) {
//                savedInvoice.setPayments(new ArrayList<>());
//            }
//            savedInvoice.getPayments().add(payment);
//
//            savedInvoice = invoiceRepository.save(savedInvoice);
//        }
//
//        // Deduct inventory for direct invoice
//        if (savedInvoice.getItems() != null) {
//            for (InvoiceItem item : savedInvoice.getItems()) {
//                if (item.getInventoryItem() != null) {
//                    deductInventoryForInvoiceItem(savedInvoice, item);
//                }
//            }
//        }
//
//        // If fully paid, process stock
//        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
//            processStockForPaidInvoice(savedInvoice);
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Direct invoice created: " + savedInvoice.getInvoiceNumber() +
//                        " | Amount: Rs." + savedInvoice.getTotal() +
//                        " | Status: " + savedInvoice.getPaymentStatus(),
//                savedInvoice
//        );
//
//        return savedInvoice;
//    }

    /**
     * Create payment record for tracking individual payments
     */
    private Payment createPaymentRecord(Invoice invoice, Double amount, PaymentMethod method, String notes) {
        // Ensure invoice has been persisted and has an ID
        if (invoice.getId() == null) {
            throw new RuntimeException("Cannot create payment for unsaved invoice");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice); // This invoice should already be persisted
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setNotes(notes);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setReceivedBy(getCurrentUserId());

        return paymentRepository.save(payment);
    }

    /**
     * Get current user ID for audit purposes
     */
    private Long getCurrentUserId() {
        try {
            // Implement based on your authentication system
            // This is a placeholder - replace with actual user ID retrieval
            return 1L;
        } catch (Exception e) {
            return 1L; // Default system user
        }
    }

    @Transactional
    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Invoice is already fully paid");
        }

        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }

        if (amount > invoice.getBalance()) {
            throw new RuntimeException("Payment amount cannot exceed balance due");
        }

        // Store old payment status to check if we're transitioning to PAID
        PaymentStatus oldStatus = invoice.getPaymentStatus();
        LocalDateTime paymentTime = LocalDateTime.now();

        // Update paid amount
        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
        invoice.setPaymentMethod(method);

        // UPDATE PAYMENT DATES
        if (invoice.getFirstPaymentDate() == null) {
            // This is the first payment
            invoice.setFirstPaymentDate(paymentTime);
        }
        // Always update last payment date
        invoice.setLastPaymentDate(paymentTime);

        // If becoming fully paid, set fully paid date
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setFullyPaidDate(paymentTime);
        }

        // Update payment status
        updatePaymentStatus(invoice);

        // CREATE PAYMENT RECORD
        Payment payment = createPaymentRecord(invoice, amount, method, "Payment received");

        // Add to invoice's payment list
        if (invoice.getPayments() == null) {
            invoice.setPayments(new ArrayList<>());
        }
        invoice.getPayments().add(payment);

        Invoice saved = invoiceRepository.save(invoice);

        // Process stock when invoice becomes fully paid
        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
            processStockForPaidInvoice(saved);
        }

        notificationService.sendNotification(
                NotificationType.PAYMENT_RECEIVED,
                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
                        " | New Balance: Rs." + saved.getBalance() +
                        " | Payment Date: " + paymentTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                saved
        );

        // Update job card status to DELIVERED if invoice is now fully paid
        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    /**
     * Get payment history for an invoice
     */
    public List<Payment> getPaymentHistory(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
    }

    /**
     * Get total paid amount from payment records (for verification)
     */
    public Double getVerifiedPaidAmount(Long invoiceId) {
        Double verifiedAmount = paymentRepository.getTotalPaidAmountByInvoiceId(invoiceId);
        return verifiedAmount != null ? verifiedAmount : 0.0;
    }

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updates) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (existing.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Cannot update a fully paid invoice");
        }

        // Store old paid amount to check if we need to update payment dates
        Double oldPaidAmount = existing.getPaidAmount();

        // Update basic fields
        existing.setCustomerName(updates.getCustomerName());
        existing.setCustomerPhone(updates.getCustomerPhone());
        existing.setCustomerEmail(updates.getCustomerEmail());
        existing.setDiscount(updates.getDiscount());
        existing.setTax(updates.getTax());
        existing.setPaymentMethod(updates.getPaymentMethod());
        existing.setPaidAmount(updates.getPaidAmount());

        // Update items
        if (updates.getItems() != null) {
            existing.getItems().clear();
            for (InvoiceItem item : updates.getItems()) {
                item.setInvoice(existing);
                existing.getItems().add(item);
            }
        }

        // Recalculate totals and payment status
        calculateInvoiceTotals(existing);
        updatePaymentStatus(existing);

        // Update payment dates if paid amount changed
        if (!oldPaidAmount.equals(existing.getPaidAmount())) {
            updatePaymentDates(existing, oldPaidAmount);
        }

        Invoice saved = invoiceRepository.save(existing);

        // Update job card status if invoice is now fully paid
        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    /**
     * Update payment dates when paid amount changes
     */
    private void updatePaymentDates(Invoice invoice, Double oldPaidAmount) {
        LocalDateTime now = LocalDateTime.now();

        if (invoice.getPaidAmount() > 0 && invoice.getFirstPaymentDate() == null) {
            // First payment
            invoice.setFirstPaymentDate(now);
            invoice.setLastPaymentDate(now);

            // Create payment record for the initial payment
            if (invoice.getId() != null) {
                createPaymentRecord(invoice, invoice.getPaidAmount(),
                        invoice.getPaymentMethod(), "Initial payment (via update)");
            }
        } else if (invoice.getPaidAmount() > oldPaidAmount) {
            // Additional payment
            invoice.setLastPaymentDate(now);

            // Create payment record for additional payment
            if (invoice.getId() != null) {
                Double additionalAmount = invoice.getPaidAmount() - oldPaidAmount;
                createPaymentRecord(invoice, additionalAmount,
                        invoice.getPaymentMethod(), "Additional payment (via update)");
            }
        }

        // Check if fully paid
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setFullyPaidDate(now);
        } else {
            invoice.setFullyPaidDate(null);
        }
    }

    /**
     * Auto-populate invoice items from job card used items with serial numbers
     */
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
//                invoiceItem.setQuantity(usedItem.getQuantityUsed());
//                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
//                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
//                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
//                        usedItem.getWarrantyPeriod() : "No Warranty");
//
//                // Transfer serial numbers from used item to invoice item
//                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
//                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
//                } else {
//                    invoiceItem.setSerialNumbers(new ArrayList<>());
//                }
//
//                invoiceItems.add(invoiceItem);
//            }
//
//            invoice.setItems(invoiceItems);
//        }
//    }
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

                // ✅ NEW: Set item code (SKU)
                invoiceItem.setItemCode(usedItem.getInventoryItem().getSku());

                invoiceItem.setQuantity(usedItem.getQuantityUsed());
                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
                        usedItem.getWarrantyPeriod() : "No Warranty");
                // Note: warrantyNumber will be set by user via frontend

                // Transfer serial numbers from used item to invoice item
                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
                } else {
                    invoiceItem.setSerialNumbers(new ArrayList<>());
                }

                invoiceItems.add(invoiceItem);
            }

            invoice.setItems(invoiceItems);
        }
    }

    /**
     * Validate that serial numbers are available for invoice items
     */
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

                    // Validate each serial is available OR USED in the same job card
                    for (String serialNumber : item.getSerialNumbers()) {
                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                                .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                        // FIXED: Allow USED serials from job cards to be invoiced
                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
                            throw new RuntimeException("Serial number not available for invoicing: " + serialNumber + ". Status: " + serial.getStatus());
                        }
                    }
                }
            }
        }
    }

    /**
     * Process stock for paid invoice (mark serials as SOLD and update quantities)
     */
    private void processStockForPaidInvoice(Invoice invoice) {
        System.out.println("🔄 Processing stock for paid invoice: " + invoice.getInvoiceNumber());

        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() != null) {
                    if (item.getInventoryItem().getHasSerialization()) {
                        // For serialized items, mark serials as SOLD (this will deduct quantity)
                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                            markSerialsAsSoldForInvoice(item, invoice);
                        }
                    } else {
                        // For non-serialized items, update quantity directly
                        updateInventoryQuantityForInvoiceItem(item, invoice);
                    }
                }
            }
        }

        System.out.println("✅ Finished processing stock for invoice: " + invoice.getInvoiceNumber());
    }

    /**
     * Mark serial numbers as SOLD for invoice - FIXED: ONLY DEDUCT QUANTITY HERE
     */
    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
        System.out.println("🎯 Marking " + item.getSerialNumbers().size() + " serials as SOLD for item: " + item.getItemName());

        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                // FIXED: Allow marking USED serials as SOLD (from job cards)
                if (inventorySerial.getStatus() == SerialStatus.AVAILABLE || inventorySerial.getStatus() == SerialStatus.USED) {
                    inventorySerial.setStatus(SerialStatus.SOLD);
                    inventorySerial.setUsedAt(LocalDateTime.now());
                    inventorySerial.setUsedBy(getCurrentUsername());
                    inventorySerial.setUsedInReferenceType("INVOICE");
                    inventorySerial.setUsedInReferenceId(invoice.getId());
                    inventorySerial.setUsedInReferenceNumber(invoice.getInvoiceNumber());
                    inventorySerial.setNotes("Sold via invoice payment - " + invoice.getInvoiceNumber());
                    inventorySerialRepository.save(inventorySerial);

                    // FIXED: DEDUCT QUANTITY ONLY WHEN MARKED AS SOLD (not when USED)
                    updateInventoryQuantityForSerialSale(inventorySerial.getInventoryItem(), 1);

                    System.out.println("✅ Serial marked as SOLD: " + serialNumber + " for invoice: " + invoice.getInvoiceNumber() + " | Quantity deducted: 1");

                    // Record stock movement for serial with actual quantity deduction
                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
                } else if (inventorySerial.getStatus() == SerialStatus.SOLD) {
                    System.out.println("ℹ️ Serial already SOLD: " + serialNumber);
                } else {
                    System.err.println("❌ Cannot mark serial as SOLD. Invalid status: " + serialNumber + " - Status: " + inventorySerial.getStatus());
                }
            } catch (Exception e) {
                // Log error but don't fail the entire payment process
                System.err.println("❌ Failed to mark serial as SOLD: " + serialNumber + " - " + e.getMessage());
            }
        }
    }

    /**
     * Update inventory quantity when serial is sold from invoice
     */
    private void updateInventoryQuantityForSerialSale(InventoryItem item, int quantity) {
        try {
            int previousQuantity = item.getQuantity();
            int newQuantity = previousQuantity - quantity;

            if (newQuantity < 0) {
                throw new RuntimeException("Cannot reduce quantity below 0 for item: " + item.getName());
            }

            item.setQuantity(newQuantity);
            inventoryItemRepository.save(item);

            System.out.println("📦 Updated quantity for " + item.getName() +
                    ": " + previousQuantity + " → " + newQuantity + " (serial sold)");

        } catch (Exception e) {
            System.err.println("❌ Failed to update inventory quantity for serial sale: " + e.getMessage());
            throw new RuntimeException("Failed to update inventory quantity", e);
        }
    }

    /**
     * Update inventory quantity for invoice items - FIXED VERSION
     */
    private void updateInventoryQuantityForInvoiceItem(InvoiceItem item, Invoice invoice) {
        try {
            InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));

            // FIXED: Only update quantity for non-serialized items
            // For serialized items, quantity is updated when each serial is marked as SOLD
            if (!invItem.getHasSerialization()) {
                int quantityToDeduct = item.getQuantity();
                int previousQuantity = invItem.getQuantity();
                int newQuantity = previousQuantity - quantityToDeduct;

                if (newQuantity < 0) {
                    throw new RuntimeException("Not enough stock for item: " + invItem.getName());
                }

                invItem.setQuantity(newQuantity);
                inventoryItemRepository.save(invItem);

                System.out.println("📦 Updated quantity for " + invItem.getName() + ": " + previousQuantity + " → " + newQuantity);

                // Record stock movement for quantity update
                recordStockMovementForQuantity(invItem, invoice, quantityToDeduct, previousQuantity, newQuantity);
            } else {
                System.out.println("ℹ️ Skipping bulk quantity update for serialized item: " + invItem.getName() +
                        " (quantity will be updated per serial)");
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to update inventory quantity for item: " + item.getItemName() + " - " + e.getMessage());
        }
    }

    // In InvoiceService.java - Update the recordStockMovementForSerial method:

    /**
     * Record stock movement for serial - ONLY FOR INVOICE
     */
    private void recordStockMovementForSerial(InventoryItem item, Invoice invoice, String serialNumber) {
        try {
            // FIXED: Only record stock movements for INVOICE
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

            // Show correct quantity changes
            int previousQuantity = item.getQuantity() + 1; // Before deduction
            int newQuantity = item.getQuantity(); // After deduction
            movement.setPreviousQuantity(previousQuantity);
            movement.setNewQuantity(newQuantity);

            movement.setCreatedAt(LocalDateTime.now());

            stockMovementRepository.save(movement);

            System.out.println("📝 Recorded stock movement for INVOICE serial: " + serialNumber +
                    " (" + previousQuantity + " → " + newQuantity + ")");
        } catch (Exception e) {
            System.err.println("❌ Failed to record stock movement for serial: " + e.getMessage());
        }
    }

    /**
     * Record stock movement for quantity update
     */
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

            System.out.println("📝 Recorded stock movement for quantity: " + quantity + " units");
        } catch (Exception e) {
            System.err.println("❌ Failed to record stock movement: " + e.getMessage());
        }
    }

    /**
     * Get current username for audit purposes
     */
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    /**
     * Update job card status to DELIVERED when invoice is fully paid
     */
    @Transactional
    protected void updateJobCardStatusToDelivered(Long jobCardId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Only update if status is COMPLETED
        if (jobCard.getStatus() == JobStatus.COMPLETED) {
            jobCard.setStatus(JobStatus.DELIVERED);
            jobCardRepository.save(jobCard);

            System.out.println("🚚 Job card " + jobCard.getJobNumber() + " marked as DELIVERED");

            notificationService.sendNotification(
                    NotificationType.DELIVERED,
                    "Job card " + jobCard.getJobNumber() + " marked as DELIVERED (Invoice fully paid)",
                    jobCard
            );
        }
    }

    /**
     * Deduct inventory stock for invoice items (for direct invoices only)
     */
    private void deductInventoryForInvoiceItem(Invoice invoice, InvoiceItem item) {
        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        // Only deduct for direct invoices (job card invoices are handled when paid)
        if (invoice.getJobCard() == null) {
            List<String> serialNumbers = item.getSerialNumbers();

            inventoryService.deductStockForInvoice(
                    invItem.getId(),
                    item.getQuantity(),
                    serialNumbers,
                    invoice.getId(),
                    invoice.getInvoiceNumber(),
                    "Sold via invoice: " + invoice.getInvoiceNumber()
            );
        }
    }

    /**
     * CALCULATE TOTALS INCLUDING SERVICE CATEGORIES - FIXED VERSION
     */
    private void calculateInvoiceTotals(Invoice invoice) {
        // Calculate items subtotal
        Double itemsSubtotal = 0.0;
        if (invoice.getItems() != null) {
            itemsSubtotal = invoice.getItems().stream()
                    .mapToDouble(item -> {
                        if (item.getQuantity() != null && item.getUnitPrice() != null) {
                            return item.getQuantity() * item.getUnitPrice();
                        }
                        return 0.0;
                    })
                    .sum();
        }

        // FIX: Calculate service total from job card service categories
        Double serviceTotal = 0.0;
        if (invoice.getJobCard() != null) {
            // Load the job card with service categories to ensure they're available
            JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId())
                    .orElse(null);

            if (jobCard != null && jobCard.getServiceCategories() != null) {
                serviceTotal = jobCard.getServiceCategories().stream()
                        .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
                        .sum();
            }

            // Alternative: Use the totalServicePrice directly from job card
            // serviceTotal = jobCard.getTotalServicePrice() != null ? jobCard.getTotalServicePrice() : 0.0;
        }

        // Calculate combined subtotal (ITEMS + SERVICES)
        Double combinedSubtotal = itemsSubtotal + serviceTotal;
        Double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
        Double tax = invoice.getTax() != null ? invoice.getTax() : 0.0;

        // FIX: Total should be calculated from combinedSubtotal (items + services)
        Double total = combinedSubtotal - discount + tax;
        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        Double balance = total - paidAmount;

        // SET ALL THE TOTALS
        invoice.setItemsSubtotal(itemsSubtotal);
        invoice.setServiceTotal(serviceTotal); // This should now be 5000.0
        invoice.setSubtotal(combinedSubtotal); // This is now items + services
        invoice.setTotal(total); // This now includes services
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

    @Transactional
    public void deleteInvoice(Long id, Long deletedBy, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Cannot delete a fully paid invoice");
        }

        invoice.setIsDeleted(true);
        invoice.setDeletedBy(deletedBy);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletionReason(reason);

        invoiceRepository.save(invoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_DELETED,
                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
                invoice
        );
    }

    /**
     * Update existing invoice instead of creating new one
     */
    private Invoice updateExistingInvoice(Long existingInvoiceId, Invoice newInvoiceData) {
        Invoice existing = invoiceRepository.findById(existingInvoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Update basic fields
        existing.setCustomerName(newInvoiceData.getCustomerName());
        existing.setCustomerPhone(newInvoiceData.getCustomerPhone());
        existing.setCustomerEmail(newInvoiceData.getCustomerEmail());
        existing.setDiscount(newInvoiceData.getDiscount());
        existing.setTax(newInvoiceData.getTax());
        existing.setPaymentMethod(newInvoiceData.getPaymentMethod());

        // Update items - clear and add new
        existing.getItems().clear();
        if (newInvoiceData.getItems() != null) {
            for (InvoiceItem item : newInvoiceData.getItems()) {
                item.setInvoice(existing);
                existing.getItems().add(item);
            }
        }

        // Recalculate totals
        calculateInvoiceTotals(existing);
        updatePaymentStatus(existing);

        return invoiceRepository.save(existing);
    }

    /**
     * Get invoice by ID with items loaded
     */
    public Invoice getInvoiceByIdWithItems(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
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
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        Double totalCollected = allInvoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double totalOutstanding = allInvoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        Long paidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .count();

        Long partialCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PARTIAL)
                .count();

        Long unpaidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID)
                .count();

        return new InvoiceSummary(
                totalRevenue,
                totalCollected,
                totalOutstanding,
                (long) allInvoices.size(),
                paidCount,
                partialCount,
                unpaidCount
        );
    }

    // DTO for summary
    public record InvoiceSummary(
            Double totalRevenue,
            Double totalCollected,
            Double totalOutstanding,
            Long totalInvoices,
            Long paidCount,
            Long partialCount,
            Long unpaidCount
    ) {}
}

// You'll also need to add the CreateInvoiceRequest class if it doesn't exist:
class CreateInvoiceRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String paymentMethod;
    private Double discount;
    private Double tax;
    private Double paidAmount;
    private List<ItemRequest> items;

    // Getters and Setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

//    // Nested class for items
//    public static class ItemRequest {
//        private Long inventoryItemId;
//        private Integer quantity;
//        private Double unitPrice;
//        private String warranty;
//
//
//        // Getters and Setters
//        public Long getInventoryItemId() { return inventoryItemId; }
//        public void setInventoryItemId(Long inventoryItemId) { this.inventoryItemId = inventoryItemId; }
//
//        public Integer getQuantity() { return quantity; }
//        public void setQuantity(Integer quantity) { this.quantity = quantity; }
//
//        public Double getUnitPrice() { return unitPrice; }
//        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
//
//        public String getWarranty() { return warranty; }
//        public void setWarranty(String warranty) { this.warranty = warranty; }
//    }
public static class ItemRequest {
    private Long inventoryItemId;
    private Integer quantity;
    private Double unitPrice;
    private String warranty;
    private String warrantyNumber; // ✅ NEW: Manual warranty number (4-5 digits)

    // Getters and Setters
    public Long getInventoryItemId() { return inventoryItemId; }
    public void setInventoryItemId(Long inventoryItemId) { this.inventoryItemId = inventoryItemId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public String getWarrantyNumber() { return warrantyNumber; }
    public void setWarrantyNumber(String warrantyNumber) { this.warrantyNumber = warrantyNumber; }
    }

}