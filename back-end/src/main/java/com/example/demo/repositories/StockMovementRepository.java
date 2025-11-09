package com.example.demo.repositories;

import com.example.demo.entity.StockMovement;
import com.example.demo.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByInventoryItemId(Long itemId);

    List<StockMovement> findByMovementType(MovementType type);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMovement> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.inventoryItem.id = :itemId AND sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMovement> findByItemAndDateRange(@Param("itemId") Long itemId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.referenceType = :refType AND sm.referenceId = :refId")
    List<StockMovement> findByReference(@Param("refType") String referenceType,
                                        @Param("refId") Long referenceId);

    List<StockMovement> findBySerialNumber(String serialNumber);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.inventoryItem.name LIKE %:search% OR sm.inventoryItem.sku LIKE %:search% OR sm.serialNumber LIKE %:search% OR sm.referenceNumber LIKE %:search%")
    List<StockMovement> searchMovements(@Param("search") String search);
}