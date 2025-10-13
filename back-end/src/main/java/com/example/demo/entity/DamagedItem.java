package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "damaged_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DamagedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    private String serialNumber;
    private Integer quantity;
    private String reason;
    private Double costImpact;

    private Long createdBy;
    private LocalDateTime createdAt;
}