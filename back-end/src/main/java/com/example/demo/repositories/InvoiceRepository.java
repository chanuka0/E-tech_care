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

    List<Invoice> findByPaymentStatus(PaymentStatus status);

    List<Invoice> findByJobCardId(Long jobCardId);

    List<Invoice> findByCustomerPhone(String phone);


    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end")
    Double getTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(i.paidAmount) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end")
    Double getTotalPaidAmount(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end")
    Long countInvoicesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT i FROM Invoice i WHERE i.customerName LIKE %:search% OR i.invoiceNumber LIKE %:search%")
    List<Invoice> searchInvoices(@Param("search") String search);

    @Query("SELECT SUM(i.balance) FROM Invoice i WHERE i.paymentStatus != 'PAID'")
    Double getTotalOutstanding();
}

//package com.example.demo.repositories;
//
//import com.example.demo.entity.Invoice;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
//
//    List<Invoice> findByIsDeletedFalseOrIsDeletedNull();
//
//    List<Invoice> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
//
//    List<Invoice> findByJobCard_JobNumberContainingIgnoreCaseAndIsDeletedFalse(String jobCardNumber);
//
//    @Query("SELECT i FROM Invoice i WHERE " +
//            "(LOWER(i.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
//            "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
//            "(i.isDeleted = false OR i.isDeleted IS NULL)")
//    List<Invoice> searchByCustomerOrInvoice(@Param("searchTerm") String searchTerm);
//
//    @Query("SELECT i FROM Invoice i WHERE i.jobCard.id = :jobCardId AND (i.isDeleted = false OR i.isDeleted IS NULL)")
//    Optional<Invoice> findByJobCardIdAndIsDeletedFalse(@Param("jobCardId") Long jobCardId);
//
//    Double getTotalRevenue(LocalDateTime startOfDay, LocalDateTime endOfDay);
//}