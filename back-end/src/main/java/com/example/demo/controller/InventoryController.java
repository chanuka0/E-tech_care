package com.example.demo.controller;

import com.example.demo.entity.InventoryItem;
import com.example.demo.entity.InventorySerial;
import com.example.demo.entity.StockMovement;
import com.example.demo.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {
    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.createItem(item));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getItemById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.updateItem(id, item));
    }

    @PostMapping("/{id}/serials")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InventorySerial> addSerial(
            @PathVariable Long id,
            @RequestBody Map<String, String> data) {
        return ResponseEntity.ok(inventoryService.addSerial(id, data.get("serialNumber")));
    }

    @PostMapping("/{id}/serials/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addBulkSerials(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> data) {
        inventoryService.addBulkSerials(id, data.get("serialNumbers"));
        return ResponseEntity.ok(Map.of("message", "Serials added successfully"));
    }

    @GetMapping("/{id}/serials")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventorySerial>> getSerialsByItem(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getSerialsByItem(id));
    }

    @GetMapping("/{id}/serials/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventorySerial>> getAvailableSerials(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getAvailableSerials(id));
    }

    @PostMapping("/{id}/add-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data) {
        Integer quantity = ((Number) data.get("quantity")).intValue();
        String reason = (String) data.get("reason");
        String notes = (String) data.get("notes");

        inventoryService.addStock(id, quantity, reason, notes);
        return ResponseEntity.ok(Map.of("message", "Stock added successfully"));
    }

    @PostMapping("/{id}/adjust-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adjustStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data) {
        Integer newQuantity = ((Number) data.get("newQuantity")).intValue();
        String reason = (String) data.get("reason");

        inventoryService.adjustStock(id, newQuantity, reason);
        return ResponseEntity.ok(Map.of("message", "Stock adjusted successfully"));
    }

    @PostMapping("/{id}/deduct-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> deductStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> deductData) {

        Integer quantity = deductData.get("quantityUsed") != null
                ? ((Number) deductData.get("quantityUsed")).intValue()
                : 0;

        @SuppressWarnings("unchecked")
        List<String> serialNumbers = (List<String>) deductData.get("serialNumbers");
        String reason = (String) deductData.get("reason");
        String notes = (String) deductData.get("notes");

        if (quantity <= 0 && (serialNumbers == null || serialNumbers.isEmpty())) {
            return ResponseEntity.badRequest().body("Quantity or serial numbers required");
        }

        inventoryService.deductStock(id, quantity, serialNumbers, reason, notes);
        return ResponseEntity.ok(Map.of("message", "Stock deducted successfully"));
    }

    @PostMapping("/{id}/deduct-for-jobcard")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> deductStockForJobCard(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data) {

        Integer quantity = ((Number) data.get("quantity")).intValue();
        @SuppressWarnings("unchecked")
        List<String> serialNumbers = (List<String>) data.get("serialNumbers");
        Long jobCardId = ((Number) data.get("jobCardId")).longValue();
        String jobCardNumber = (String) data.get("jobCardNumber");
        String notes = (String) data.get("notes");

        inventoryService.deductStockForJobCard(id, quantity, serialNumbers, jobCardId, jobCardNumber, notes);
        return ResponseEntity.ok(Map.of("message", "Stock deducted for job card"));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventoryItem>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<StockMovement>> getAllMovements() {
        return ResponseEntity.ok(inventoryService.getAllMovements());
    }

    @GetMapping("/movements/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<StockMovement>> getMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(inventoryService.getMovementsByDateRange(startDate, endDate));
    }

    @GetMapping("/{id}/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<StockMovement>> getMovementsByItem(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getMovementsByItem(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}