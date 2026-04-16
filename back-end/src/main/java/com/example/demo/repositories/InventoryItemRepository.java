//package com.example.demo.repositories;
//
//import com.example.demo.entity.InventoryItem;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
//    Optional<InventoryItem> findBySku(String sku);
//
//    List<InventoryItem> findByCategory(String category);
//
//    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold")
//    List<InventoryItem> findLowStockItems();
//
//    @Query("SELECT i FROM InventoryItem i WHERE i.quantity = 0")
//    List<InventoryItem> findOutOfStockItems();
//
//    @Query("SELECT i FROM InventoryItem i WHERE i.name LIKE %:search% OR i.sku LIKE %:search% OR i.category LIKE %:search%")
//    List<InventoryItem> searchItems(@Param("search") String search);
//
//    @Query("SELECT DISTINCT i.category FROM InventoryItem i WHERE i.category IS NOT NULL")
//    List<String> findAllCategories();
//
//    // ✅ Visible items only (isHidden = false) — used by all active workflows
//    List<InventoryItem> findByIsHiddenFalse();
//
//    // ✅ Hidden items only — used by the Hidden Archive view
//    List<InventoryItem> findByIsHiddenTrue();
//
//    Boolean existsBySku(String sku);
//
//    Long countByHasSerialization(Boolean hasSerialization);
//
//    List<InventoryItem> findAllVisible();
//}


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

    boolean existsBySku(String sku);

    List<InventoryItem> findByCategory(String category);

    // ✅ NEW: Fetch only visible (non-hidden) items — used for all active workflows
    @Query("SELECT i FROM InventoryItem i WHERE i.isHidden = false ORDER BY i.createdAt DESC")
    List<InventoryItem> findAllVisible();

    // ✅ NEW: Fetch only hidden items — used for the Hidden Archive view
    @Query("SELECT i FROM InventoryItem i WHERE i.isHidden = true ORDER BY i.updatedAt DESC")
    List<InventoryItem> findAllHidden();

    // ✅ Low stock query — only visible items matter for alerts
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.minThreshold AND i.isHidden = false")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity = 0 AND i.isHidden = false")
    List<InventoryItem> findOutOfStockItems();

    @Query("SELECT DISTINCT i.category FROM InventoryItem i WHERE i.category IS NOT NULL AND i.isHidden = false")
    List<String> findAllCategories();

    @Query("SELECT i FROM InventoryItem i WHERE " +
            "(LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND i.isHidden = false")
    List<InventoryItem> searchItems(@Param("search") String search);

    Long countByHasSerialization(Boolean hasSerialization);

    // Count only visible items
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.isHidden = false")
    Long countVisible();

    // Count hidden items
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.isHidden = true")
    Long countHidden();
}