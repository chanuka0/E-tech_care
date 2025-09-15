package com.example.demo.inventory;

import com.example.demo.inventory.InventoryItem;
import com.example.demo.inventory.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByIsActiveTrueOrderByNameAsc();

    List<InventoryItem> findByCategoryAndIsActiveTrueOrderByNameAsc(ItemCategory category);

    @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= i.thresholdLevel AND i.isActive = true")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= 0 AND i.isActive = true")
    List<InventoryItem> findOutOfStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE " +
            "(LOWER(i.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND i.isActive = true")
    List<InventoryItem> searchItems(@Param("searchTerm") String searchTerm);

    Optional<InventoryItem> findBySkuIgnoreCaseAndIsActiveTrue(String sku);

    @Query("SELECT SUM(i.stockQuantity * i.purchasePrice) FROM InventoryItem i WHERE i.isActive = true")
    java.math.BigDecimal calculateTotalInventoryValue();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.isActive = true")
    Long countActiveItems();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.stockQuantity <= i.thresholdLevel AND i.isActive = true")
    Long countLowStockItems();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.stockQuantity <= 0 AND i.isActive = true")
    Long countOutOfStockItems();
}

