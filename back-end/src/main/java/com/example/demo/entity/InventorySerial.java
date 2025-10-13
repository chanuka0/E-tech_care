package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_serials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySerial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    @Column(unique = true)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    private SerialStatus status; // AVAILABLE, SOLD, DAMAGED

    private LocalDateTime soldAt;
}