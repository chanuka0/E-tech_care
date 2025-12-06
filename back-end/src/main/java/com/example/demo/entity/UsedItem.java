
package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "used_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonBackReference
    private JobCard jobCard;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "warranty_period")
    private String warrantyPeriod;

    // Store the serial numbers used for this item
    @ElementCollection
    @CollectionTable(name = "used_item_serials", joinColumns = @JoinColumn(name = "used_item_id"))
    @Column(name = "serial_number")
    private List<String> usedSerialNumbers = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (warrantyPeriod == null) {
            warrantyPeriod = "No Warranty";
        }
    }
}