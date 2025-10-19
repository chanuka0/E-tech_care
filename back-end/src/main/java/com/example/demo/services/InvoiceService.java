//package com.example.demo.services;
//
////package com.etechcare.service;
////
////import com.etechcare.entity.*;
////import com.etechcare.repository.*;
//import com.example.demo.entity.*;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class InvoiceService {
//    private final InvoiceRepository invoiceRepository;
//    private final InventoryService inventoryService;
//    private final JobCardRepository jobCardRepository;
//    private final NotificationService notificationService;
//
//    @Transactional
//    public Invoice createInvoice(Invoice invoice) {
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//        invoice.setCreatedAt(LocalDateTime.now());
//
//        // Calculate totals
//        double subtotal = invoice.getItems().stream()
//                .mapToDouble(InvoiceItem::getTotal)
//                .sum();
//
//        invoice.setSubtotal(subtotal);
//        invoice.setTotal(subtotal - invoice.getDiscount() + invoice.getTax());
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//
//        // Determine payment status
//        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        Invoice saved = invoiceRepository.save(invoice);
//
//        // Deduct stock for each item
//        for (InvoiceItem item : saved.getItems()) {
//            inventoryService.deductStock(
//                    item.getInventoryItem().getId(),
//                    item.getQuantity(),
//                    item.getSerialNumbers()
//            );
//        }
//
//        // Update job card if linked
//        if (saved.getJobCard() != null) {
//            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
//                    .orElseThrow(() -> new RuntimeException("Job card not found"));
//            jobCard.setStatus(JobStatus.DELIVERED);
//            jobCardRepository.save(jobCard);
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Invoice created: " + saved.getInvoiceNumber(),
//                saved
//        );
//
//        return saved;
//    }
//
//    @Transactional
//    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//        invoice.setPaymentMethod(method);
//
//        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        }
//
//        return invoiceRepository.save(invoice);
//    }
//
//    public List<Invoice> getAllInvoices() {
//        return invoiceRepository.findAll();
//    }
//
//    public Invoice getInvoiceById(Long id) {
//        return invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//    }
//
//    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//        return invoiceRepository.findByCreatedAtBetween(start, end);
//    }
//
//    private String generateInvoiceNumber() {
//        return "INV-" + System.currentTimeMillis();
//    }
//}
package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

        // DEDUCT STOCK ONLY WHEN INVOICE IS SAVED
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

    @Transactional
    public void deleteInvoice(Long invoiceId, Long userId, String reason) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Mark as deleted instead of actual delete
        invoice.setIsDeleted(true);
        invoice.setDeletedBy(userId);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletionReason(reason);

        invoiceRepository.save(invoice);

        // RESTORE STOCK when invoice is deleted
        for (InvoiceItem item : invoice.getItems()) {
            if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                // Restore serialized items
                for (String serial : item.getSerialNumbers()) {
                    // Mark serial as AVAILABLE again in inventory
                }
            } else {
                // Restore quantity
                InventoryItem invItem = item.getInventoryItem();
                invItem.setQuantity(invItem.getQuantity() + item.getQuantity());
                // inventoryItemRepository.save(invItem); - handled in service
            }
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_DELETED,
                "Invoice deleted: " + invoice.getInvoiceNumber(),
                invoice
        );
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()))
                .collect(Collectors.toList());
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()))
                .collect(Collectors.toList());
    }

    // NEW: Search by job card number
    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
        return invoiceRepository.findAll().stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()) &&
                        inv.getJobCard() != null &&
                        inv.getJobCard().getJobNumber().contains(jobCardNumber))
                .collect(Collectors.toList());
    }

    // NEW: Search by customer name or invoice number
    public List<Invoice> searchByCustomerOrInvoice(String searchTerm) {
        String term = searchTerm.toLowerCase();
        return invoiceRepository.findAll().stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()) &&
                        (inv.getCustomerName().toLowerCase().contains(term) ||
                                inv.getInvoiceNumber().toLowerCase().contains(term)))
                .collect(Collectors.toList());
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }
}