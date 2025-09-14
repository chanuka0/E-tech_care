package com.example.demo.laptopBrand;
//import com.example.demo.dtos.LaptopBrandRequest;
//import com.example.demo.dtos.LaptopBrandResponse;
//import com.example.demo.services.LaptopBrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/laptop-brands")
@RequiredArgsConstructor
public class LaptopBrandController {

    private final LaptopBrandService laptopBrandService;

    @GetMapping("/active")
    public ResponseEntity<List<LaptopBrand.LaptopBrandResponse>> getActiveBrands() {
        try {
            return ResponseEntity.ok(laptopBrandService.getAllActiveBrands());
        } catch (Exception e) {
            log.error("Error fetching active brands", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<LaptopBrand.LaptopBrandResponse>> getAllBrands() {
        try {
            return ResponseEntity.ok(laptopBrandService.getAllBrands());
        } catch (Exception e) {
            log.error("Error fetching all brands", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createBrand(@RequestBody LaptopBrandRequest request) {
        try {
            LaptopBrand.LaptopBrandResponse response = laptopBrandService.createBrand(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating brand", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @RequestBody LaptopBrandRequest request) {
        try {
            LaptopBrand.LaptopBrandResponse response = laptopBrandService.updateBrand(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating brand", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        try {
            laptopBrandService.deleteBrand(id);
            return ResponseEntity.ok(Map.of("message", "Brand deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting brand", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}