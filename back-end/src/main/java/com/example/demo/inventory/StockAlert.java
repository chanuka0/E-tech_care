package com.example.demo.inventory;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(nullable = false)
    private Integer currentStock;

    @Column(nullable = false)
    private Integer thresholdLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertLevel alertLevel;

    @Column(nullable = false)
    private Boolean isResolved = false;

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime resolvedDate;

    public enum AlertLevel {
        LOW_STOCK("Low Stock"),
        OUT_OF_STOCK("Out of Stock"),
        CRITICAL("Critical");

        private final String displayName;

        AlertLevel(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}