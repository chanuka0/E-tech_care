package com.example.demo.services;


import com.example.demo.entity.*;
import com.example.demo.repositories.DamagedItemRepository;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.InventorySerialRepository;
import com.example.demo.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import com.example.demo.service.NotificationService;

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

        if (damage.getSerialNumber() != null) {
            InventorySerial serial = inventorySerialRepository.findBySerialNumber(damage.getSerialNumber())
                    .orElseThrow(() -> new RuntimeException("Serial not found"));
            serial.setStatus(SerialStatus.DAMAGED);
            inventorySerialRepository.save(serial);
        } else {
            item.setQuantity(item.getQuantity() - damage.getQuantity());
            inventoryItemRepository.save(item);
        }

        DamagedItem saved = damagedItemRepository.save(damage);

        notificationService.sendNotification(
                NotificationType.DAMAGED_ITEM,
                "Damaged item recorded: " + item.getName(),
                saved
        );

        return saved;
    }

    public List<DamagedItem> getAllDamagedItems() {
        return damagedItemRepository.findAll();
    }

    public List<DamagedItem> getDamagedItemsByDateRange(LocalDateTime start, LocalDateTime end) {
        return damagedItemRepository.findByCreatedAtBetween(start, end);
    }
}