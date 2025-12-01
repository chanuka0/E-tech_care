
package com.example.demo.controller;

import com.example.demo.entity.ServiceCategory;
import com.example.demo.services.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/service-categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceCategoryController {
    private final ServiceCategoryService serviceCategoryService;

    /**
     * Get all service categories
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN', 'USER')")
    public ResponseEntity<List<ServiceCategory>> getAllServiceCategories() {
        return ResponseEntity.ok(serviceCategoryService.getAllServiceCategories());
    }

    /**
     * Get service categories by status
     * @param status true for active, false for inactive
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ServiceCategory>> getServiceCategoriesByStatus(@PathVariable Boolean status) {
        return ResponseEntity.ok(serviceCategoryService.getServiceCategoriesByStatus(status));
    }

    /**
     * Get only active service categories (Available for all authenticated users)
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ServiceCategory>> getActiveServiceCategories() {
        return ResponseEntity.ok(serviceCategoryService.getActiveServiceCategories());
    }

    /**
     * Get only inactive service categories (Admin only)
     */
    @GetMapping("/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceCategory>> getInactiveServiceCategories() {
        return ResponseEntity.ok(serviceCategoryService.getInactiveServiceCategories());
    }

    /**
     * Get service category by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ServiceCategory> getServiceCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceCategoryService.getServiceCategoryById(id));
    }

    /**
     * Create new service category (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createServiceCategory(@Valid @RequestBody ServiceCategory serviceCategory) {
        try {
            ServiceCategory created = serviceCategoryService.createServiceCategory(serviceCategory);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update service category (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateServiceCategory(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCategory updates) {
        try {
            ServiceCategory updated = serviceCategoryService.updateServiceCategory(id, updates);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Toggle service category active status (Admin only)
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleServiceCategory(@PathVariable Long id) {
        try {
            ServiceCategory toggled = serviceCategoryService.toggleServiceCategory(id);
            return ResponseEntity.ok(toggled);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete service category (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteServiceCategory(@PathVariable Long id) {
        try {
            serviceCategoryService.deleteServiceCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper class for error responses
    static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}