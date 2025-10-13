package com.example.demo.repositories;


import com.example.demo.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoiceId(Long invoiceId);

    @Query("SELECT ii FROM InvoiceItem ii WHERE ii.invoice.createdAt BETWEEN :start AND :end")
    List<InvoiceItem> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT ii.itemName, SUM(ii.quantity) as totalQty FROM InvoiceItem ii GROUP BY ii.itemName ORDER BY totalQty DESC")
    List<Object[]> findTopSellingItems();
}
