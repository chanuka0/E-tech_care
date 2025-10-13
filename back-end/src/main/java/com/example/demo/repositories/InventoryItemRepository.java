package com.example.demo.repositories;

import com.example.demo.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySku(String sku);

    List<InventoryItem> findByCategory(String category);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity = 0")
    List<InventoryItem> findOutOfStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.name LIKE %:search% OR i.sku LIKE %:search% OR i.category LIKE %:search%")
    List<InventoryItem> searchItems(@Param("search") String search);

    @Query("SELECT DISTINCT i.category FROM InventoryItem i WHERE i.category IS NOT NULL")
    List<String> findAllCategories();

    Boolean existsBySku(String sku);
}