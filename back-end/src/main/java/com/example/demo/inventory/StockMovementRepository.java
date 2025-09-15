package com.example.demo.inventory;
import com.example.demo.inventory.dto.JobCardItemResponse;
import com.example.demo.job_card.dto.JobCardResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByInventoryItem_ItemIdOrderByCreatedDateDesc(Long itemId);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdDate BETWEEN :startDate AND :endDate ORDER BY sm.createdDate DESC")
    List<StockMovement> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    List<StockMovement> findByMovementTypeOrderByCreatedDateDesc(StockMovement.MovementType movementType);

    @Data
    @EqualsAndHashCode(callSuper = true)
    class EnhancedJobCardResponse extends JobCardResponse {
        private List<JobCardItemResponse> items;
        private BigDecimal serviceCharge = BigDecimal.ZERO;
        private BigDecimal itemsTotal = BigDecimal.ZERO;
        private BigDecimal grandTotal = BigDecimal.ZERO;
        private String warrantyDetails;
        private Boolean hasInvoice = false;
        private Long invoiceId;

        @Data
        public static class JobCardCreateRequest {
            private String customerName;
            private String contactNumber;
            private String serialNumber;
            private String specialNote;
            private boolean withCharger;
            private Long laptopBrandId;
            private boolean oneDayService;
            private boolean advanceGiven;
            private BigDecimal advanceAmount;
            private BigDecimal totalAmount;
            private LocalDateTime expectedDeliveryDate;
        }
    }
}
