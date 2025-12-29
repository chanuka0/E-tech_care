



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

    /**
     * Check if a model can be permanently deleted
     */
    @GetMapping("/{id}/can-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> canDeleteModel(@PathVariable Long id) {
        try {
            boolean canDelete = modelService.canPermanentlyDelete(id);
            boolean isLinked = modelService.isModelLinkedToModelNumbers(id);

            Map<String, Object> response = new HashMap<>();
            response.put("canDelete", canDelete);
            response.put("isLinked", isLinked);
            response.put("modelId", id);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("canDelete", false);
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

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Model permanently deleted from database");
            response.put("deletionType", "permanent");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}