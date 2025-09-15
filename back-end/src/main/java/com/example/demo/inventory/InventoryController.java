package com.example.demo.inventory;


import com.example.demo.inventory.ItemCategory;
import com.example.demo.inventory.dto.*;
//import com.example.demo.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> getAllItems() {
        try {
            return ResponseEntity.ok(inventoryService.getAllActiveItems());
        } catch (Exception e) {
            log.error("Error fetching inventory items", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        try {
            InventoryItemResponse response = inventoryService.getItemById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching inventory item with id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<InventoryItemResponse>> getItemsByCategory(@PathVariable ItemCategory category) {
        try {
            return ResponseEntity.ok(inventoryService.getItemsByCategory(category));
        } catch (Exception e) {
            log.error("Error fetching items by category: {}", category, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<InventoryItemResponse>> searchItems(@RequestParam(required = false) String q) {
        try {
            return ResponseEntity.ok(inventoryService.searchItems(q));
        } catch (Exception e) {
            log.error("Error searching inventory items", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createItem(@Valid @RequestBody InventoryItemCreateRequest request) {
        try {
            InventoryItemResponse response = inventoryService.createItem(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating inventory item", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateItem(@PathVariable Long id,
                                        @Valid @RequestBody InventoryItemUpdateRequest request) {
        try {
            InventoryItemResponse response = inventoryService.updateItem(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating inventory item with id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stock/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStock(@Valid @RequestBody StockUpdateRequest request) {
        try {
            inventoryService.updateStock(request);
            return ResponseEntity.ok(Map.of("message", "Stock updated successfully"));
        } catch (Exception e) {
            log.error("Error updating stock", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemResponse>> getLowStockItems() {
        try {
            return ResponseEntity.ok(inventoryService.getLowStockItems());
        } catch (Exception e) {
            log.error("Error fetching low stock items", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryItemResponse>> getOutOfStockItems() {
        try {
            return ResponseEntity.ok(inventoryService.getOutOfStockItems());
        } catch (Exception e) {
            log.error("Error fetching out of stock items", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<StockAlertResponse>> getActiveAlerts() {
        try {
            return ResponseEntity.ok(inventoryService.getActiveAlerts());
        } catch (Exception e) {
            log.error("Error fetching stock alerts", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/alerts/{alertId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveAlert(@PathVariable Long alertId) {
        try {
            inventoryService.resolveAlert(alertId);
            return ResponseEntity.ok(Map.of("message", "Alert resolved successfully"));
        } catch (Exception e) {
            log.error("Error resolving alert", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        try {
            List<Map<String, String>> categories = java.util.Arrays.stream(ItemCategory.values())
                    .map(category -> Map.of(
                            "value", category.name(),
                            "label", category.getDisplayName()
                    ))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching categories", e);
            return ResponseEntity.badRequest().build();
        }
    }
}