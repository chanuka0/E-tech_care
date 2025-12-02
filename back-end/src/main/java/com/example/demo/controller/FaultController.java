package com.example.demo.controller;

import com.example.demo.entity.Fault;
import com.example.demo.service.FaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faults")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaultController {
    private final FaultService faultService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fault> createFault(@RequestBody Fault fault) {
        return ResponseEntity.ok(faultService.createFault(fault));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Fault>> getAllFaults() {
        return ResponseEntity.ok(faultService.getAllActiveFaults());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Fault> getFaultById(@PathVariable Long id) {
        return ResponseEntity.ok(faultService.getFaultById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fault> updateFault(@PathVariable Long id, @RequestBody Fault fault) {
        return ResponseEntity.ok(faultService.updateFault(id, fault));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFault(@PathVariable Long id) {
        faultService.deleteFault(id);
        return ResponseEntity.ok().build();
    }
}