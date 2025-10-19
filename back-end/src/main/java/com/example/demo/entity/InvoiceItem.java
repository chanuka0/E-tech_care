//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.util.List;
//
//@Entity
//@Table(name = "invoice_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class InvoiceItem {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "invoice_id")
//    private Invoice invoice;
//
//    @ManyToOne
//    @JoinColumn(name = "inventory_item_id")
//    private InventoryItem inventoryItem;
//
//    private String itemName;
//    private Integer quantity;
//    private Double unitPrice;
//    private Double total;
//
//    @ElementCollection
//    private List<String> serialNumbers;
//}
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    private String itemName;
    private Integer quantity;
    private Double unitPrice;
    private Double total;

    // NEW: Warranty field
    @Column(length = 50)
    private String warranty; // "No Warranty", "7 days", "14 days", etc.

    @ElementCollection
    private List<String> serialNumbers;
}