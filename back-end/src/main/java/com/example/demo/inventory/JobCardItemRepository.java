package com.example.demo.inventory;
import com.example.demo.inventory.JobCardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobCardItemRepository extends JpaRepository<JobCardItem, Long> {

    List<JobCardItem> findByJobCard_Id(Long jobCardId);

    List<JobCardItem> findByInventoryItem_ItemId(Long inventoryItemId);

    @Query("SELECT ji FROM JobCardItem ji WHERE ji.addedDate BETWEEN :startDate AND :endDate")
    List<JobCardItem> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(ji.totalPrice) FROM JobCardItem ji WHERE ji.jobCard.id = :jobCardId")
    java.math.BigDecimal calculateTotalForJobCard(@Param("jobCardId") Long jobCardId);

    @Query("SELECT SUM(ji.quantityUsed) FROM JobCardItem ji WHERE ji.inventoryItem.itemId = :itemId")
    Integer getTotalQuantityUsedForItem(@Param("itemId") Long itemId);
}