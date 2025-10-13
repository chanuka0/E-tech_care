package com.example.demo.controller;


import com.example.demo.entity.DamagedItem;
import com.example.demo.services.DamagedItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DamagedItemController {
    private final DamagedItemService damagedItemService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<DamagedItem> recordDamage(@RequestBody DamagedItem damage) {
        return ResponseEntity.ok(damagedItemService.recordDamage(damage));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DamagedItem>> getAllDamagedItems() {
        return ResponseEntity.ok(damagedItemService.getAllDamagedItems());
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DamagedItem>> getDamagedItemsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(damagedItemService.getDamagedItemsByDateRange(start, end));
    }
}
