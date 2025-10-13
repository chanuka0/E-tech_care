package com.example.demo.repositories;


import com.example.demo.entity.DamagedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DamagedItemRepository extends JpaRepository<DamagedItem, Long> {
    List<DamagedItem> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<DamagedItem> findByInventoryItemId(Long itemId);

    List<DamagedItem> findByCreatedBy(Long userId);

    @Query("SELECT SUM(d.costImpact) FROM DamagedItem d WHERE d.createdAt BETWEEN :start AND :end")
    Double getTotalDamageCost(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(d) FROM DamagedItem d WHERE d.createdAt BETWEEN :start AND :end")
    Long countDamagedItemsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT d.inventoryItem.name, SUM(d.quantity) FROM DamagedItem d GROUP BY d.inventoryItem.name ORDER BY SUM(d.quantity) DESC")
    List<Object[]> getMostDamagedItems();
}