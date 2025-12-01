package com.example.demo.controller;

import com.example.demo.entity.StockMovement;
import com.example.demo.services.InventoryService;
import com.example.demo.services.StockReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports/stock")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockReportController {
    private final StockReportService stockReportService;
    private final InventoryService inventoryService;

    /**
     * Get all stock movements with optional filters
     */
    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<StockMovement>> getAllMovements(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) String movementType) {

        if (startDate != null && endDate != null && itemId != null) {
            return ResponseEntity.ok(inventoryService.getMovementsByItem(itemId)
                    .stream()
                    .filter(m -> m.getCreatedAt().isAfter(startDate) && m.getCreatedAt().isBefore(endDate))
                    .toList());
        } else if (startDate != null && endDate != null) {
            return ResponseEntity.ok(stockReportService.getMovementsByDateRange(startDate, endDate));
        } else if (itemId != null) {
            return ResponseEntity.ok(inventoryService.getMovementsByItem(itemId));
        } else {
            return ResponseEntity.ok(inventoryService.getAllMovements());
        }
    }

    /**
     * Get stock movement summary statistics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getStockSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(stockReportService.getStockSummary(startDate, endDate));
    }

    /**
     * Get item-wise stock movement report
     */
    @GetMapping("/by-item")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getItemWiseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(stockReportService.getItemWiseReport(startDate, endDate));
    }

    /**
     * Get daily stock movement trends
     */
    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getStockTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(stockReportService.getDailyStockTrends(startDate, endDate));
    }

    /**
     * Get most used items report
     */
    @GetMapping("/most-used")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getMostUsedItems(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "10") int limit) {

        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        return ResponseEntity.ok(stockReportService.getMostUsedItems(startDate, endDate, limit));
    }

    /**
     * Get category-wise stock distribution
     */
    @GetMapping("/by-category")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Map<String, Object>>> getCategoryReport() {
        return ResponseEntity.ok(stockReportService.getCategoryWiseReport());
    }
}