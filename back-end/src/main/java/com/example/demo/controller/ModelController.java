package com.example.demo.controller;


import com.example.demo.entity.Model;
import com.example.demo.services.ModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/models")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ModelController {

    private final ModelService modelService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Model> createModel(@RequestBody Model model) {
        return ResponseEntity.ok(modelService.createModel(model));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Model>> getAllModels() {
        return ResponseEntity.ok(modelService.getAllModels());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Model> getModelById(@PathVariable Long id) {
        return ResponseEntity.ok(modelService.getModelById(id));
    }

    @GetMapping("/brand/{brandId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Model>> getModelsByBrandId(@PathVariable Long brandId) {
        return ResponseEntity.ok(modelService.getModelsByBrandId(brandId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Model> updateModel(@PathVariable Long id, @RequestBody Model model) {
        return ResponseEntity.ok(modelService.updateModel(id, model));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        modelService.deleteModel(id);
        return ResponseEntity.ok().build();
    }
}