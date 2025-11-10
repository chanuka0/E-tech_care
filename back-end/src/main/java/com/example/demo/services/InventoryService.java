//package com.example.demo.services;
//
//import com.example.demo.entity.InventoryItem;
//import com.example.demo.entity.InventorySerial;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.entity.SerialStatus;
//import com.example.demo.repositories.InventoryItemRepository;
//import com.example.demo.repositories.InventorySerialRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class InventoryService {
//    private final InventoryItemRepository inventoryItemRepository;
//    private final InventorySerialRepository inventorySerialRepository;
//    private final NotificationService notificationService;
//
//    @Transactional
//    public InventoryItem createItem(InventoryItem item) {
//        if (item.getSku() == null) {
//            item.setSku(generateSku());
//        }
//        InventoryItem saved = inventoryItemRepository.save(item);
//        checkLowStock(saved);
//        return saved;
//    }
//
//    @Transactional
//    public InventoryItem updateItem(Long id, InventoryItem updates) {
//        InventoryItem existing = inventoryItemRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//
//        existing.setName(updates.getName());
//        existing.setDescription(updates.getDescription());
//        existing.setCategory(updates.getCategory());
//        existing.setQuantity(updates.getQuantity());
//        existing.setMinThreshold(updates.getMinThreshold());
//        existing.setPurchasePrice(updates.getPurchasePrice());
//        existing.setSellingPrice(updates.getSellingPrice());
//        existing.setSpecialPrice(updates.getSpecialPrice());
//
//        InventoryItem saved = inventoryItemRepository.save(existing);
//        checkLowStock(saved);
//        return saved;
//    }
//
//    @Transactional
//    public InventorySerial addSerial(Long itemId, String serialNumber) {
//        InventoryItem item = inventoryItemRepository.findById(itemId)
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//
//        InventorySerial serial = new InventorySerial();
//        serial.setInventoryItem(item);
//        serial.setSerialNumber(serialNumber);
//        serial.setStatus(SerialStatus.AVAILABLE);
//
//        return inventorySerialRepository.save(serial);
//    }
//
//    @Transactional
//    public void deductStock(Long itemId, int quantity, List<String> serialNumbers) {
//        InventoryItem item = inventoryItemRepository.findById(itemId)
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//
//        if (item.getHasSerialization()) {
//            for (String serial : serialNumbers) {
//                InventorySerial is = inventorySerialRepository.findBySerialNumber(serial)
//                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));
//                is.setStatus(SerialStatus.SOLD);
//                is.setSoldAt(LocalDateTime.now());
//                inventorySerialRepository.save(is);
//            }
//        } else {
//            item.setQuantity(item.getQuantity() - quantity);
//            inventoryItemRepository.save(item);
//        }
//
//        checkLowStock(item);
//    }
//
//    public List<InventoryItem> getAllItems() {
//        return inventoryItemRepository.findAll();
//    }
//
//    public List<InventoryItem> getLowStockItems() {
//        return inventoryItemRepository.findLowStockItems();
//    }
//
//    public InventoryItem getItemById(Long id) {
//        return inventoryItemRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//    }
//
//    private void checkLowStock(InventoryItem item) {
//        if (item.getQuantity() <= item.getMinThreshold()) {
//            notificationService.sendNotification(
//                    NotificationType.LOW_STOCK,
//                    "Low stock alert: " + item.getName() + " (Qty: " + item.getQuantity() + ")",
//                    item
//            );
//        }
//    }
//
//    private String generateSku() {
//        return "SKU-" + System.currentTimeMillis();
//    }
//
//
////    public void deductStock(Long id, Integer quantity, List<String> serialNumbers, String reason, String notes) {
////    }
////
////    public void deleteItem(Long id) {
////    }
//@Transactional
//public void deductStock(Long id, Integer quantity, List<String> serialNumbers, String reason, String notes) {
//    InventoryItem item = inventoryItemRepository.findById(id)
//            .orElseThrow(() -> new RuntimeException("Item not found"));
//
//    if (item.getHasSerialization()) {
//        if (serialNumbers == null || serialNumbers.isEmpty()) {
//            throw new RuntimeException("Serial numbers required for serialized item");
//        }
//
//        for (String serial : serialNumbers) {
//            InventorySerial invSerial = inventorySerialRepository.findBySerialNumber(serial)
//                    .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));
//
//            if (invSerial.getStatus() == SerialStatus.SOLD) {
//                throw new RuntimeException("Serial already sold: " + serial);
//            }
//
//            invSerial.setStatus(SerialStatus.SOLD);
//            invSerial.setSoldAt(LocalDateTime.now());
//            invSerial.setNotes(notes);
//            inventorySerialRepository.save(invSerial);
//        }
//
//        // Update quantity automatically based on sold serials
//        item.setQuantity(item.getQuantity() - serialNumbers.size());
//    } else {
//        if (item.getQuantity() < quantity) {
//            throw new RuntimeException("Not enough stock for item: " + item.getName());
//        }
//        item.setQuantity(item.getQuantity() - quantity);
//    }
//
//    inventoryItemRepository.save(item);
//
//    // Log or notify about stock deduction (optional)
//    notificationService.sendNotification(
//            NotificationType.STOCK_UPDATE,
//            "Stock deducted for item: " + item.getName() +
//                    " | Qty: " + quantity +
//                    (reason != null ? " | Reason: " + reason : ""),
//            item
//    );
//
//    checkLowStock(item);
//}
//
//    @Transactional
//    public void deleteItem(Long id) {
//        InventoryItem item = inventoryItemRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//
//        // If item has serials, remove them first (due to foreign key)
//        if (item.getSerials() != null && !item.getSerials().isEmpty()) {
//            for (InventorySerial serial : item.getSerials()) {
//                inventorySerialRepository.delete(serial);
//            }
//        }
//
//        inventoryItemRepository.delete(item);
//
//        // Optional: notify deletion
//        notificationService.sendNotification(
//                NotificationType.ITEM_REMOVED,
//                "Item deleted: " + item.getName() + " (SKU: " + item.getSku() + ")",
//                item
//        );
//    }
//
//}



