package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @JoinColumn(name = "inventory_item_id" , nullable = false)
    @JsonBackReference
    private InventoryItem inventoryItem;

//    @ManyToOne
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    private InventoryItem inventoryItem;

    @Column(unique = true, nullable = false, length = 255)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private SerialStatus status;

    @Column(name = "sold_at")
    private LocalDateTime soldAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = SerialStatus.AVAILABLE;
        }
    }
    @Column(columnDefinition = "TEXT")
    private String notes;

}