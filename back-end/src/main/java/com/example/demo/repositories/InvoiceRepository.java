
package com.example.demo.repositories;

import com.example.demo.entity.Invoice;
import com.example.demo.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.jobCard.id = :jobCardId")
    Optional<Invoice> findByJobCardIdAndIsDeletedFalse(@Param("jobCardId") Long jobCardId);

    @Query("SELECT i FROM Invoice i WHERE i.jobCard.id IN :jobCardIds AND i.isDeleted = false")
    List<Invoice> findByJobCardIdIn(@Param("jobCardIds") List<Long> jobCardIds);

    // ✅ NEW: Find all invoices for a regular customer (by customerId field - includes direct invoices)
    @Query("SELECT i FROM Invoice i WHERE i.customerId = :customerId AND i.isDeleted = false ORDER BY i.createdAt DESC")
    List<Invoice> findByCustomerIdAndIsDeletedFalse(@Param("customerId") Long customerId);

    @Query("SELECT i FROM Invoice i WHERE " +
            "LOWER(i.customerName) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Invoice> searchInvoices(@Param("term") String term);

    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus = 'PAID' " +
            "AND i.fullyPaidDate BETWEEN :start AND :end AND i.isDeleted = false")
    List<Invoice> findPaidInvoicesByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query(value = "SELECT i.* FROM invoices i WHERE i.payment_status = 'PAID' " +
            "AND DATE(i.fully_paid_date) = :date AND i.is_deleted = false", nativeQuery = true)
    List<Invoice> findPaidInvoicesByDate(@Param("date") java.time.LocalDate date);

    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.paymentStatus = 'PAID' " +
            "AND i.fullyPaidDate BETWEEN :start AND :end AND i.isDeleted = false")
    Double getTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}