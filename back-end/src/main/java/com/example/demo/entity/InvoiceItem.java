
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    // ✅ NEW: Item code (SKU) - shown on invoice
    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "total")
    private Double total;

    // Warranty period (e.g., "1 year", "6 months")
    @Column(name = "warranty", length = 50)
    private String warranty;

    // ✅ NEW: Warranty number (manual input, 4-5 digits)
    @Column(name = "warranty_number", length = 10)
    private String warrantyNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_item_serials", joinColumns = @JoinColumn(name = "invoice_item_id"))
    @Column(name = "serial_number")
    private List<String> serialNumbers;

    @Column
    private String itemType; // SERVICE, PART, CANCELLATION_FEE
}