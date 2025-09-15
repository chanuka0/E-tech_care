package com.example.demo.inventory;


//import com.example.demo.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockAlertScheduler {

    private final InventoryService inventoryService;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void checkStockLevels() {
        log.debug("Running scheduled stock level check");

        try {
            // The inventory service automatically creates alerts when stock is updated
            // This scheduler could be used for additional periodic checks or notifications
            int lowStockCount = inventoryService.getLowStockItems().size();
            int outOfStockCount = inventoryService.getOutOfStockItems().size();

            if (lowStockCount > 0 || outOfStockCount > 0) {
                log.warn("Stock Alert: {} low stock items, {} out of stock items",
                        lowStockCount, outOfStockCount);
            }

        } catch (Exception e) {
            log.error("Error during scheduled stock level check", e);
        }
    }
}