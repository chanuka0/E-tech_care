package com.example.demo.services;

//package com.etechcare.service;
//
//import com.etechcare.entity.*;
//import com.etechcare.repository.*;
import com.example.demo.entity.*;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final InventoryService inventoryService;
    private final JobCardRepository jobCardRepository;
    private final NotificationService notificationService;

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCreatedAt(LocalDateTime.now());

        // Calculate totals
        double subtotal = invoice.getItems().stream()
                .mapToDouble(InvoiceItem::getTotal)
                .sum();

        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal - invoice.getDiscount() + invoice.getTax());
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());

        // Determine payment status
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        Invoice saved = invoiceRepository.save(invoice);

        // Deduct stock for each item
        for (InvoiceItem item : saved.getItems()) {
            inventoryService.deductStock(
                    item.getInventoryItem().getId(),
                    item.getQuantity(),
                    item.getSerialNumbers()
            );
        }

        // Update job card if linked
        if (saved.getJobCard() != null) {
            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
                    .orElseThrow(() -> new RuntimeException("Job card not found"));
            jobCard.setStatus(JobStatus.DELIVERED);
            jobCardRepository.save(jobCard);
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created: " + saved.getInvoiceNumber(),
                saved
        );

        return saved;
    }

    @Transactional
    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
        invoice.setPaymentMethod(method);

        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        }

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByCreatedAtBetween(start, end);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}