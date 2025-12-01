package com.example.demo.repositories;

import com.example.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(Long invoiceId);
    List<Payment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.invoice.id = :invoiceId")
    Double getTotalPaidAmountByInvoiceId(@Param("invoiceId") Long invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.invoice.id = :invoiceId ORDER BY p.paymentDate ASC")
    List<Payment> findFirstPaymentByInvoiceId(@Param("invoiceId") Long invoiceId);
}