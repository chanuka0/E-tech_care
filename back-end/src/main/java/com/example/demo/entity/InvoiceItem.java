////package com.example.demo.entity;
////
////import jakarta.persistence.*;
////import lombok.AllArgsConstructor;
////import lombok.Data;
////import lombok.NoArgsConstructor;
////
////import java.util.List;
////
////@Entity
////@Table(name = "invoice_items")
////@Data
////@NoArgsConstructor
////@AllArgsConstructor
////public class InvoiceItem {
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    @ManyToOne
////    @JoinColumn(name = "invoice_id")
////    private Invoice invoice;
////
////    @ManyToOne
////    @JoinColumn(name = "inventory_item_id")
////    private InventoryItem inventoryItem;
////
////    private String itemName;
////    private Integer quantity;
////    private Double unitPrice;
////    private Double total;
////
////    @ElementCollection
////    private List<String> serialNumbers;
////}
//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
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
//    // NEW: Warranty field
//    @Column(length = 50)
//    private String warranty; // "No Warranty", "7 days", "14 days", etc.
//
//    @ElementCollection
//    private List<String> serialNumbers;
//}

package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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

    // IMPORTANT: Use EAGER fetch so items are always loaded
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "total")
    private Double total;

    // Warranty field
    @Column(name = "warranty", length = 50)
    private String warranty;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_item_serials", joinColumns = @JoinColumn(name = "invoice_item_id"))
    @Column(name = "serial_number")
    private List<String> serialNumbers;

    @Column
    private String itemType;
}