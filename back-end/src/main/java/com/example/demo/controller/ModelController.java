//
//
//package com.example.demo.controller;
//
//import com.example.demo.entity.Model;
//import com.example.demo.service.ModelService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/models")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class ModelController {
//    private final ModelService modelService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Model> createModel(@RequestBody Model model) {
//        return ResponseEntity.ok(modelService.createModel(model));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Model>> getAllModels() {
//        return ResponseEntity.ok(modelService.getAllActiveModels());
//    }
//
//    @GetMapping("/by-brand/{brandId}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Model>> getModelsByBrand(@PathVariable Long brandId) {
//        return ResponseEntity.ok(modelService.getModelsByBrandId(brandId));
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Model> getModelById(@PathVariable Long id) {
//        return ResponseEntity.ok(modelService.getModelById(id));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Model> updateModel(@PathVariable Long id, @RequestBody Model model) {
//        return ResponseEntity.ok(modelService.updateModel(id, model));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
//        modelService.deleteModel(id);
//        return ResponseEntity.ok().build();
//    }
//}




package com.example.demo.controller;

import com.example.demo.entity.Model;
import com.example.demo.service.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/models")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ModelController {
    private final ModelService modelService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createModel(@RequestBody Model model) {
        try {
            Model createdModel = modelService.createModel(model);
            return ResponseEntity.ok(createdModel);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Model>> getAllModels() {
        return ResponseEntity.ok(modelService.getAllActiveModels());
    }

    @GetMapping("/by-brand/{brandId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Model>> getModelsByBrand(@PathVariable Long brandId) {
        return ResponseEntity.ok(modelService.getModelsByBrandId(brandId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getModelById(@PathVariable Long id) {
        try {
            Model model = modelService.getModelById(id);
            return ResponseEntity.ok(model);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateModel(@PathVariable Long id, @RequestBody Model model) {
        try {
            Model updatedModel = modelService.updateModel(id, model);
            return ResponseEntity.ok(updatedModel);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteModel(@PathVariable Long id) {
        try {
            modelService.deleteModel(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}