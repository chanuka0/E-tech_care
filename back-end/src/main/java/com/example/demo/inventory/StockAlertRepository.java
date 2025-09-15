package com.example.demo.inventory;

import com.example.demo.inventory.StockAlert;

//package com.example.demo.inventory.repository;  // <-- if this is the package

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {

    List<StockAlert> findByIsResolvedFalseOrderByCreatedDateDesc();

    List<StockAlert> findByInventoryItem_ItemIdAndIsResolvedFalse(Long itemId);

    @Query("SELECT sa FROM StockAlert sa WHERE sa.isResolved = false AND sa.alertLevel IN ('OUT_OF_STOCK', 'CRITICAL')")
    List<StockAlert> findCriticalAlerts();

    Long countByIsResolvedFalse();
}
