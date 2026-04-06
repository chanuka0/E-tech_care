
package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Service category name cannot be blank")
    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "Service_Price", nullable = false)
    private Double servicePrice;

    // ✅ NEW: Special price for regular customers (null = no special price, use servicePrice)
    @Column(name = "special_service_price")
    private Double specialServicePrice;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.isActive == null) this.isActive = true;
        if (this.code == null || this.code.isBlank()) {
            this.code = this.name
                    .toUpperCase()
                    .replaceAll(" ", "_")
                    .replaceAll("[^A-Z0-9_]", "");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ Helper: returns special price if set, otherwise regular price
    public Double getEffectivePriceForRegularCustomer() {
        return (specialServicePrice != null && specialServicePrice > 0) ? specialServicePrice : servicePrice;
    }
}