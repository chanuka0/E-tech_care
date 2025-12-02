package com.example.demo.controller;

import com.example.demo.entity.Processor;
import com.example.demo.service.ProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProcessorController {
    private final ProcessorService processorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Processor> createProcessor(@RequestBody Processor processor) {
        return ResponseEntity.ok(processorService.createProcessor(processor));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Processor>> getAllProcessors() {
        return ResponseEntity.ok(processorService.getAllActiveProcessors());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Processor> getProcessorById(@PathVariable Long id) {
        return ResponseEntity.ok(processorService.getProcessorById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Processor> updateProcessor(@PathVariable Long id, @RequestBody Processor processor) {
        return ResponseEntity.ok(processorService.updateProcessor(id, processor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcessor(@PathVariable Long id) {
        processorService.deleteProcessor(id);
        return ResponseEntity.ok().build();
    }
}