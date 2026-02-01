package com.example.demo.service;

import com.example.demo.entity.InventoryItem;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.entity.NotificationType;
import com.example.demo.repositories.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ✅ INVENTORY MONITORING SERVICE
 *
 * Checks inventory for low/out-of-stock items daily at 8:00 AM
 */
@Service
@RequiredArgsConstructor
public class InventoryMonitoringService {

    private final InventoryItemRepository inventoryItemRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * ✅ DAILY INVENTORY CHECK - EVERY DAY AT 8:00 AM
     *
     * Checks for low stock and out of stock items once per day at 8 AM
     * Cron: "0 0 8 * * *" = 8:00 AM every day
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkInventoryLevelsDaily() {
        try {
            String currentTime = LocalDateTime.now().format(TIME_FORMATTER);
            System.out.println("═══════════════════════════════════════════════════════════");
            System.out.println("🔍 DAILY INVENTORY CHECK [8:00 AM]");
            System.out.println("   Time: " + currentTime);
            System.out.println("───────────────────────────────────────────────────────────");

            // Check for out of stock items (quantity = 0)
            List<InventoryItem> outOfStockItems = inventoryItemRepository.findOutOfStockItems();
            if (!outOfStockItems.isEmpty()) {
                for (InventoryItem item : outOfStockItems) {
                    notificationService.sendNotification(
                            NotificationType.LOW_STOCK,
                            "🚨 OUT OF STOCK: " + item.getName() +
                                    "\n├─ SKU: " + item.getSku() +
                                    "\n├─ Current Stock: 0" +
                                    "\n├─ Min Required: " + item.getMinThreshold() +
                                    "\n└─ ⚠️ URGENT: Immediate restocking needed!",
                            item,
                            NotificationSeverity.DANGER
                    );
                }
                System.out.println("   🚨 OUT OF STOCK: " + outOfStockItems.size() + " items");
                outOfStockItems.forEach(item ->
                        System.out.println("      - " + item.getName() + " (SKU: " + item.getSku() + ")")
                );
            }

            // Check for low stock items (quantity <= minThreshold but > 0)
            List<InventoryItem> lowStockItems = inventoryItemRepository.findLowStockItems();
            int lowStockCount = 0;

            if (!lowStockItems.isEmpty()) {
                for (InventoryItem item : lowStockItems) {
                    // Only send notification if item is not already out of stock
                    if (item.getQuantity() != null && item.getQuantity() > 0) {
                        int shortage = item.getMinThreshold() - item.getQuantity();
                        notificationService.sendNotification(
                                NotificationType.LOW_STOCK,
                                "⚠️ LOW STOCK ALERT: " + item.getName() +
                                        "\n├─ SKU: " + item.getSku() +
                                        "\n├─ Current Stock: " + item.getQuantity() +
                                        "\n├─ Min Required: " + item.getMinThreshold() +
                                        "\n└─ Shortage: " + shortage + " units",
                                item,
                                NotificationSeverity.WARNING
                        );
                        lowStockCount++;
                    }
                }
                if (lowStockCount > 0) {
                    System.out.println("   ⚠️  LOW STOCK: " + lowStockCount + " items");
                    lowStockItems.stream()
                            .filter(item -> item.getQuantity() != null && item.getQuantity() > 0)
                            .forEach(item ->
                                    System.out.println("      - " + item.getName() +
                                            " (Current: " + item.getQuantity() +
                                            ", Min: " + item.getMinThreshold() + ")")
                            );
                }
            }

            if (outOfStockItems.isEmpty() && lowStockCount == 0) {
                System.out.println("   ✅ All inventory levels are healthy");
            }

            System.out.println("═══════════════════════════════════════════════════════════");

        } catch (Exception e) {
            System.err.println("═══════════════════════════════════════════════════════════");
            System.err.println("❌ ERROR during daily inventory check at 8 AM");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   Time: " + LocalDateTime.now().format(TIME_FORMATTER));
            System.err.println("═══════════════════════════════════════════════════════════");
            e.printStackTrace();
        }
    }

    /**
     * ✅ TESTING ONLY: Check inventory every minute
     *
     * ⚠️ UNCOMMENT THIS FOR TESTING, THEN COMMENT OUT AFTER TESTING!
     * Use this to test inventory monitoring without waiting until 8 AM
     */
    // @Scheduled(cron = "0 * * * * *")  // Every minute
    // public void testInventoryCheck() {
    //     System.out.println("🧪 TEST: Running inventory check at " + LocalDateTime.now().format(TIME_FORMATTER));
    //     checkInventoryLevelsDaily();
    // }
}