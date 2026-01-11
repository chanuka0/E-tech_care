//package com.example.demo.controller;
//
//import com.example.demo.entity.Processor;
//import com.example.demo.service.ProcessorService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/processors")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class ProcessorController {
//    private final ProcessorService processorService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> createProcessor(@RequestBody Processor processor) {
//        try {
//            Processor created = processorService.createProcessor(processor);
//            return ResponseEntity.ok(created);
//        } catch (RuntimeException e) {
//            Map<String, String> errorResponse = new HashMap<>();
//            errorResponse.put("error", e.getMessage());
//            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
//        }
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Processor>> getAllProcessors() {
//        return ResponseEntity.ok(processorService.getAllProcessors());
//    }
//
//    @GetMapping("/active")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Processor>> getAllActiveProcessors() {
//        return ResponseEntity.ok(processorService.getAllActiveProcessors());
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<?> getProcessorById(@PathVariable Long id) {
//        try {
//            Processor processor = processorService.getProcessorById(id);
//            return ResponseEntity.ok(processor);
//        } catch (RuntimeException e) {
//            Map<String, String> errorResponse = new HashMap<>();
//            errorResponse.put("error", e.getMessage());
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
//        }
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> updateProcessor(@PathVariable Long id, @RequestBody Processor processor) {
//        try {
//            Processor updated = processorService.updateProcessor(id, processor);
//            return ResponseEntity.ok(updated);
//        } catch (RuntimeException e) {
//            Map<String, String> errorResponse = new HashMap<>();
//            errorResponse.put("error", e.getMessage());
//
//            // Check if it's a duplicate error or not found error
//            if (e.getMessage().contains("already exists")) {
//                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
//            } else {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
//            }
//        }
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> deleteProcessor(@PathVariable Long id) {
//        try {
//            processorService.deleteProcessor(id);
//
//            Map<String, String> successResponse = new HashMap<>();
//            successResponse.put("message", "Processor deleted permanently");
//
//            return ResponseEntity.ok(successResponse);
//        } catch (RuntimeException e) {
//            Map<String, String> errorResponse = new HashMap<>();
//            errorResponse.put("error", e.getMessage());
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
//        }
//    }
//}





package com.example.demo.controller;

import com.example.demo.entity.Processor;
import com.example.demo.service.ProcessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/processors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProcessorController {
    private final ProcessorService processorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProcessor(@RequestBody Processor processor) {
        try {
            Processor created = processorService.createProcessor(processor);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Processor>> getAllProcessors() {
        return ResponseEntity.ok(processorService.getAllProcessors());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Processor>> getAllActiveProcessors() {
        return ResponseEntity.ok(processorService.getAllActiveProcessors());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getProcessorById(@PathVariable Long id) {
        try {
            Processor processor = processorService.getProcessorById(id);
            return ResponseEntity.ok(processor);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProcessor(@PathVariable Long id, @RequestBody Processor processor) {
        try {
            Processor updated = processorService.updateProcessor(id, processor);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());

            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
        }
    }

    // ✅ NEW ENDPOINT: Toggle processor status (Activate/Deactivate)
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleProcessorStatus(@PathVariable Long id) {
        try {
            Processor updated = processorService.toggleProcessorStatus(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Processor status updated successfully");
            response.put("processor", updated);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProcessor(@PathVariable Long id) {
        try {
            processorService.deleteProcessor(id);

            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Processor deleted permanently");

            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}