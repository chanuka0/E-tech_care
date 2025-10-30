//package com.example.demo.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "job_card_used_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class UsedItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "job_card_id", nullable = false)
//    @JsonIgnore
//    private JobCard jobCard;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "inventory_item_id", nullable = false)
//    private InventoryItem inventoryItem;
//
//    @Column(name = "quantity_used", nullable = false)
//    private Integer quantityUsed;
//
//    @Column(name = "unit_price")
//    private Double unitPrice;
//}
package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty; // ADD THIS
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_card_used_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonIgnore
    private JobCard jobCard;

    // IMPORTANT: Use EAGER fetch to load inventory details
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    @Column(name = "unit_price")
    private Double unitPrice;

    // Helper method to calculate total
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Double getTotal() {
        if (quantityUsed == null || unitPrice == null) {
            return 0.0;
        }
        return quantityUsed * unitPrice;
    }
}