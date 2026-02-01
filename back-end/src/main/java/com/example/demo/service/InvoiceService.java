
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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

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

    // ✅ FIX: Prevent double processing of invoices
    private static final Set<Long> processingInvoices = ConcurrentHashMap.newKeySet();

    /**
     * ✅ UPDATED: Return Invoice (Admin Only)
     * - Creates expense record using existing expense system
     * - Reverses stock (returns items to inventory)
     * - Marks serials as AVAILABLE
     * - Updates invoice status
     */
    @Transactional
    public Invoice returnInvoice(Long invoiceId, Long userId, String reason) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Validate invoice can be returned
        if (invoice.getIsReturned()) {
            throw new RuntimeException("Invoice has already been returned");
        }

        if (invoice.getIsDeleted()) {
            throw new RuntimeException("Cannot return a deleted invoice");
        }

        if (invoice.getPaymentStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Only fully paid invoices can be returned");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Return reason is required");
        }

        System.out.println("🔄 Starting invoice return process for: " + invoice.getInvoiceNumber());

        // STEP 1: Create expense record for the return amount
        createReturnExpense(invoice, reason, userId);

        // STEP 2: Reverse stock movements (return items to inventory)
        reverseStockForReturnedInvoice(invoice);

        // STEP 3: Update invoice status
        invoice.setIsReturned(true);
        invoice.setReturnedBy(userId);
        invoice.setReturnedAt(LocalDateTime.now());
        invoice.setReturnReason(reason);
        invoice.setReturnedAmount(invoice.getPaidAmount());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // STEP 4: Send notification
        notificationService.sendNotification(
                NotificationType.INVOICE_RETURNED,
                "Invoice returned: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getReturnedAmount() +
                        " | Reason: " + reason,
                savedInvoice,
                NotificationSeverity.WARNING
        );

        System.out.println("✅ Invoice return completed: " + invoice.getInvoiceNumber());

        return savedInvoice;
    }

    /**
     * ✅ FIXED: Create expense record for invoice return
     * Stores invoice ID and number as primitives (not relationship)
     */
    private void createReturnExpense(Invoice invoice, String reason, Long userId) {
        Expense expense = new Expense();

        // Use "Invoice Return" as category
        expense.setCategory("Invoice Return");

        // Create detailed description
        String description = String.format(
                "Invoice Return - %s | Customer: %s | Phone: %s",
                invoice.getInvoiceNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerPhone() != null ? invoice.getCustomerPhone() : "N/A"
        );
        expense.setDescription(description);

        // Set amount as BigDecimal
        expense.setAmount(BigDecimal.valueOf(invoice.getPaidAmount()));

        // Mark as auto-created from invoice return
        expense.setAutoCreated(true);
        expense.setSourceType("INVOICE_RETURN");

        // ⭐ CRITICAL FIX: Store invoice ID and number as primitives (NO relationship)
        expense.setInvoiceId(invoice.getId());
        expense.setInvoiceNumber(invoice.getInvoiceNumber());

        Expense saved = expenseRepository.save(expense);

        System.out.println("✅ [EXPENSE AUTO-CREATED]");
        System.out.println("   Expense ID: #" + saved.getId());
        System.out.println("   Category: Invoice Return");
        System.out.println("   Invoice ID: " + saved.getInvoiceId());
        System.out.println("   Invoice Number: " + saved.getInvoiceNumber());
        System.out.println("   Customer: " + invoice.getCustomerName());
        System.out.println("   Amount: Rs." + invoice.getPaidAmount());
        System.out.println("   Reason: " + reason);
        System.out.println("   Created At: " + saved.getCreatedAt());
    }


    /**
     * ✅ Reverse stock for returned invoice
     */
    @Transactional
    protected void reverseStockForReturnedInvoice(Invoice invoice) {
        System.out.println("📦 Reversing stock for returned invoice: " + invoice.getInvoiceNumber());

        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            System.out.println("⚠️ No items to reverse for invoice: " + invoice.getInvoiceNumber());
            return;
        }

        for (InvoiceItem item : invoice.getItems()) {
            // Skip service items
            if ("SERVICE".equals(item.getItemType())) {
                System.out.println("ℹ️ Skipping service item: " + item.getItemName());
                continue;
            }

            if (item.getInventoryItem() == null) {
                System.out.println("⚠️ Skipping item without inventory reference");
                continue;
            }

            try {
                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found"));

                if (inventoryItem.getHasSerialization()) {
                    // Return serialized items
                    returnSerializedItems(item, invoice, inventoryItem);
                } else {
                    // Return non-serialized items (increase quantity)
                    returnNonSerializedItems(item, invoice, inventoryItem);
                }
            } catch (Exception e) {
                System.err.println("❌ Error reversing item: " + item.getItemName() + " - " + e.getMessage());
                throw new RuntimeException("Failed to reverse stock for item: " + item.getItemName(), e);
            }
        }

        System.out.println("✅ Stock reversal completed for invoice: " + invoice.getInvoiceNumber());
    }

    /**
     * ✅ Return serialized items (mark as AVAILABLE)
     */
    private void returnSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
        System.out.println("📱 Returning " + item.getSerialNumbers().size() + " serialized items: " + item.getItemName());

        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

                if (serial.getStatus() != SerialStatus.SOLD) {
                    System.out.println("⚠️ Serial not in SOLD status, skipping: " + serialNumber + " (Status: " + serial.getStatus() + ")");
                    continue;
                }

                // Mark serial as AVAILABLE
                serial.setStatus(SerialStatus.AVAILABLE);
                serial.setUsedAt(null);
                serial.setUsedBy(null);
                serial.setUsedInReferenceType(null);
                serial.setUsedInReferenceId(null);
                serial.setUsedInReferenceNumber(null);
                serial.setNotes("Returned from invoice: " + invoice.getInvoiceNumber() + " - " + invoice.getReturnReason());
                inventorySerialRepository.save(serial);

                // Increase inventory quantity
                int previousQuantity = inventoryItem.getQuantity();
                inventoryItem.setQuantity(previousQuantity + 1);
                inventoryItemRepository.save(inventoryItem);

                System.out.println("✅ Serial returned: " + serialNumber + " | Quantity: " + previousQuantity + " → " + (previousQuantity + 1));

                // Record stock movement
                recordReturnStockMovement(inventoryItem, invoice, serialNumber, 1);

            } catch (Exception e) {
                System.err.println("❌ Error returning serial: " + serialNumber + " - " + e.getMessage());
                throw new RuntimeException("Failed to return serial: " + serialNumber, e);
            }
        }
    }

    /**
     * ✅ Return non-serialized items (increase quantity)
     */
    private void returnNonSerializedItems(InvoiceItem item, Invoice invoice, InventoryItem inventoryItem) {
        int quantityToReturn = item.getQuantity();
        int previousQuantity = inventoryItem.getQuantity();
        int newQuantity = previousQuantity + quantityToReturn;

        inventoryItem.setQuantity(newQuantity);
        inventoryItemRepository.save(inventoryItem);

        System.out.println("📦 Returned quantity for " + inventoryItem.getName() + ": " + previousQuantity + " → " + newQuantity);

        recordReturnStockMovement(inventoryItem, invoice, null, quantityToReturn);
    }

    /**
     * ✅ Record stock movement for return
     */
    private void recordReturnStockMovement(InventoryItem item, Invoice invoice, String serialNumber, Integer quantity) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.IN); // IN because we're returning to inventory
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

            System.out.println("📝 Stock movement recorded for return: " + (serialNumber != null ? serialNumber : quantity + " units"));
        } catch (Exception e) {
            System.err.println("❌ Failed to record stock movement: " + e.getMessage());
        }
    }

    /**
     * ✅ FIXED: Generate unique invoice number (auto-increment format)
     */
    private String generateInvoiceNumber() {
        Long count = invoiceRepository.count();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String datePart = sdf.format(new Date());
        String sequencePart = String.format("%05d", (count + 1));
        return "INV-" + datePart + "-" + sequencePart;
    }

    /**
     * ✅ FIXED: Create cancellation invoice - ONLY shows cancellation fee
     * Uses same numbering as regular invoices
     */
    private void createCancellationInvoice(JobCard jobCard, Double fee, String reason) {
        try {
            // ✅ FIXED: Use same invoice numbering system as regular invoices
            String invoiceNumber = generateInvoiceNumber();
            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setJobCard(jobCard); // Keep job card reference for tracking
            invoice.setCustomerName(jobCard.getCustomerName());
            invoice.setCustomerPhone(jobCard.getCustomerPhone());
            invoice.setCustomerEmail(jobCard.getCustomerEmail());
            invoice.setPaymentMethod(PaymentMethod.CASH);

            // ✅ CRITICAL: Create ONLY cancellation fee item (no services, no used items)
            List<InvoiceItem> feeItems = new ArrayList<>();
            InvoiceItem feeItem = new InvoiceItem();
            feeItem.setInvoice(invoice);
            feeItem.setItemName("Cancellation Fee - " + jobCard.getJobNumber());
            feeItem.setItemCode("CANCEL-FEE");
            feeItem.setQuantity(1);
            feeItem.setUnitPrice(fee);
            feeItem.setTotal(fee);
            feeItem.setWarranty("No Warranty");
            feeItem.setItemType("CANCELLATION_FEE"); // Special type for identification
            feeItems.add(feeItem);

            invoice.setItems(feeItems);
            // Set totals
            invoice.setSubtotal(fee);
            invoice.setTotal(fee);
            invoice.setPaidAmount(0.0); // UNPAID
            invoice.setBalance(fee);
            invoice.setPaymentStatus(PaymentStatus.UNPAID); // Set as UNPAID
            invoice.setPaymentMethod(PaymentMethod.CASH);

            // ✅ Mark as cancellation invoice for frontend identification
            invoice.setDiscount(0.0);
            invoice.setTax(0.0);
            invoice.setServiceTotal(0.0);
            invoice.setItemsSubtotal(fee);
            // Save invoice
            invoiceRepository.save(invoice);
            System.out.println("✅ Created cancellation invoice: " + invoiceNumber + " for job: " + jobCard.getJobNumber());
            System.out.println("   Amount: Rs." + fee);
            System.out.println("   Status: UNPAID");
            System.out.println("   Reason: " + reason);
            System.out.println("   Items: ONLY cancellation fee (no services/used items)");
            notificationService.sendNotification(
                    NotificationType.INVOICE_CREATED,
                    "Cancellation invoice created: " + invoiceNumber +
                            " | Amount: Rs." + fee +
                            " | Job: " + jobCard.getJobNumber(),
                    invoice,
                    NotificationSeverity.WARNING
            );
        } catch (Exception e) {
            System.err.println("❌ Failed to create cancellation invoice: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - cancellation should proceed even if invoice creation fails
        }
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

        // ✅ VALIDATE: Check serial numbers for serialized items BEFORE creating invoice
        validateInvoiceItems(invoice);

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

        // ✅ FIX: If invoice is created as PAID (full payment upfront), process stock
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
                        " | Status: " + savedInvoice.getPaymentStatus() +
                        (savedInvoice.getPaymentStatus() == PaymentStatus.PAID ? " | ✅ STOCK DEDUCTED" : ""),
                savedInvoice,
                NotificationSeverity.SUCCESS
        );

        return savedInvoice;
    }

    /**
     * ✅ NEW: Validate invoice items for serialized items
     * This is called BEFORE creating or updating invoices
     */
    private void validateInvoiceItems(Invoice invoice) {
        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            return;
        }

        for (InvoiceItem item : invoice.getItems()) {
            if (item.getInventoryItem() != null && item.getInventoryItem().getId() != null) {
                // Load full inventory item details
                InventoryItem inventoryItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory item not found: " + item.getInventoryItem().getId()));

                // Check if item requires serialization
                if (inventoryItem.getHasSerialization()) {
                    // Validate serial numbers are provided
                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
                        throw new RuntimeException(
                                "Serial number is required for item: " + inventoryItem.getName() +
                                        " (SKU: " + inventoryItem.getSku() + "). " +
                                        "Please add " + item.getQuantity() + " serial number(s)."
                        );
                    }

                    // Validate number of serials matches quantity
                    if (item.getSerialNumbers().size() != item.getQuantity()) {
                        throw new RuntimeException(
                                "Number of serials (" + item.getSerialNumbers().size() + ") " +
                                        "must match quantity (" + item.getQuantity() + ") " +
                                        "for item: " + inventoryItem.getName()
                        );
                    }

                    // Validate each serial is unique
                    long uniqueSerials = item.getSerialNumbers().stream().distinct().count();
                    if (uniqueSerials != item.getSerialNumbers().size()) {
                        throw new RuntimeException(
                                "Duplicate serial numbers found for item: " + inventoryItem.getName()
                        );
                    }

                    // Validate each serial exists in database and is available
                    for (String serialNumber : item.getSerialNumbers()) {
                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                                .orElseThrow(() -> new RuntimeException(
                                        "Serial number not found in inventory: " + serialNumber
                                ));

                        // Allow AVAILABLE or USED serials to be invoiced
                        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
                            throw new RuntimeException(
                                    "Serial number not available for invoicing: " + serialNumber +
                                            ". Status: " + serial.getStatus() +
                                            ". Serial must be AVAILABLE or USED."
                            );
                        }

                        // Verify serial belongs to the correct inventory item
                        if (!serial.getInventoryItem().getId().equals(inventoryItem.getId())) {
                            throw new RuntimeException(
                                    "Serial number " + serialNumber + " does not belong to item: " +
                                            inventoryItem.getName() + " (SKU: " + inventoryItem.getSku() + ")"
                            );
                        }
                    }
                } else {
                    // For non-serialized items, ensure no serial numbers are provided
                    if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                        throw new RuntimeException(
                                "Item " + inventoryItem.getName() + " does not require serial numbers. " +
                                        "Please remove the serial numbers."
                        );
                    }
                }
            }
        }
    }

    /**
     * ✅ Create Direct Invoice (WITHOUT Job Card) - UPDATED to allow empty items
     */
    @Transactional
    public Invoice createDirectInvoice(CreateInvoiceRequest request) {
        // ✅ CHECK: Direct invoice must have at least services OR items
        boolean hasItems = request.getItems() != null && !request.getItems().isEmpty();

        if (!hasItems) {
            throw new RuntimeException("Direct invoice must have at least one item");
        }

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

                // ✅ IMPORTANT: Set serial numbers from request
                if (itemRequest.getSerialNumbers() != null && !itemRequest.getSerialNumbers().isEmpty()) {
                    invoiceItem.setSerialNumbers(new ArrayList<>(itemRequest.getSerialNumbers()));
                } else if (inventoryItem.getHasSerialization()) {
                    // Throw validation error for serialized items without serials
                    throw new RuntimeException(
                            "Serial number is required for item: " + inventoryItem.getName() +
                                    " (SKU: " + inventoryItem.getSku() + "). " +
                                    "Please add " + itemRequest.getQuantity() + " serial number(s)."
                    );
                }

                invoiceItem.setItemType("PART");
                invoiceItems.add(invoiceItem);
            }
        }

        invoice.setItems(invoiceItems);

        // ✅ VALIDATE: Check serial numbers for serialized items
        validateInvoiceItems(invoice);

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

        // ✅ FIX: If fully paid, process stock
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Direct invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus() +
                        (savedInvoice.getPaymentStatus() == PaymentStatus.PAID ? " | ✅ STOCK DEDUCTED" : ""),
                savedInvoice,
                NotificationSeverity.SUCCESS
        );

        return savedInvoice;
    }

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
            invoice.setFirstPaymentDate(paymentTime);
        }
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

        // ✅ FIX: Process stock ONLY when invoice transitions from NOT PAID to PAID
        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
            System.out.println("💰 Invoice fully paid! Processing stock deduction...");
            processStockForPaidInvoice(saved);
        } else {
            System.out.println("ℹ️ Partial payment received. Stock will be deducted when fully paid.");
        }

        notificationService.sendNotification(
                NotificationType.PAYMENT_RECEIVED,
                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
                        " | New Balance: Rs." + saved.getBalance() +
                        " | Payment Status: " + saved.getPaymentStatus() +
                        (saved.getPaymentStatus() == PaymentStatus.PAID ? " | ✅ STOCK DEDUCTED" : ""),
                saved,
                NotificationSeverity.SUCCESS
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

    /**
     * ✅ Create Invoice from Job Card (WITH SERVICES) - UPDATED to allow invoices with only services
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

        // ✅ ADD services from job card as invoice items
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

        // ✅ ADD parts from used items (OPTIONAL)
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

                // ✅ IMPORTANT: Transfer serial numbers from used item
                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
                    partItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
                } else if (usedItem.getInventoryItem().getHasSerialization()) {
                    // If serialized item has no serials in used items, check if provided in request
                    boolean foundSerials = false;
                    if (request.getItems() != null) {
                        for (CreateInvoiceRequest.ItemRequest reqItem : request.getItems()) {
                            if (reqItem.getInventoryItemId().equals(usedItem.getInventoryItem().getId())
                                    && reqItem.getSerialNumbers() != null && !reqItem.getSerialNumbers().isEmpty()) {
                                partItem.setSerialNumbers(new ArrayList<>(reqItem.getSerialNumbers()));
                                foundSerials = true;
                                break;
                            }
                        }
                    }

                    // If still no serials for serialized item, include it but validation will catch later
                    if (!foundSerials && usedItem.getInventoryItem().getHasSerialization()) {
                        // Leave serialNumbers empty - validation will handle it
                        partItem.setSerialNumbers(new ArrayList<>());
                    }
                }

                partItem.setItemType("PART");
                invoiceItems.add(partItem);
            }
        }

        invoice.setItems(invoiceItems);

        // ✅ VALIDATE: Check serial numbers for serialized items (only if there are items)
        if (!invoiceItems.isEmpty()) {
            validateInvoiceItems(invoice);
        }

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

        // ✅ FIX: If fully paid, process stock and update job card
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created from job card: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus() +
                        (savedInvoice.getPaymentStatus() == PaymentStatus.PAID ? " | ✅ STOCK DEDUCTED" : ""),
                savedInvoice,
                NotificationSeverity.SUCCESS
        );

        return savedInvoice;
    }

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updates) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (existing.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Cannot update a fully paid invoice");
        }

        // ✅ VALIDATE: Check serial numbers for serialized items BEFORE updating
        validateInvoiceItems(updates);

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
                } else if (usedItem.getInventoryItem().getHasSerialization()) {
                    // If serialized item has no serials in job card, leave empty
                    // Validation will catch this when user tries to save
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
     * ✅ FIX: Process stock for paid invoice with safety checks
     */
    @Transactional
    protected void processStockForPaidInvoice(Invoice invoice) {
        // ✅ SAFETY CHECK: Prevent double processing
        if (isInvoiceBeingProcessed(invoice.getId())) {
            System.out.println("⚠️ Invoice " + invoice.getInvoiceNumber() + " is already being processed. Skipping.");
            return;
        }

        markInvoiceAsProcessing(invoice.getId());

        try {
            System.out.println("🔄 Processing stock for PAID invoice: " + invoice.getInvoiceNumber());

            if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
                System.out.println("⚠️ No items to process for invoice: " + invoice.getInvoiceNumber());
                return;
            }

            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() == null) {
                    System.out.println("⚠️ Skipping item without inventory reference");
                    continue;
                }

                try {
                    if (item.getInventoryItem().getHasSerialization()) {
                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                            System.out.println("📱 Processing " + item.getSerialNumbers().size() +
                                    " serialized items for: " + item.getItemName());
                            markSerialsAsSoldForInvoice(item, invoice);
                        } else {
                            System.out.println("⚠️ Serialized item has no serial numbers: " + item.getItemName());
                        }
                    } else {
                        System.out.println("📦 Processing " + item.getQuantity() + " non-serialized items for: " +
                                item.getItemName());
                        updateInventoryQuantityForInvoiceItem(item, invoice);
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error processing item: " + item.getItemName() + " - " + e.getMessage());
                    // Don't fail entire payment process for one item
                }
            }

            System.out.println("✅ Finished processing stock for invoice: " + invoice.getInvoiceNumber());
        } finally {
            unmarkInvoiceProcessing(invoice.getId());
        }
    }

    /**
     * ✅ FIX: Mark serial numbers as SOLD for invoice with double processing check
     */
    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
        System.out.println("🎯 Marking " + item.getSerialNumbers().size() + " serials as SOLD for item: " + item.getItemName());

        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                // ✅ CHECK: If already SOLD, skip it
                if (inventorySerial.getStatus() == SerialStatus.SOLD) {
                    System.out.println("ℹ️ Serial already SOLD (skipping re-processing): " + serialNumber);
                    continue;  // Skip, don't process again
                }

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

                    System.out.println("✅ Serial marked as SOLD: " + serialNumber + " for invoice: " + invoice.getInvoiceNumber() + " | Quantity deducted: 1");

                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
                } else {
                    System.err.println("❌ Cannot mark serial as SOLD. Invalid status: " + serialNumber + " - Status: " + inventorySerial.getStatus());
                }
            } catch (Exception e) {
                System.err.println("❌ Error marking serial as SOLD: " + serialNumber + " - " + e.getMessage());
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
     * ✅ FIX: Update inventory quantity for invoice items with stock validation
     */
    private void updateInventoryQuantityForInvoiceItem(InvoiceItem item, Invoice invoice) {
        try {
            InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));

            if (!invItem.getHasSerialization()) {
                int quantityToDeduct = item.getQuantity();
                int previousQuantity = invItem.getQuantity();

                // ✅ CHECK: Only deduct if quantity allows
                if (previousQuantity < quantityToDeduct) {
                    System.err.println("❌ Not enough stock for item: " + invItem.getName() +
                            " (Available: " + previousQuantity + ", Required: " + quantityToDeduct + ")");
                    throw new RuntimeException("Insufficient stock for item: " + invItem.getName());
                }

                int newQuantity = previousQuantity - quantityToDeduct;

                invItem.setQuantity(newQuantity);
                inventoryItemRepository.save(invItem);

                System.out.println("📦 Updated quantity for " + invItem.getName() + ": " + previousQuantity + " → " + newQuantity);

                recordStockMovementForQuantity(invItem, invoice, quantityToDeduct, previousQuantity, newQuantity);
            } else {
                System.out.println("ℹ️ Skipping bulk quantity update for serialized item: " + invItem.getName() +
                        " (quantity will be updated per serial)");
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to update inventory quantity for item: " + item.getItemName() + " - " + e.getMessage());
            throw new RuntimeException("Failed to process item: " + item.getItemName(), e);
        }
    }

    /**
     * Record stock movement for serial - ONLY FOR INVOICE
     */
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
                    jobCard,
                    NotificationSeverity.INFO
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

        // ✅ FIX: If invoice was partially paid, check for stock reversal
        if (invoice.getPaymentStatus() == PaymentStatus.PARTIAL && invoice.getPaidAmount() > 0) {
            System.out.println("🔄 Invoice was partially paid. Checking if stock was deducted...");
            // Partial invoices should NOT have had stock deducted, so no reversal needed
            System.out.println("ℹ️ Partial invoices don't deduct stock, so no reversal needed.");
        }

        invoice.setIsDeleted(true);
        invoice.setDeletedBy(deletedBy);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletionReason(reason);

        invoiceRepository.save(invoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_DELETED,
                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
                invoice,
                NotificationSeverity.WARNING
        );
    }

    /**
     * Update existing invoice instead of creating new one
     */
    private Invoice updateExistingInvoice(Long existingInvoiceId, Invoice newInvoiceData) {
        Invoice existing = invoiceRepository.findById(existingInvoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // ✅ VALIDATE: Check serial numbers for serialized items
        validateInvoiceItems(newInvoiceData);

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
     * ✅ FIX: Methods to prevent double processing of invoices
     */
    private boolean isInvoiceBeingProcessed(Long invoiceId) {
        return processingInvoices.contains(invoiceId);
    }

    private void markInvoiceAsProcessing(Long invoiceId) {
        processingInvoices.add(invoiceId);
    }

    private void unmarkInvoiceProcessing(Long invoiceId) {
        processingInvoices.remove(invoiceId);
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