package com.example.demo.inventory;
import com.example.demo.job_card.JobCard;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_card_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantityUsed;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice; // Price at the time of use (may differ from current selling price)

    @Column(precision = 10, scale = 2)
    private BigDecimal totalPrice; // quantityUsed * unitPrice

    private String notes;

    private LocalDateTime addedDate = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (quantityUsed != null && unitPrice != null) {
            totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantityUsed));
        }
    }
}