package com.example.demo.service;

import com.example.demo.entity.InventoryItem;
import com.example.demo.entity.MovementType;
import com.example.demo.entity.StockMovement;
import com.example.demo.repositories.InventoryItemRepository;
import com.example.demo.repositories.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockReportService {
    private final StockMovementRepository stockMovementRepository;
    private final InventoryItemRepository inventoryItemRepository;

    /**
     * Get comprehensive stock summary
     */
    public Map<String, Object> getStockSummary(LocalDateTime startDate, LocalDateTime endDate) {
        List<StockMovement> movements = stockMovementRepository.findByDateRange(startDate, endDate);

        Map<String, Object> summary = new HashMap<>();

        // Total movements
        summary.put("totalMovements", movements.size());

        // Movement counts by type
        long inMovements = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.IN)
                .count();
        long outMovements = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.OUT)
                .count();
        long adjustments = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.ADJUSTMENT)
                .count();

        summary.put("inMovements", inMovements);
        summary.put("outMovements", outMovements);
        summary.put("adjustments", adjustments);

        // Total quantities
        int totalIn = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.IN)
                .mapToInt(StockMovement::getQuantity)
                .sum();
        int totalOut = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.OUT)
                .mapToInt(StockMovement::getQuantity)
                .sum();

        summary.put("totalQuantityIn", totalIn);
        summary.put("totalQuantityOut", totalOut);
        summary.put("netChange", totalIn - totalOut);

        // Current inventory status
        List<InventoryItem> allItems = inventoryItemRepository.findAll();
        summary.put("totalItems", allItems.size());
        summary.put("totalCurrentStock", allItems.stream().mapToInt(InventoryItem::getQuantity).sum());
        summary.put("lowStockItems", allItems.stream()
                .filter(item -> item.getQuantity() <= item.getMinThreshold())
                .count());
        summary.put("outOfStockItems", allItems.stream()
                .filter(item -> item.getQuantity() == 0)
                .count());

        // Date range
        summary.put("startDate", startDate);
        summary.put("endDate", endDate);

        return summary;
    }

    /**
     * Get item-wise stock movement report
     */
    public List<Map<String, Object>> getItemWiseReport(LocalDateTime startDate, LocalDateTime endDate) {
        List<StockMovement> movements = stockMovementRepository.findByDateRange(startDate, endDate);

        // Group by item
        Map<Long, List<StockMovement>> movementsByItem = movements.stream()
                .collect(Collectors.groupingBy(m -> m.getInventoryItem().getId()));

        List<Map<String, Object>> report = new ArrayList<>();

        movementsByItem.forEach((itemId, itemMovements) -> {
            InventoryItem item = itemMovements.get(0).getInventoryItem();

            int totalIn = itemMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.IN)
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            int totalOut = itemMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.OUT)
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            int adjustments = itemMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.ADJUSTMENT)
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            Map<String, Object> itemReport = new HashMap<>();
            itemReport.put("itemId", item.getId());
            itemReport.put("itemName", item.getName());
            itemReport.put("sku", item.getSku());
            itemReport.put("category", item.getCategory());
            itemReport.put("currentStock", item.getQuantity());
            itemReport.put("minThreshold", item.getMinThreshold());
            itemReport.put("totalIn", totalIn);
            itemReport.put("totalOut", totalOut);
            itemReport.put("adjustments", adjustments);
            itemReport.put("netChange", totalIn - totalOut + adjustments);
            itemReport.put("movementCount", itemMovements.size());
            itemReport.put("hasSerialization", item.getHasSerialization());

            report.add(itemReport);
        });

        // Sort by most active (highest movement count)
        report.sort((a, b) -> ((Integer) b.get("movementCount")).compareTo((Integer) a.get("movementCount")));

        return report;
    }

    /**
     * Get daily stock movement trends
     */
    public List<Map<String, Object>> getDailyStockTrends(LocalDateTime startDate, LocalDateTime endDate) {
        List<StockMovement> movements = stockMovementRepository.findByDateRange(startDate, endDate);

        // Group by date
        Map<LocalDate, List<StockMovement>> movementsByDate = movements.stream()
                .collect(Collectors.groupingBy(m -> m.getCreatedAt().toLocalDate()));

        List<Map<String, Object>> trends = new ArrayList<>();

        LocalDate currentDate = startDate.toLocalDate();
        LocalDate end = endDate.toLocalDate();

        while (!currentDate.isAfter(end)) {
            List<StockMovement> dayMovements = movementsByDate.getOrDefault(currentDate, new ArrayList<>());

            int inCount = (int) dayMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.IN)
                    .count();
            int outCount = (int) dayMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.OUT)
                    .count();
            int adjustmentCount = (int) dayMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.ADJUSTMENT)
                    .count();

            int inQuantity = dayMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.IN)
                    .mapToInt(StockMovement::getQuantity)
                    .sum();
            int outQuantity = dayMovements.stream()
                    .filter(m -> m.getMovementType() == MovementType.OUT)
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            Map<String, Object> dayTrend = new HashMap<>();
            dayTrend.put("date", currentDate);
            dayTrend.put("inCount", inCount);
            dayTrend.put("outCount", outCount);
            dayTrend.put("adjustmentCount", adjustmentCount);
            dayTrend.put("inQuantity", inQuantity);
            dayTrend.put("outQuantity", outQuantity);
            dayTrend.put("netQuantity", inQuantity - outQuantity);
            dayTrend.put("totalMovements", dayMovements.size());

            trends.add(dayTrend);
            currentDate = currentDate.plusDays(1);
        }

        return trends;
    }

    /**
     * Get most used items (highest OUT movements)
     */
    public List<Map<String, Object>> getMostUsedItems(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<StockMovement> movements = stockMovementRepository.findByDateRange(startDate, endDate);

        // Filter OUT movements only
        Map<Long, List<StockMovement>> outMovementsByItem = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.OUT)
                .collect(Collectors.groupingBy(m -> m.getInventoryItem().getId()));

        List<Map<String, Object>> mostUsed = new ArrayList<>();

        outMovementsByItem.forEach((itemId, itemMovements) -> {
            InventoryItem item = itemMovements.get(0).getInventoryItem();

            int totalUsed = itemMovements.stream()
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            Map<String, Object> usage = new HashMap<>();
            usage.put("itemId", item.getId());
            usage.put("itemName", item.getName());
            usage.put("sku", item.getSku());
            usage.put("category", item.getCategory());
            usage.put("totalUsed", totalUsed);
            usage.put("usageCount", itemMovements.size());
            usage.put("currentStock", item.getQuantity());
            usage.put("averagePerUse", totalUsed / (double) itemMovements.size());

            mostUsed.add(usage);
        });

        // Sort by total used quantity
        mostUsed.sort((a, b) -> ((Integer) b.get("totalUsed")).compareTo((Integer) a.get("totalUsed")));

        // Return top N items
        return mostUsed.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Get category-wise stock distribution
     */
    public List<Map<String, Object>> getCategoryWiseReport() {
        List<InventoryItem> allItems = inventoryItemRepository.findAll();

        // Group by category
        Map<String, List<InventoryItem>> itemsByCategory = allItems.stream()
                .collect(Collectors.groupingBy(item ->
                        item.getCategory() != null ? item.getCategory() : "Uncategorized"));

        List<Map<String, Object>> categoryReport = new ArrayList<>();

        itemsByCategory.forEach((category, items) -> {
            int totalItems = items.size();
            int totalStock = items.stream().mapToInt(InventoryItem::getQuantity).sum();
            double totalValue = items.stream()
                    .mapToDouble(item -> item.getQuantity() * item.getSellingPrice())
                    .sum();
            int lowStock = (int) items.stream()
                    .filter(item -> item.getQuantity() <= item.getMinThreshold())
                    .count();

            Map<String, Object> catReport = new HashMap<>();
            catReport.put("category", category);
            catReport.put("itemCount", totalItems);
            catReport.put("totalStock", totalStock);
            catReport.put("totalValue", totalValue);
            catReport.put("lowStockItems", lowStock);
            catReport.put("averageStockPerItem", totalStock / (double) totalItems);

            categoryReport.add(catReport);
        });

        // Sort by total value
        categoryReport.sort((a, b) ->
                Double.compare((Double) b.get("totalValue"), (Double) a.get("totalValue")));

        return categoryReport;
    }

    /**
     * Get stock movements by date range (for export/display)
     */
    public List<StockMovement> getMovementsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return stockMovementRepository.findByDateRange(startDate, endDate);
    }
}