//package com.example.demo.repositories;
//
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.PaymentStatus;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.time.LocalDateTime;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
//    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
//
//    List<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
//
//    List<Invoice> findByPaymentStatus(PaymentStatus status);
//
//    List<Invoice> findByJobCardId(Long jobCardId);
//
//    List<Invoice> findByCustomerPhone(String phone);
//
//    // ✅ FIXED: Get revenue ONLY from PAID invoices (use fullyPaidDate instead of createdAt)
//    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.paymentStatus = 'PAID' AND i.fullyPaidDate BETWEEN :start AND :end")
//    Double getTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    @Query("SELECT SUM(i.paidAmount) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end")
//    Double getTotalPaidAmount(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end")
//    Long countInvoicesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    @Query("SELECT i FROM Invoice i WHERE i.customerName LIKE %:search% OR i.invoiceNumber LIKE %:search%")
//    List<Invoice> searchInvoices(@Param("search") String search);
//
//    @Query("SELECT SUM(i.balance) FROM Invoice i WHERE i.paymentStatus != 'PAID'")
//    Double getTotalOutstanding();
//
//    @Query("SELECT i FROM Invoice i WHERE i.jobCard.id = :jobCardId AND i.isDeleted = false")
//    Optional<Invoice> findByJobCardIdAndIsDeletedFalse(@Param("jobCardId") Long jobCardId);
//
//    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.jobCard.id = :jobCardId AND i.isDeleted = false")
//    boolean existsByJobCardIdAndIsDeletedFalse(@Param("jobCardId") Long jobCardId);
//
//    // ✅ NEW: Get PAID invoices by date range (for income reports)
//    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus = 'PAID' AND i.fullyPaidDate BETWEEN :start AND :end ORDER BY i.fullyPaidDate DESC")
//    List<Invoice> findPaidInvoicesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    // ✅ NEW: Get invoices with payment tracking
//    @Query("SELECT i FROM Invoice i WHERE i.fullyPaidDate BETWEEN :start AND :end ORDER BY i.fullyPaidDate DESC")
//    List<Invoice> findInvoicesWithPaymentByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
//
//    // ✅ NEW: Get PAID invoices for a specific date (for daily details)
//    @Query("SELECT i FROM Invoice i WHERE i.paymentStatus = 'PAID' " +
//            "AND FUNCTION('DATE', i.fullyPaidDate) = :date " +
//            "ORDER BY i.fullyPaidDate DESC")
//    List<Invoice> findPaidInvoicesByDate(@Param("date") LocalDate date);
//
//    // NEW: Find invoices by job card IDs
//    @Query("SELECT i FROM Invoice i WHERE i.jobCard.id IN :jobCardIds")
//    List<Invoice> findByJobCardIdIn(@Param("jobCardIds") List<Long> jobCardIds);
//
//    @Query("SELECT i FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate")
//    List<Invoice> findByDateRange(@Param("startDate") LocalDateTime startDate,
//                                  @Param("endDate") LocalDateTime endDate);
//
//    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate")
//    Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
//                                      @Param("endDate") LocalDateTime endDate);
//
//    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.paymentStatus = 'PAID'")
//    Double getTotalPaidAmount();
//
//    @Query("SELECT COALESCE(SUM(i.balance), 0) FROM Invoice i WHERE i.paymentStatus IN ('UNPAID', 'PARTIALLY_PAID')")
//    Double getTotalOutstandingBalance();
//
//    Long countByPaymentStatus(PaymentStatus paymentStatus);
//
//
//}

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