package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.InventorySerialRepository;
import com.example.demo.repositories.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationService notificationService;

    @Transactional
    public InventoryItem createItem(InventoryItem item) {
        if (item.getSku() == null) {
            item.setSku(generateSku());
        }
        InventoryItem saved = inventoryItemRepository.save(item);

        // Record initial stock if quantity > 0
        if (saved.getQuantity() > 0) {
            recordStockMovement(saved, MovementType.IN, saved.getQuantity(),
                    "MANUAL", null, null, "Initial stock", null, 0, saved.getQuantity());
        }

        checkLowStock(saved);
        return saved;
    }

    @Transactional
    public InventoryItem updateItem(Long id, InventoryItem updates) {
        InventoryItem existing = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        int oldQuantity = existing.getQuantity();

        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setCategory(updates.getCategory());
        existing.setQuantity(updates.getQuantity());
        existing.setMinThreshold(updates.getMinThreshold());
        existing.setPurchasePrice(updates.getPurchasePrice());
        existing.setSellingPrice(updates.getSellingPrice());
        existing.setSpecialPrice(updates.getSpecialPrice());

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
        item.setQuantity(item.getQuantity() + 1);
        inventoryItemRepository.save(item);

        recordStockMovement(item, MovementType.IN, 1, "MANUAL", null, null,
                "Serial added", serialNumber, item.getQuantity() - 1, item.getQuantity());

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
        }
    }

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

        recordStockMovement(item, MovementType.ADJUSTMENT, Math.abs(diff),
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
                    throw new RuntimeException("Serial not available: " + serial);
                }

                invSerial.setStatus(SerialStatus.SOLD);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                // Record movement for each serial
                recordStockMovement(item, MovementType.OUT, 1, "DIRECT_USE", null, null,
                        reason, serial, oldQty, oldQty - 1);
                oldQty--;
            }

            item.setQuantity(item.getQuantity() - serialNumbers.size());
        } else {
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
    /**
     * Deduct stock and mark serials as SOLD for invoice payment
     */
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

                if (invSerial.getStatus() != SerialStatus.AVAILABLE) {
                    throw new RuntimeException("Serial not available: " + serial);
                }

                // Mark serial as SOLD with invoice reference
                invSerial.setStatus(SerialStatus.SOLD);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setUsedInReferenceType("INVOICE");
                invSerial.setUsedInReferenceId(invoiceId);
                invSerial.setUsedInReferenceNumber(invoiceNumber);
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                // Record movement for each serial
                recordStockMovement(item, MovementType.OUT, 1, "INVOICE", invoiceId, invoiceNumber,
                        "Sold via invoice", serial, oldQty, oldQty - 1);
                oldQty--;
            }

            item.setQuantity(item.getQuantity() - serialNumbers.size());
        } else {
            if (item.getQuantity() < quantity) {
                throw new RuntimeException("Not enough stock for item: " + item.getName());
            }

            item.setQuantity(item.getQuantity() - quantity);

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

    @Transactional
    public void deductStockForJobCard(Long itemId, Integer quantity, List<String> serialNumbers,
                                      Long jobCardId, String jobCardNumber, String notes) {
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
                    throw new RuntimeException("Serial not available: " + serial);
                }

                invSerial.setStatus(SerialStatus.SOLD);
                invSerial.setUsedAt(LocalDateTime.now());
                invSerial.setUsedBy(getCurrentUsername());
                invSerial.setUsedInReferenceType("JOB_CARD");
                invSerial.setUsedInReferenceId(jobCardId);
                invSerial.setUsedInReferenceNumber(jobCardNumber);
                invSerial.setNotes(notes);
                inventorySerialRepository.save(invSerial);

                recordStockMovement(item, MovementType.OUT, 1, "JOB_CARD", jobCardId, jobCardNumber,
                        "Used in job card", serial, oldQty, oldQty - 1);
                oldQty--;
            }

            item.setQuantity(item.getQuantity() - serialNumbers.size());
        } else {
            if (item.getQuantity() < quantity) {
                throw new RuntimeException("Not enough stock");
            }

            item.setQuantity(item.getQuantity() - quantity);

            recordStockMovement(item, MovementType.OUT, quantity, "JOB_CARD", jobCardId,
                    jobCardNumber, "Used in job card", notes, oldQty, item.getQuantity());
        }

        inventoryItemRepository.save(item);
        checkLowStock(item);
    }

    private void recordStockMovement(InventoryItem item, MovementType type, Integer quantity,
                                     String referenceType, Long referenceId, String referenceNumber,
                                     String reason, String notes, Integer prevQty, Integer newQty) {
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

    public List<InventoryItem> getAllItems() {
        return inventoryItemRepository.findAll();
    }

    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }
    /**
     * Get serial by serial number
     */
    public InventorySerial getSerialByNumber(String serialNumber) {
        return inventorySerialRepository.findBySerialNumber(serialNumber)
                .orElse(null);
    }

    public InventoryItem getItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
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

    public List<InventorySerial> getSerialsByItem(Long itemId) {
        return inventorySerialRepository.findByInventoryItemId(itemId);
    }

    public List<InventorySerial> getAvailableSerials(Long itemId) {
        return inventorySerialRepository.findByInventoryItemIdAndStatus(itemId, SerialStatus.AVAILABLE);
    }

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
        return "SKU-" + System.currentTimeMillis();
    }

    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    @Transactional
    public void deleteItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

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


}