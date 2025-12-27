//package com.example.demo.controller;
//
//import com.example.demo.entity.ModelNumber;
//import com.example.demo.service.ModelNumberService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/model-numbers")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class ModelNumberController {
//    private final ModelNumberService modelNumberService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ModelNumber> createModelNumber(@RequestBody ModelNumber modelNumber) {
//        return ResponseEntity.ok(modelNumberService.createModelNumber(modelNumber));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<ModelNumber>> getAllModelNumbers() {
//        return ResponseEntity.ok(modelNumberService.getAllActiveModelNumbers());
//    }
//
//    @GetMapping("/by-model/{modelId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<ModelNumber>> getModelNumbersByModel(@PathVariable Long modelId) {
//        return ResponseEntity.ok(modelNumberService.getModelNumbersByModelId(modelId));
//    }
//
//
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<ModelNumber> getModelNumberById(@PathVariable Long id) {
//        return ResponseEntity.ok(modelNumberService.getModelNumberById(id));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ModelNumber> updateModelNumber(@PathVariable Long id, @RequestBody ModelNumber modelNumber) {
//        return ResponseEntity.ok(modelNumberService.updateModelNumber(id, modelNumber));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteModelNumber(@PathVariable Long id) {
//        modelNumberService.deleteModelNumber(id);
//        return ResponseEntity.ok().build();
//    }
//}



package com.example.demo.controller;

import com.example.demo.entity.ModelNumber;
import com.example.demo.service.ModelNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/model-numbers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ModelNumberController {
    private final ModelNumberService modelNumberService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createModelNumber(@RequestBody ModelNumber modelNumber) {
        try {
            ModelNumber created = modelNumberService.createModelNumber(modelNumber);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ModelNumber>> getAllModelNumbers() {
        return ResponseEntity.ok(modelNumberService.getAllActiveModelNumbers());
    }

    @GetMapping("/by-model/{modelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ModelNumber>> getModelNumbersByModel(@PathVariable Long modelId) {
        return ResponseEntity.ok(modelNumberService.getModelNumbersByModelId(modelId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ModelNumber> getModelNumberById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(modelNumberService.getModelNumberById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateModelNumber(@PathVariable Long id, @RequestBody ModelNumber modelNumber) {
        try {
            ModelNumber updated = modelNumberService.updateModelNumber(id, modelNumber);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteModelNumber(@PathVariable Long id) {
        try {
            modelNumberService.deleteModelNumber(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Model number deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}