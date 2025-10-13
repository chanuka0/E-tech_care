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
}