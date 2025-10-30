package com.example.demo.services;

//package com.etechcare.service;
//
//import com.etechcare.entity.*;
//import com.etechcare.repository.*;
import com.example.demo.entity.InventoryItem;
import com.example.demo.entity.InventorySerial;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.SerialStatus;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.InventorySerialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final NotificationService notificationService;

    @Transactional
    public InventoryItem createItem(InventoryItem item) {
        if (item.getSku() == null) {
            item.setSku(generateSku());
        }
        InventoryItem saved = inventoryItemRepository.save(item);
        checkLowStock(saved);
        return saved;
    }

    @Transactional
    public InventoryItem updateItem(Long id, InventoryItem updates) {
        InventoryItem existing = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setCategory(updates.getCategory());
        existing.setQuantity(updates.getQuantity());
        existing.setMinThreshold(updates.getMinThreshold());
        existing.setPurchasePrice(updates.getPurchasePrice());
        existing.setSellingPrice(updates.getSellingPrice());
        existing.setSpecialPrice(updates.getSpecialPrice());

        InventoryItem saved = inventoryItemRepository.save(existing);
        checkLowStock(saved);
        return saved;
    }

    @Transactional
    public InventorySerial addSerial(Long itemId, String serialNumber) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        InventorySerial serial = new InventorySerial();
        serial.setInventoryItem(item);
        serial.setSerialNumber(serialNumber);
        serial.setStatus(SerialStatus.AVAILABLE);

        return inventorySerialRepository.save(serial);
    }

    @Transactional
    public void deductStock(Long itemId, int quantity, List<String> serialNumbers) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (item.getHasSerialization()) {
            for (String serial : serialNumbers) {
                InventorySerial is = inventorySerialRepository.findBySerialNumber(serial)
                        .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));
                is.setStatus(SerialStatus.SOLD);
                is.setSoldAt(LocalDateTime.now());
                inventorySerialRepository.save(is);
            }
        } else {
            item.setQuantity(item.getQuantity() - quantity);
            inventoryItemRepository.save(item);
        }

        checkLowStock(item);
    }

    public List<InventoryItem> getAllItems() {
        return inventoryItemRepository.findAll();
    }

    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }

    public InventoryItem getItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
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


//    public void deductStock(Long id, Integer quantity, List<String> serialNumbers, String reason, String notes) {
//    }
//
//    public void deleteItem(Long id) {
//    }
@Transactional
public void deductStock(Long id, Integer quantity, List<String> serialNumbers, String reason, String notes) {
    InventoryItem item = inventoryItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));

    if (item.getHasSerialization()) {
        if (serialNumbers == null || serialNumbers.isEmpty()) {
            throw new RuntimeException("Serial numbers required for serialized item");
        }

        for (String serial : serialNumbers) {
            InventorySerial invSerial = inventorySerialRepository.findBySerialNumber(serial)
                    .orElseThrow(() -> new RuntimeException("Serial not found: " + serial));

            if (invSerial.getStatus() == SerialStatus.SOLD) {
                throw new RuntimeException("Serial already sold: " + serial);
            }

            invSerial.setStatus(SerialStatus.SOLD);
            invSerial.setSoldAt(LocalDateTime.now());
            invSerial.setNotes(notes);
            inventorySerialRepository.save(invSerial);
        }

        // Update quantity automatically based on sold serials
        item.setQuantity(item.getQuantity() - serialNumbers.size());
    } else {
        if (item.getQuantity() < quantity) {
            throw new RuntimeException("Not enough stock for item: " + item.getName());
        }
        item.setQuantity(item.getQuantity() - quantity);
    }

    inventoryItemRepository.save(item);

    // Log or notify about stock deduction (optional)
    notificationService.sendNotification(
            NotificationType.STOCK_UPDATE,
            "Stock deducted for item: " + item.getName() +
                    " | Qty: " + quantity +
                    (reason != null ? " | Reason: " + reason : ""),
            item
    );

    checkLowStock(item);
}

    @Transactional
    public void deleteItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // If item has serials, remove them first (due to foreign key)
        if (item.getSerials() != null && !item.getSerials().isEmpty()) {
            for (InventorySerial serial : item.getSerials()) {
                inventorySerialRepository.delete(serial);
            }
        }

        inventoryItemRepository.delete(item);

        // Optional: notify deletion
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Item deleted: " + item.getName() + " (SKU: " + item.getSku() + ")",
                item
        );
    }

}