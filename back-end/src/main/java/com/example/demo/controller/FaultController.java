
package com.example.demo.controller;

import com.example.demo.entity.Fault;
import com.example.demo.service.FaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faults")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaultController {
    private final FaultService faultService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFault(@RequestBody Fault fault) {
        try {
            Fault createdFault = faultService.createFault(fault);
            return ResponseEntity.ok(createdFault);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Fault>> getAllFaults() {
        return ResponseEntity.ok(faultService.getAllActiveFaults());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fault>> getAllFaultsForAdmin() {
        return ResponseEntity.ok(faultService.getAllFaults());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Fault> getFaultById(@PathVariable Long id) {
        return ResponseEntity.ok(faultService.getFaultById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFault(@PathVariable Long id, @RequestBody Fault fault) {
        try {
            Fault updatedFault = faultService.updateFault(id, fault);
            return ResponseEntity.ok(updatedFault);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFault(@PathVariable Long id) {
        faultService.deleteFault(id);
        return ResponseEntity.ok().build();
    }
}