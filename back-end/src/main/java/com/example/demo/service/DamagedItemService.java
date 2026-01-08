//package com.example.demo.service;
//
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.DamagedItemRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import com.example.demo.repositories.InventorySerialRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class DamagedItemService {
//    private final DamagedItemRepository damagedItemRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final InventorySerialRepository inventorySerialRepository;
//    private final NotificationService notificationService;
//
//    @Transactional
//    public DamagedItem recordDamage(DamagedItem damage) {
//        damage.setCreatedAt(LocalDateTime.now());
//
//        // Update inventory
//        InventoryItem item = inventoryItemRepository.findById(damage.getInventoryItem().getId())
//                .orElseThrow(() -> new RuntimeException("Item not found"));
//
//        if (damage.getSerialNumber() != null) {
//            InventorySerial serial = inventorySerialRepository.findBySerialNumber(damage.getSerialNumber())
//                    .orElseThrow(() -> new RuntimeException("Serial not found"));
//            serial.setStatus(SerialStatus.DAMAGED);
//            inventorySerialRepository.save(serial);
//        } else {
//            item.setQuantity(item.getQuantity() - damage.getQuantity());
//            inventoryItemRepository.save(item);
//        }
//
//        DamagedItem saved = damagedItemRepository.save(damage);
//
//        notificationService.sendNotification(
//                NotificationType.DAMAGED_ITEM,
//                "Damaged item recorded: " + item.getName(),
//                saved
//        );
//
//        return saved;
//    }
//
//    public List<DamagedItem> getAllDamagedItems() {
//        return damagedItemRepository.findAll();
//    }
//
//    public List<DamagedItem> getDamagedItemsByDateRange(LocalDateTime start, LocalDateTime end) {
//        return damagedItemRepository.findByCreatedAtBetween(start, end);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.DamagedItem;
import com.example.demo.entity.InventoryItem;
import com.example.demo.entity.InventorySerial;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.entity.SerialStatus;
import com.example.demo.repositories.DamagedItemRepository;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.InventorySerialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DamagedItemService {
    private final DamagedItemRepository damagedItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final NotificationService notificationService;

    @Transactional
    public DamagedItem recordDamage(DamagedItem damage) {
        damage.setCreatedAt(LocalDateTime.now());

        // Update inventory
        InventoryItem item = inventoryItemRepository.findById(damage.getInventoryItem().getId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        String damageDescription = "";

        if (damage.getSerialNumber() != null && !damage.getSerialNumber().isEmpty()) {
            // Serial-specific damage
            InventorySerial serial = inventorySerialRepository.findBySerialNumber(damage.getSerialNumber())
                    .orElseThrow(() -> new RuntimeException("Serial not found"));
            serial.setStatus(SerialStatus.DAMAGED);
            inventorySerialRepository.save(serial);
            damageDescription = "Serial: " + damage.getSerialNumber();
        } else {
            // Quantity-based damage
            if (damage.getQuantity() == null || damage.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be greater than 0 for non-serial damage");
            }

            int oldQuantity = item.getQuantity();
            if (oldQuantity < damage.getQuantity()) {
                throw new RuntimeException("Not enough stock. Available: " + oldQuantity + ", Damaged: " + damage.getQuantity());
            }

            item.setQuantity(oldQuantity - damage.getQuantity());
            inventoryItemRepository.save(item);
            damageDescription = "Quantity: " + damage.getQuantity();
        }

        DamagedItem saved = damagedItemRepository.save(damage);

        // ✅ ADD NOTIFICATION
        Map<String, Object> payload = new HashMap<>();
        payload.put("damageId", saved.getId());
        payload.put("itemName", item.getName());
        payload.put("reason", damage.getReason());
        payload.put("damageType", damageDescription);
        payload.put("createdAt", saved.getCreatedAt());

        notificationService.sendNotification(
                NotificationType.DAMAGED_ITEM,
                "Damaged item recorded: " + item.getName() + " (" + damageDescription + ") | Reason: " + damage.getReason(),
                payload,
                NotificationSeverity.WARNING
        );

        return saved;
    }

    public List<DamagedItem> getAllDamagedItems() {
        return damagedItemRepository.findAll();
    }

    public DamagedItem getDamagedItemById(Long id) {
        return damagedItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Damaged item record not found"));
    }

    public List<DamagedItem> getDamagedItemsByDateRange(LocalDateTime start, LocalDateTime end) {
        return damagedItemRepository.findByCreatedAtBetween(start, end);
    }

    /**
     * Get damaged items count by reason
     */
    public long getDamagedItemsCountByReason(String reason) {
        return damagedItemRepository.findAll().stream()
                .filter(d -> d.getReason() != null && d.getReason().equals(reason))
                .count();
    }

    /**
     * Get all unique damage reasons
     */
    public List<String> getAllDamageReasons() {
        return damagedItemRepository.findAll().stream()
                .map(DamagedItem::getReason)
                .distinct()
                .toList();
    }

    /**
     * Get total damaged items count
     */
    public long getTotalDamagedItemsCount() {
        return damagedItemRepository.count();
    }

    /**
     * Get total quantity of damaged items (for non-serial items)
     */
    public Integer getTotalDamagedQuantity() {
        List<DamagedItem> allDamaged = damagedItemRepository.findAll();
        return allDamaged.stream()
                .mapToInt(d -> d.getQuantity() != null ? d.getQuantity() : 1)
                .sum();
    }

    /**
     * Delete damage record (restore inventory if needed)
     */
    @Transactional
    public void deleteDamageRecord(Long id) {
        DamagedItem damage = getDamagedItemById(id);
        InventoryItem item = damage.getInventoryItem();

        // Restore inventory
        if (damage.getSerialNumber() != null && !damage.getSerialNumber().isEmpty()) {
            // Restore serial to AVAILABLE
            InventorySerial serial = inventorySerialRepository.findBySerialNumber(damage.getSerialNumber())
                    .orElseThrow(() -> new RuntimeException("Serial not found"));

            if (serial.getStatus() == SerialStatus.DAMAGED) {
                serial.setStatus(SerialStatus.AVAILABLE);
                inventorySerialRepository.save(serial);
            }
        } else {
            // Restore quantity
            int oldQuantity = item.getQuantity();
            item.setQuantity(oldQuantity + (damage.getQuantity() != null ? damage.getQuantity() : 1));
            inventoryItemRepository.save(item);
        }

        // Delete the damage record
        damagedItemRepository.delete(damage);

        // ✅ ADD NOTIFICATION
        Map<String, Object> payload = new HashMap<>();
        payload.put("damageId", damage.getId());
        payload.put("itemName", item.getName());
        payload.put("reason", damage.getReason());

        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Damage record deleted: " + item.getName() + " | Reason: " + damage.getReason(),
                payload,
                NotificationSeverity.INFO
        );
    }
}