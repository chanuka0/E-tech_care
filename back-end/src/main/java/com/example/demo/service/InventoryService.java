
package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.InventorySerialRepository;
import com.example.demo.repositories.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationService notificationService;
    private final ExpenseService expenseService;

    // ========== INVENTORY ITEM MANAGEMENT ==========

    @Transactional
    public InventoryItem createItem(InventoryItem item) {
        if (item.getSku() == null) {
            item.setSku(generateSku());
        }

        // Set defaults
        if (item.getHasSerialization() == null) {
            item.setHasSerialization(false);
        }
        if (item.getQuantity() == null) {
            item.setQuantity(0);
        }
        if (item.getMinThreshold() == null) {
            item.setMinThreshold(0);
        }

        InventoryItem saved = inventoryItemRepository.save(item);

        // Record initial stock if quantity > 0
        if (saved.getQuantity() > 0) {
            recordStockMovement(saved, MovementType.IN, saved.getQuantity(),
                    "MANUAL", null, null, "Initial stock", null, 0, saved.getQuantity());

            // ✅ AUTO-CREATE EXPENSE FOR INITIAL STOCK
            System.out.println("📦 Creating item: " + saved.getName() + " | Qty: " + saved.getQuantity());
            if (saved.getPurchasePrice() != null && saved.getPurchasePrice() > 0) {
                Expense createdExpense = expenseService.createExpenseFromInventory(
                        saved.getName(),
                        saved.getSku(),
                        saved.getQuantity(),
                        saved.getPurchasePrice(),
                        "Initial stock"
                );
                if (createdExpense != null) {
                    System.out.println("✅ Expense created for initial stock: #" + createdExpense.getId());
                }
            } else {
                System.out.println("⚠️ No purchase price set - expense not created");
            }
        }

        checkLowStock(saved);
        return saved;
    }

    @Transactional
    public InventoryItem updateItem(Long id, InventoryItem updates) {
        InventoryItem existing = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int oldQuantity = existing.getQuantity();

        // Update fields
        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }
        if (updates.getCategory() != null) {
            existing.setCategory(updates.getCategory());
        }
        if (updates.getQuantity() != null) {
            existing.setQuantity(updates.getQuantity());
        }
        if (updates.getMinThreshold() != null) {
            existing.setMinThreshold(updates.getMinThreshold());
        }
        if (updates.getPurchasePrice() != null) {
            existing.setPurchasePrice(updates.getPurchasePrice());
        }
        if (updates.getSellingPrice() != null) {
            existing.setSellingPrice(updates.getSellingPrice());
        }
        if (updates.getSpecialPrice() != null) {
            existing.setSpecialPrice(updates.getSpecialPrice());
        }
        if (updates.getHasSerialization() != null) {
            existing.setHasSerialization(updates.getHasSerialization());
        }

        InventoryItem saved = inventoryItemRepository.save(existing);

        // Record stock change if quantity changed
        if (oldQuantity != saved.getQuantity()) {
            int diff = saved.getQuantity() - oldQuantity;
            MovementType type = diff > 0 ? MovementType.IN : MovementType.OUT;
            recordStockMovement(saved, type, Math.abs(diff),
                    "MANUAL", null, null, "Stock updated", null, oldQuantity, saved.getQuantity());
        }

        checkLowStock(saved);
        return saved;
    }

    @Transactional
    public void deleteItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Delete associated serials first
        if (item.getSerials() != null && !item.getSerials().isEmpty()) {
            inventorySerialRepository.deleteAll(item.getSerials());
        }

        inventoryItemRepository.delete(item);

        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Item deleted: " + item.getName() + " (SKU: " + item.getSku() + ")",
                item
        );
    }

    // ========== STOCK MANAGEMENT ==========

    @Transactional
    public void addStock(Long itemId, Integer quantity, String reason, String notes) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        int oldQty = item.getQuantity();
        item.setQuantity(oldQty + quantity);
        inventoryItemRepository.save(item);

        recordStockMovement(item, MovementType.IN, quantity, "MANUAL", null, null,
                reason, notes, oldQty, item.getQuantity());

        // ✅ AUTO-CREATE EXPENSE FOR ADDED STOCK
        System.out.println("📦 Adding stock to: " + item.getName() + " | Qty: " + quantity);
        if (item.getPurchasePrice() != null && item.getPurchasePrice() > 0) {
            Expense createdExpense = expenseService.createExpenseFromInventory(
                    item.getName(),
                    item.getSku(),
                    quantity,
                    item.getPurchasePrice(),
                    reason != null ? reason : "Stock addition"
            );
            if (createdExpense != null) {
                System.out.println("✅ Expense created for added stock: #" + createdExpense.getId());
            }
        } else {
            System.out.println("⚠️ No purchase price set - expense not created");
        }

        checkLowStock(item);
    }

    @Transactional
    public void adjustStock(Long itemId, Integer newQuantity, String reason) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int oldQty = item.getQuantity();
        int diff = newQuantity - oldQty;

        item.setQuantity(newQuantity);
        inventoryItemRepository.save(item);

        MovementType movementType = diff > 0 ? MovementType.IN : MovementType.OUT;
        recordStockMovement(item, movementType, Math.abs(diff),
                "ADJUSTMENT", null, null, reason, null, oldQty, newQuantity);

        checkLowStock(item);
    }

    @Transactional
    public void deductStock(Long itemId, Integer quantity, List<String> serialNumbers,
                            String reason, String notes) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int oldQty = item.getQuantity();

        if (item.getHasSerialization()) {
            if (serialNumbers == null || serialNumbers.isEmpty()) {
                throw new RuntimeException("Serial numbers required for serialized item");
            }

            for (String serial : serialNumbers) {
                InventorySerial invSerial = inventorySerialRepository.findBySerialNumber(serial)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));

                if (invSerial.getStatus() != SerialStatus.AVAILABLE) {
                    throw new RuntimeException("Serial not available: " + serial + ". Status: " + invSerial.getStatus());
                }

                // Mark as USED for direct use - BUT DON'T DEDUCT QUANTITY OR RECORD MOVEMENT
                invSerial.setStatus(SerialStatus.USED);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setUsedInReferenceType("DIRECT_USE");
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                System.out.println("ℹ️ Serial marked as USED (no stock movement recorded): " + serial);
            }
        } else {
            // For non-serialized items, deduct quantity immediately
            if (item.getQuantity() < quantity) {
                throw new RuntimeException("Not enough stock for item: " + item.getName());
            }

            item.setQuantity(item.getQuantity() - quantity);

            recordStockMovement(item, MovementType.OUT, quantity, "DIRECT_USE", null, null,
                    reason, notes, oldQty, item.getQuantity());
        }

        inventoryItemRepository.save(item);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Stock deducted for item: " + item.getName() + " | Qty: " + quantity,
                item
        );

        checkLowStock(item);
    }

    @Transactional
    public void deductStockForJobCard(Long itemId, Integer quantity, List<String> serialNumbers,
                                      Long jobCardId, String jobCardNumber, String notes) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (item.getHasSerialization()) {
            if (serialNumbers == null || serialNumbers.isEmpty()) {
                throw new RuntimeException("Serial numbers required for serialized item");
            }

            for (String serial : serialNumbers) {
                InventorySerial invSerial = inventorySerialRepository.findBySerialNumber(serial)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));

                if (invSerial.getStatus() != SerialStatus.AVAILABLE) {
                    throw new RuntimeException("Serial not available: " + serial + ". Status: " + invSerial.getStatus());
                }

                // Mark as USED for job card - NO STOCK MOVEMENT RECORDED
                invSerial.setStatus(SerialStatus.USED);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setUsedInReferenceType("JOB_CARD");
                invSerial.setUsedInReferenceId(jobCardId);
                invSerial.setUsedInReferenceNumber(jobCardNumber);
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                System.out.println("✅ Serial marked as USED for job card (no stock movement): " + serial);
            }
        } else {
            // For non-serialized items, deduct quantity immediately
            if (item.getQuantity() < quantity) {
                throw new RuntimeException("Not enough stock");
            }

            item.setQuantity(item.getQuantity() - quantity);

            // FIXED: Don't record stock movement for JOB_CARD non-serialized items either
            System.out.println("ℹ️ Non-serialized item used in job card (no stock movement): " + item.getName());
        }

        inventoryItemRepository.save(item);
        checkLowStock(item);
    }

    @Transactional
    public void deductStockForInvoice(Long itemId, Integer quantity, List<String> serialNumbers,
                                      Long invoiceId, String invoiceNumber, String notes) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int oldQty = item.getQuantity();

        if (item.getHasSerialization()) {
            if (serialNumbers == null || serialNumbers.isEmpty()) {
                throw new RuntimeException("Serial numbers required for serialized item");
            }

            for (String serial : serialNumbers) {
                InventorySerial invSerial = inventorySerialRepository.findBySerialNumber(serial)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));

                if (invSerial.getStatus() != SerialStatus.AVAILABLE && invSerial.getStatus() != SerialStatus.USED) {
                    throw new RuntimeException("Serial not available: " + serial + ". Status: " + invSerial.getStatus());
                }

                // Mark serial as SOLD with invoice reference - THIS IS WHERE WE DEDUCT QUANTITY
                invSerial.setStatus(SerialStatus.SOLD);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setUsedInReferenceType("INVOICE");
                invSerial.setUsedInReferenceId(invoiceId);
                invSerial.setUsedInReferenceNumber(invoiceNumber);
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                // DEDUCT QUANTITY ONLY WHEN MARKED AS SOLD (not when USED)
                updateQuantityForSerialSale(item, 1);

                // RECORD STOCK MOVEMENT ONLY FOR INVOICE
                recordStockMovementForSerial(serial, MovementType.OUT, 1, "INVOICE", invoiceId, invoiceNumber,
                        "Sold via invoice", serial, oldQty, oldQty - 1);
                oldQty--;
            }
        } else {
            // For non-serialized items, deduct quantity
            if (item.getQuantity() < quantity) {
                throw new RuntimeException("Not enough stock for item: " + item.getName());
            }

            item.setQuantity(item.getQuantity() - quantity);

            // RECORD STOCK MOVEMENT FOR NON-SERIALIZED INVOICE ITEMS
            recordStockMovement(item, MovementType.OUT, quantity, "INVOICE", invoiceId, invoiceNumber,
                    "Sold via invoice", notes, oldQty, item.getQuantity());
        }

        inventoryItemRepository.save(item);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Stock deducted for invoice: " + item.getName() + " | Qty: " + quantity,
                item
        );

        checkLowStock(item);
    }

    private void recordStockMovementForSerial(String serial, MovementType movementType, int i, String invoice, Long invoiceId, String invoiceNumber, String soldViaInvoice, String serial1, int oldQty, int i1) {
    }

    // ========== SERIAL NUMBER MANAGEMENT ==========

    @Transactional
    public InventorySerial addSerial(Long itemId, String serialNumber) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (inventorySerialRepository.existsBySerialNumber(serialNumber)) {
            throw new RuntimeException("Serial number already exists");
        }

        InventorySerial serial = new InventorySerial();
        serial.setInventoryItem(item);
        serial.setSerialNumber(serialNumber);
        serial.setStatus(SerialStatus.AVAILABLE);

        InventorySerial saved = inventorySerialRepository.save(serial);

        // Update quantity and record movement
        int oldQty = item.getQuantity();
        item.setQuantity(oldQty + 1);
        inventoryItemRepository.save(item);

        recordStockMovement(item, MovementType.IN, 1, "MANUAL", null, null,
                "Serial added", serialNumber, oldQty, item.getQuantity());

        // ✅ AUTO-CREATE EXPENSE FOR SERIAL ADDED
        System.out.println("📦 Adding serial: " + serialNumber + " to: " + item.getName());
        if (item.getPurchasePrice() != null && item.getPurchasePrice() > 0) {
            Expense createdExpense = expenseService.createExpenseFromInventory(
                    item.getName(),
                    item.getSku(),
                    1,
                    item.getPurchasePrice(),
                    "Serial added: " + serialNumber
            );
            if (createdExpense != null) {
                System.out.println("✅ Expense created for serial: #" + createdExpense.getId());
            }
        } else {
            System.out.println("⚠️ No purchase price set - expense not created");
        }

        return saved;
    }

    @Transactional
    public void addBulkSerials(Long itemId, List<String> serialNumbers) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int addedCount = 0;
        StringBuilder notes = new StringBuilder("Bulk serials added: ");

        for (String serialNumber : serialNumbers) {
            if (!inventorySerialRepository.existsBySerialNumber(serialNumber.trim())) {
                InventorySerial serial = new InventorySerial();
                serial.setInventoryItem(item);
                serial.setSerialNumber(serialNumber.trim());
                serial.setStatus(SerialStatus.AVAILABLE);
                inventorySerialRepository.save(serial);
                addedCount++;
                notes.append(serialNumber).append(", ");
            }
        }

        if (addedCount > 0) {
            int oldQty = item.getQuantity();
            item.setQuantity(oldQty + addedCount);
            inventoryItemRepository.save(item);

            recordStockMovement(item, MovementType.IN, addedCount, "MANUAL", null, null,
                    notes.toString(), null, oldQty, item.getQuantity());

            // ✅ AUTO-CREATE EXPENSE FOR BULK SERIALS
            System.out.println("📦 Adding bulk serials: " + addedCount + " units to: " + item.getName());
            if (item.getPurchasePrice() != null && item.getPurchasePrice() > 0) {
                Expense createdExpense = expenseService.createExpenseFromInventory(
                        item.getName(),
                        item.getSku(),
                        addedCount,
                        item.getPurchasePrice(),
                        "Bulk serials added (" + addedCount + " units)"
                );
                if (createdExpense != null) {
                    System.out.println("✅ Expense created for bulk serials: #" + createdExpense.getId());
                }
            } else {
                System.out.println("⚠️ No purchase price set - expense not created");
            }
        }
    }

    /**
     * Mark serial as USED when added to job card - FIXED: NO STOCK MOVEMENT
     */
    @Transactional
    public void markSerialAsUsed(String serialNumber, Long jobCardId, String jobCardNumber) {
        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

        if (serial.getStatus() != SerialStatus.AVAILABLE) {
            throw new RuntimeException("Serial not available: " + serialNumber + ". Current status: " + serial.getStatus());
        }

        serial.setStatus(SerialStatus.USED);
        serial.setUsedAt(LocalDateTime.now());
        serial.setUsedBy(getCurrentUsername());
        serial.setUsedInReferenceType("JOB_CARD");
        serial.setUsedInReferenceId(jobCardId);
        serial.setUsedInReferenceNumber(jobCardNumber);

        inventorySerialRepository.save(serial);

        // FIXED: NO STOCK MOVEMENT RECORDED for job card usage
        System.out.println("✅ Serial marked as USED for job card (no stock movement): " + serialNumber);
    }

    /**
     * Release serial back to AVAILABLE when removed from job card or job card cancelled
     */
    @Transactional
    public void releaseSerial(String serialNumber) {
        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

        if (serial.getStatus() != SerialStatus.USED) {
            throw new RuntimeException("Serial cannot be released. Current status: " + serial.getStatus());
        }

        serial.setStatus(SerialStatus.AVAILABLE);
        serial.setUsedAt(null);
        serial.setUsedBy(null);
        serial.setUsedInReferenceType(null);
        serial.setUsedInReferenceId(null);
        serial.setUsedInReferenceNumber(null);
        serial.setNotes((serial.getNotes() != null ? serial.getNotes() + " " : "") +
                "[Released from job card at " + LocalDateTime.now() + "]");

        inventorySerialRepository.save(serial);

        // FIXED: NO STOCK MOVEMENT for releasing from job card
        System.out.println("✅ Serial released to AVAILABLE (no stock movement): " + serialNumber);
    }

    /**
     * Mark serial as SOLD when invoice is paid - FIXED: ONLY RECORD STOCK MOVEMENT HERE
     */
    @Transactional
    public void markSerialAsSold(String serialNumber, Long invoiceId, String invoiceNumber) {
        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Serial not found: " + serialNumber));

        // FIXED: Allow both AVAILABLE and USED serials to be marked as SOLD
        if (serial.getStatus() != SerialStatus.AVAILABLE && serial.getStatus() != SerialStatus.USED) {
            throw new RuntimeException("Serial cannot be marked as SOLD. Current status: " + serial.getStatus());
        }

        // Store the old status for logging
        SerialStatus oldStatus = serial.getStatus();

        serial.setStatus(SerialStatus.SOLD);
        serial.setUsedAt(LocalDateTime.now());
        serial.setUsedBy(getCurrentUsername());
        serial.setUsedInReferenceType("INVOICE");
        serial.setUsedInReferenceId(invoiceId);
        serial.setUsedInReferenceNumber(invoiceNumber);
        serial.setNotes("Sold via invoice: " + invoiceNumber);

        inventorySerialRepository.save(serial);

        // FIXED: DEDUCT QUANTITY ONLY WHEN MARKED AS SOLD (not when USED)
        updateQuantityForSerialSale(serial.getInventoryItem(), 1);

        // FIXED: RECORD STOCK MOVEMENT ONLY FOR INVOICE SALES
        recordStockMovementForSerial(serial, MovementType.OUT, 1, "INVOICE", invoiceId,
                invoiceNumber, "Sold via invoice", serialNumber);

        System.out.println("✅ Serial marked as SOLD: " + serialNumber +
                " (was: " + oldStatus + ") for invoice: " + invoiceNumber +
                " | Quantity deducted: 1 | Stock movement recorded");
    }

    /**
     * Mark multiple serials as SOLD when invoice is paid
     */
    @Transactional
    public void markMultipleSerialsAsSold(List<String> serialNumbers, Long invoiceId, String invoiceNumber) {
        for (String serialNumber : serialNumbers) {
            try {
                markSerialAsSold(serialNumber, invoiceId, invoiceNumber);
                System.out.println("✅ Serial marked as SOLD: " + serialNumber + " for invoice: " + invoiceNumber);
            } catch (Exception e) {
                System.err.println("❌ Error marking serial as SOLD: " + serialNumber + " - " + e.getMessage());
                throw new RuntimeException("Failed to mark serial as SOLD: " + serialNumber, e);
            }
        }
    }

    /**
     * Update inventory quantity when serial is sold - ONLY CALLED FROM SOLD OPERATIONS
     */
    private void updateQuantityForSerialSale(InventoryItem item, int quantity) {
        try {
            int previousQuantity = item.getQuantity();
            int newQuantity = previousQuantity - quantity;

            if (newQuantity < 0) {
                throw new RuntimeException("Cannot reduce quantity below 0 for item: " + item.getName());
            }

            item.setQuantity(newQuantity);
            inventoryItemRepository.save(item);

            System.out.println("📦 DEDUCTED quantity for " + item.getName() +
                    ": " + previousQuantity + " → " + newQuantity + " (serial SOLD)");

        } catch (Exception e) {
            System.err.println("❌ Failed to update inventory quantity for serial sale: " + e.getMessage());
            throw new RuntimeException("Failed to update inventory quantity", e);
        }
    }

    /**
     * Check if serial is available for use (only AVAILABLE status)
     */
    public boolean isSerialAvailable(String serialNumber) {
        return inventorySerialRepository.findBySerialNumber(serialNumber)
                .map(serial -> serial.getStatus() == SerialStatus.AVAILABLE)
                .orElse(false);
    }

    /**
     * Check if serial is available for use in a specific job card
     * Allows serials that are already USED in the same job card
     */
    public boolean isSerialAvailableForJobCard(String serialNumber, Long jobCardId) {
        return inventorySerialRepository.findBySerialNumber(serialNumber)
                .map(serial -> {
                    if (serial.getStatus() == SerialStatus.AVAILABLE) {
                        return true;
                    }
                    // Allow serials that are already USED in the same job card
                    if (serial.getStatus() == SerialStatus.USED &&
                            "JOB_CARD".equals(serial.getUsedInReferenceType()) &&
                            jobCardId.equals(serial.getUsedInReferenceId())) {
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }

    /**
     * Get USED serials by job card that can be marked as SOLD
     */
    public List<InventorySerial> getUsedSerialsByJobCard(Long jobCardId) {
        return inventorySerialRepository.findByUsedInReferenceTypeAndUsedInReferenceIdAndStatus(
                "JOB_CARD", jobCardId, SerialStatus.USED);
    }

    /**
     * Get available serials (only AVAILABLE status, exclude USED and SOLD)
     */
    public List<InventorySerial> getAvailableSerials(Long itemId) {
        return inventorySerialRepository.findByInventoryItemIdAndStatus(itemId, SerialStatus.AVAILABLE);
    }

    /**
     * Get serial by number with status check
     */
    public InventorySerial getSerialByNumber(String serialNumber) {
        return inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElse(null);
    }

    /**
     * Get all serials for an item
     */
    public List<InventorySerial> getSerialsByItem(Long itemId) {
        return inventorySerialRepository.findByInventoryItemId(itemId);
    }

    /**
     * Get serials by status
     */
    public List<InventorySerial> getSerialsByStatus(SerialStatus status) {
        return inventorySerialRepository.findByStatus(status);
    }

    /**
     * Get serials by reference (job card or invoice)
     */
    public List<InventorySerial> getSerialsByReference(String referenceType, Long referenceId) {
        return inventorySerialRepository.findByUsedInReferenceTypeAndUsedInReferenceId(referenceType, referenceId);
    }

    // ========== STOCK MOVEMENT MANAGEMENT ==========

    /**
     * Helper method to record stock movement for serials - ONLY FOR INVOICE
     */
    private void recordStockMovementForSerial(InventorySerial serial, MovementType type,
                                              Integer quantity, String referenceType,
                                              Long referenceId, String referenceNumber,
                                              String reason, String notes) {

        // FIXED: Only record stock movements for INVOICE references
        if (!"INVOICE".equals(referenceType)) {
            System.out.println("ℹ️ Skipping stock movement record for reference type: " + referenceType);
            return;
        }

        StockMovement movement = new StockMovement();
        movement.setInventoryItem(serial.getInventoryItem());
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setReferenceNumber(referenceNumber);
        movement.setReason(reason);
        movement.setNotes(notes);
        movement.setPerformedBy(getCurrentUsername());
        movement.setSerialNumber(serial.getSerialNumber());

        // Track quantity changes for INVOICE
        int previousQuantity = serial.getInventoryItem().getQuantity() + quantity;
        int newQuantity = serial.getInventoryItem().getQuantity();

        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);

        stockMovementRepository.save(movement);

        System.out.println("📝 Recorded stock movement for INVOICE: " + serial.getSerialNumber());
    }

    /**
     * Record stock movement - SKIP JOB_CARD MOVEMENTS
     */
    private void recordStockMovement(InventoryItem item, MovementType type, Integer quantity,
                                     String referenceType, Long referenceId, String referenceNumber,
                                     String reason, String notes, Integer prevQty, Integer newQty) {

        // FIXED: Skip recording stock movements for JOB_CARD
        if ("JOB_CARD".equals(referenceType)) {
            System.out.println("ℹ️ Skipping JOB_CARD stock movement record for item: " + item.getName());
            return;
        }

        StockMovement movement = new StockMovement();
        movement.setInventoryItem(item);
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setReferenceNumber(referenceNumber);
        movement.setReason(reason);
        movement.setNotes(notes);
        movement.setPerformedBy(getCurrentUsername());
        movement.setPreviousQuantity(prevQty);
        movement.setNewQuantity(newQty);

        stockMovementRepository.save(movement);
    }

    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAll();
    }

    public List<StockMovement> getMovementsByDateRange(LocalDateTime start, LocalDateTime end) {
        return stockMovementRepository.findByDateRange(start, end);
    }

    public List<StockMovement> getMovementsByItem(Long itemId) {
        return stockMovementRepository.findByInventoryItemId(itemId);
    }

    // ========== QUERY METHODS ==========

    public List<InventoryItem> getAllItems() {
        return inventoryItemRepository.findAll();
    }

    public InventoryItem getItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public Optional<InventoryItem> getItemBySku(String sku) {
        return inventoryItemRepository.findBySku(sku);
    }

    public List<InventoryItem> getItemsByCategory(String category) {
        return inventoryItemRepository.findByCategory(category);
    }

    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }

    public List<InventoryItem> getOutOfStockItems() {
        return inventoryItemRepository.findOutOfStockItems();
    }

    public List<InventoryItem> searchItems(String search) {
        return inventoryItemRepository.searchItems(search);
    }

    public List<String> getAllCategories() {
        return inventoryItemRepository.findAllCategories();
    }

    public boolean itemExistsBySku(String sku) {
        return inventoryItemRepository.existsBySku(sku);
    }

    // ========== HELPER METHODS ==========

    private void checkLowStock(InventoryItem item) {
        if (item.getQuantity() <= item.getMinThreshold()) {
            notificationService.sendNotification(
                    NotificationType.LOW_STOCK,
                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
                    item
            );
        }
    }

    private String generateSku() {
        Long count = inventoryItemRepository.count();
        // Generate SKU with 5-digit number: SKU-00001, SKU-00002, etc.
        String sequencePart = String.format("%05d", (count + 1));
        return "SKU-" + sequencePart;
    }

    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    // ========== INVENTORY STATISTICS ==========

    public InventoryStatistics getInventoryStatistics() {
        Long totalItems = inventoryItemRepository.count();
        Long lowStockItems = (long) inventoryItemRepository.findLowStockItems().size();
        Long outOfStockItems = (long) inventoryItemRepository.findOutOfStockItems().size();
        Long serializedItems = inventoryItemRepository.countByHasSerialization(true);

        // Calculate total inventory value
        Double totalValue = inventoryItemRepository.findAll().stream()
                .mapToDouble(item -> (item.getQuantity() != null ? item.getQuantity() : 0) *
                        (item.getPurchasePrice() != null ? item.getPurchasePrice() : 0))
                .sum();

        return new InventoryStatistics(totalItems, lowStockItems, outOfStockItems,
                serializedItems, totalValue);
    }

    /**
     * Inventory Statistics DTO
     */
    public static class InventoryStatistics {
        public final Long totalItems;
        public final Long lowStockItems;
        public final Long outOfStockItems;
        public final Long serializedItems;
        public final Double totalValue;

        public InventoryStatistics(Long totalItems, Long lowStockItems, Long outOfStockItems,
                                   Long serializedItems, Double totalValue) {
            this.totalItems = totalItems;
            this.lowStockItems = lowStockItems;
            this.outOfStockItems = outOfStockItems;
            this.serializedItems = serializedItems;
            this.totalValue = totalValue;
        }
    }

    // ========== BULK OPERATIONS ==========

    @Transactional
    public void bulkUpdateQuantities(List<Long> itemIds, List<Integer> quantities) {
        if (itemIds.size() != quantities.size()) {
            throw new RuntimeException("Item IDs and quantities lists must have the same size");
        }

        for (int i = 0; i < itemIds.size(); i++) {
            Long itemId = itemIds.get(i);
            Integer newQuantity = quantities.get(i);

            InventoryItem item = inventoryItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            int oldQuantity = item.getQuantity();
            item.setQuantity(newQuantity);
            inventoryItemRepository.save(item);

            // Record movement if quantity changed
            if (oldQuantity != newQuantity) {
                int diff = newQuantity - oldQuantity;
                MovementType type = diff > 0 ? MovementType.IN : MovementType.OUT;
                recordStockMovement(item, type, Math.abs(diff), "BULK_UPDATE", null, null,
                        "Bulk quantity update", null, oldQuantity, newQuantity);
            }

            checkLowStock(item);
        }
    }

    @Transactional
    public void bulkUpdatePrices(List<Long> itemIds, List<Double> sellingPrices, List<Double> purchasePrices) {
        if (itemIds.size() != sellingPrices.size() || itemIds.size() != purchasePrices.size()) {
            throw new RuntimeException("All lists must have the same size");
        }

        for (int i = 0; i < itemIds.size(); i++) {
            Long itemId = itemIds.get(i);
            Double sellingPrice = sellingPrices.get(i);
            Double purchasePrice = purchasePrices.get(i);

            InventoryItem item = inventoryItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            if (sellingPrice != null) {
                item.setSellingPrice(sellingPrice);
            }
            if (purchasePrice != null) {
                item.setPurchasePrice(purchasePrice);
            }

            inventoryItemRepository.save(item);
        }
    }

    // ========== SERIAL NUMBER VALIDATION ==========

    /**
     * Validate if serial numbers can be used for an item
     */
    public SerialValidationResult validateSerialsForItem(Long itemId, List<String> serialNumbers) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        SerialValidationResult result = new SerialValidationResult();
        result.setItem(item);

        if (!item.getHasSerialization()) {
            result.setValid(false);
            result.setMessage("Item does not support serialization");
            return result;
        }

        if (serialNumbers == null || serialNumbers.isEmpty()) {
            result.setValid(false);
            result.setMessage("Serial numbers are required for this item");
            return result;
        }

        for (String serialNumber : serialNumbers) {
            Optional<InventorySerial> serialOpt = inventorySerialRepository.findBySerialNumber(serialNumber);

            if (serialOpt.isEmpty()) {
                result.getInvalidSerials().add(serialNumber);
                result.getReasons().put(serialNumber, "Serial number not found");
            } else {
                InventorySerial serial = serialOpt.get();
                if (!serial.getInventoryItem().getId().equals(itemId)) {
                    result.getInvalidSerials().add(serialNumber);
                    result.getReasons().put(serialNumber, "Serial does not belong to this item");
                } else if (serial.getStatus() != SerialStatus.AVAILABLE) {
                    result.getInvalidSerials().add(serialNumber);
                    result.getReasons().put(serialNumber, "Serial is not available. Status: " + serial.getStatus());
                } else {
                    result.getValidSerials().add(serialNumber);
                }
            }
        }

        result.setValid(result.getInvalidSerials().isEmpty());
        if (!result.isValid()) {
            result.setMessage("Some serial numbers are invalid: " + String.join(", ", result.getInvalidSerials()));
        }

        return result;
    }

    /**
     * Serial Validation Result DTO
     */
    public static class SerialValidationResult {
        private InventoryItem item;
        private boolean valid;
        private String message;
        private List<String> validSerials = new ArrayList<>();
        private List<String> invalidSerials = new ArrayList<>();
        private java.util.Map<String, String> reasons = new java.util.HashMap<>();

        // Getters and Setters
        public InventoryItem getItem() { return item; }
        public void setItem(InventoryItem item) { this.item = item; }
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<String> getValidSerials() { return validSerials; }
        public void setValidSerials(List<String> validSerials) { this.validSerials = validSerials; }
        public List<String> getInvalidSerials() { return invalidSerials; }
        public void setInvalidSerials(List<String> invalidSerials) { this.invalidSerials = invalidSerials; }
        public java.util.Map<String, String> getReasons() { return reasons; }
        public void setReasons(java.util.Map<String, String> reasons) { this.reasons = reasons; }
    }
}