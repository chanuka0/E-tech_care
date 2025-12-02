package com.example.demo.controller;

import com.example.demo.entity.InventorySerial;
import com.example.demo.entity.SerialStatus;
import com.example.demo.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/serials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SerialController {
    private final InventoryService inventoryService;

    /**
     * Mark serials as SOLD when invoice is paid - IMPROVED VERSION
     */
    @PostMapping("/mark-sold")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> markSerialsAsSold(@RequestBody Map<String, Object> data) {
        try {
            Long invoiceId = ((Number) data.get("invoiceId")).longValue();
            String invoiceNumber = (String) data.get("invoiceNumber");

            @SuppressWarnings("unchecked")
            List<String> serialNumbers = (List<String>) data.get("serialNumbers");

            if (serialNumbers == null || serialNumbers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No serial numbers provided"));
            }

            int successCount = 0;
            int failedCount = 0;
            List<String> failedSerials = new java.util.ArrayList<>();

            for (String serialNumber : serialNumbers) {
                try {
                    // Use the inventory service to mark as sold
                    InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
                    if (serial != null && (serial.getStatus() == SerialStatus.AVAILABLE || serial.getStatus() == SerialStatus.USED)) {
                        inventoryService.markSerialAsSold(serialNumber, invoiceId, invoiceNumber);
                        successCount++;
                    } else {
                        failedCount++;
                        failedSerials.add(serialNumber + " (Status: " + (serial != null ? serial.getStatus() : "NOT_FOUND") + ")");
                    }
                } catch (Exception e) {
                    failedCount++;
                    failedSerials.add(serialNumber + " (" + e.getMessage() + ")");
                }
            }

            Map<String, Object> response = Map.of(
                    "message", "Serial marking completed",
                    "successCount", successCount,
                    "failedCount", failedCount,
                    "failedSerials", failedSerials,
                    "invoiceId", invoiceId,
                    "invoiceNumber", invoiceNumber
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get serial by number
     */
    @GetMapping("/{serialNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InventorySerial> getSerialByNumber(@PathVariable String serialNumber) {
        InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);
        if (serial == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(serial);
    }

    /**
     * Check if serial is available
     */
    @GetMapping("/{serialNumber}/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> checkSerialAvailability(@PathVariable String serialNumber) {
        try {
            boolean isAvailable = inventoryService.isSerialAvailable(serialNumber);
            InventorySerial serial = inventoryService.getSerialByNumber(serialNumber);

            return ResponseEntity.ok(Map.of(
                    "available", isAvailable,
                    "serial", serial
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get USED serials by job card (for invoice creation)
     */
    @GetMapping("/job-card/{jobCardId}/used")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventorySerial>> getUsedSerialsByJobCard(@PathVariable Long jobCardId) {
        try {
            List<InventorySerial> usedSerials = inventoryService.getUsedSerialsByJobCard(jobCardId);
            return ResponseEntity.ok(usedSerials);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Get serials by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventorySerial>> getSerialsByStatus(@PathVariable String status) {
        try {
            SerialStatus serialStatus = SerialStatus.valueOf(status.toUpperCase());
            List<InventorySerial> serials = inventoryService.getSerialsByStatus(serialStatus);
            return ResponseEntity.ok(serials);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}