package com.example.demo.inventory;

//import com.example.demo.invoice.Invoice;
//import com.example.demo.invoice.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByJobCard_Id(Long jobCardId);

    List<Invoice> findByStatus(InvoiceStatus status);

    List<Invoice> findByCreatedBy_UserId(Integer userId);

    @Query("SELECT i FROM Invoice i WHERE i.createdDate BETWEEN :startDate AND :endDate ORDER BY i.createdDate DESC")
    List<Invoice> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM Invoice i WHERE " +
            "(LOWER(i.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.customerContact) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Invoice> searchInvoices(@Param("searchTerm") String searchTerm);

    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, 4) AS integer)) FROM Invoice i WHERE i.invoiceNumber LIKE 'INV%'")
    Integer findMaxInvoiceNumber();

//    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND DATE(i.createdDate) = DATE(:date)")
//    java.math.BigDecimal calculateDailySales(@Param("date") LocalDateTime date);


    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND DATE(i.createdDate) = DATE(:date)")
    BigDecimal calculateDailySales(@Param("date") LocalDateTime date);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND YEAR(i.createdDate) = :year AND MONTH(i.createdDate) = :month")
    BigDecimal calculateMonthlySales(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'PENDING'")
    Long countPendingInvoices();

    List<Invoice> findTop10ByOrderByCreatedDateDesc();


//    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND " +
//            "YEAR(i.createdDate) = :year AND MONTH(i.createdDate) = :month")
//    java.math.BigDecimal calculateMonthlySales(@Param("year") int year, @Param("month") int month);
//
//    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'PENDING'")
//    Long countPendingInvoices();
//
//    List<Invoice> findTop10ByOrderByCreatedDateDesc();
//}
}