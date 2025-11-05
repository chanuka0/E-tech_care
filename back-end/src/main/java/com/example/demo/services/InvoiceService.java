//////package com.example.demo.services;
//////
////////package com.etechcare.service;
////////
////////import com.etechcare.entity.*;
////////import com.etechcare.repository.*;
//////import com.example.demo.entity.*;
//////import com.example.demo.repositories.InvoiceRepository;
//////import com.example.demo.repositories.JobCardRepository;
//////import lombok.RequiredArgsConstructor;
//////import org.springframework.stereotype.Service;
//////import org.springframework.transaction.annotation.Transactional;
//////import java.time.LocalDateTime;
//////import java.util.List;
//////
//////@Service
//////@RequiredArgsConstructor
//////public class InvoiceService {
//////    private final InvoiceRepository invoiceRepository;
//////    private final InventoryService inventoryService;
//////    private final JobCardRepository jobCardRepository;
//////    private final NotificationService notificationService;
//////
//////    @Transactional
//////    public Invoice createInvoice(Invoice invoice) {
//////        invoice.setInvoiceNumber(generateInvoiceNumber());
//////        invoice.setCreatedAt(LocalDateTime.now());
//////
//////        // Calculate totals
//////        double subtotal = invoice.getItems().stream()
//////                .mapToDouble(InvoiceItem::getTotal)
//////                .sum();
//////
//////        invoice.setSubtotal(subtotal);
//////        invoice.setTotal(subtotal - invoice.getDiscount() + invoice.getTax());
//////        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//////
//////        // Determine payment status
//////        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//////            invoice.setPaymentStatus(PaymentStatus.PAID);
//////        } else if (invoice.getPaidAmount() > 0) {
//////            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//////        } else {
//////            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//////        }
//////
//////        Invoice saved = invoiceRepository.save(invoice);
//////
//////        // Deduct stock for each item
//////        for (InvoiceItem item : saved.getItems()) {
//////            inventoryService.deductStock(
//////                    item.getInventoryItem().getId(),
//////                    item.getQuantity(),
//////                    item.getSerialNumbers()
//////            );
//////        }
//////
//////        // Update job card if linked
//////        if (saved.getJobCard() != null) {
//////            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
//////                    .orElseThrow(() -> new RuntimeException("Job card not found"));
//////            jobCard.setStatus(JobStatus.DELIVERED);
//////            jobCardRepository.save(jobCard);
//////        }
//////
//////        notificationService.sendNotification(
//////                NotificationType.INVOICE_CREATED,
//////                "Invoice created: " + saved.getInvoiceNumber(),
//////                saved
//////        );
//////
//////        return saved;
//////    }
//////
//////    @Transactional
//////    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//////        Invoice invoice = invoiceRepository.findById(invoiceId)
//////                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//////
//////        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
//////        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//////        invoice.setPaymentMethod(method);
//////
//////        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//////            invoice.setPaymentStatus(PaymentStatus.PAID);
//////        } else if (invoice.getPaidAmount() > 0) {
//////            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//////        }
//////
//////        return invoiceRepository.save(invoice);
//////    }
//////
//////    public List<Invoice> getAllInvoices() {
//////        return invoiceRepository.findAll();
//////    }
//////
//////    public Invoice getInvoiceById(Long id) {
//////        return invoiceRepository.findById(id)
//////                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//////    }
//////
//////    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//////        return invoiceRepository.findByCreatedAtBetween(start, end);
//////    }
//////
//////    private String generateInvoiceNumber() {
//////        return "INV-" + System.currentTimeMillis();
//////    }
//////}
////package com.example.demo.services;
////
////import com.example.demo.entity.*;
////import com.example.demo.repositories.InvoiceRepository;
////import com.example.demo.repositories.JobCardRepository;
////import lombok.RequiredArgsConstructor;
////import org.springframework.stereotype.Service;
////import org.springframework.transaction.annotation.Transactional;
////import java.time.LocalDateTime;
////import java.util.List;
////import java.util.stream.Collectors;
////
////@Service
////@RequiredArgsConstructor
////public class InvoiceService {
////    private final InvoiceRepository invoiceRepository;
////    private final InventoryService inventoryService;
////    private final JobCardRepository jobCardRepository;
////    private final NotificationService notificationService;
////
////    @Transactional
////    public Invoice createInvoice(Invoice invoice) {
////        invoice.setInvoiceNumber(generateInvoiceNumber());
////        invoice.setCreatedAt(LocalDateTime.now());
////
////        // Calculate totals
////        double subtotal = invoice.getItems().stream()
////                .mapToDouble(InvoiceItem::getTotal)
////                .sum();
////
////        invoice.setSubtotal(subtotal);
////        invoice.setTotal(subtotal - invoice.getDiscount() + invoice.getTax());
////        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
////
////        // Determine payment status
////        if (invoice.getPaidAmount() >= invoice.getTotal()) {
////            invoice.setPaymentStatus(PaymentStatus.PAID);
////        } else if (invoice.getPaidAmount() > 0) {
////            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
////        } else {
////            invoice.setPaymentStatus(PaymentStatus.UNPAID);
////        }
////
////        Invoice saved = invoiceRepository.save(invoice);
////
////        // DEDUCT STOCK ONLY WHEN INVOICE IS SAVED
////        for (InvoiceItem item : saved.getItems()) {
////            inventoryService.deductStock(
////                    item.getInventoryItem().getId(),
////                    item.getQuantity(),
////                    item.getSerialNumbers()
////            );
////        }
////
////        // Update job card if linked
////        if (saved.getJobCard() != null) {
////            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
////                    .orElseThrow(() -> new RuntimeException("Job card not found"));
////            jobCard.setStatus(JobStatus.DELIVERED);
////            jobCardRepository.save(jobCard);
////        }
////
////        notificationService.sendNotification(
////                NotificationType.INVOICE_CREATED,
////                "Invoice created: " + saved.getInvoiceNumber(),
////                saved
////        );
////
////        return saved;
////    }
////
////    @Transactional
////    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
////        Invoice invoice = invoiceRepository.findById(invoiceId)
////                .orElseThrow(() -> new RuntimeException("Invoice not found"));
////
////        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
////        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
////        invoice.setPaymentMethod(method);
////
////        if (invoice.getPaidAmount() >= invoice.getTotal()) {
////            invoice.setPaymentStatus(PaymentStatus.PAID);
////        } else if (invoice.getPaidAmount() > 0) {
////            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
////        }
////
////        return invoiceRepository.save(invoice);
////    }
////
////    @Transactional
////    public void deleteInvoice(Long invoiceId, Long userId, String reason) {
////        Invoice invoice = invoiceRepository.findById(invoiceId)
////                .orElseThrow(() -> new RuntimeException("Invoice not found"));
////
////        // Mark as deleted instead of actual delete
////        invoice.setIsDeleted(true);
////        invoice.setDeletedBy(userId);
////        invoice.setDeletedAt(LocalDateTime.now());
////        invoice.setDeletionReason(reason);
////
////        invoiceRepository.save(invoice);
////
////        // RESTORE STOCK when invoice is deleted
////        for (InvoiceItem item : invoice.getItems()) {
////            if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
////                // Restore serialized items
////                for (String serial : item.getSerialNumbers()) {
////                    // Mark serial as AVAILABLE again in inventory
////                }
////            } else {
////                // Restore quantity
////                InventoryItem invItem = item.getInventoryItem();
////                invItem.setQuantity(invItem.getQuantity() + item.getQuantity());
////                // inventoryItemRepository.save(invItem); - handled in service
////            }
////        }
////
////        notificationService.sendNotification(
////                NotificationType.INVOICE_DELETED,
////                "Invoice deleted: " + invoice.getInvoiceNumber(),
////                invoice
////        );
////    }
////
////    public List<Invoice> getAllInvoices() {
////        return invoiceRepository.findAll().stream()
////                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()))
////                .collect(Collectors.toList());
////    }
////
////    public Invoice getInvoiceById(Long id) {
////        return invoiceRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Invoice not found"));
////    }
////
////    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
////        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
////                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()))
////                .collect(Collectors.toList());
////    }
////
////    // NEW: Search by job card number
////    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
////        return invoiceRepository.findAll().stream()
////                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()) &&
////                        inv.getJobCard() != null &&
////                        inv.getJobCard().getJobNumber().contains(jobCardNumber))
////                .collect(Collectors.toList());
////    }
////
////    // NEW: Search by customer name or invoice number
////    public List<Invoice> searchByCustomerOrInvoice(String searchTerm) {
////        String term = searchTerm.toLowerCase();
////        return invoiceRepository.findAll().stream()
////                .filter(inv -> !Boolean.TRUE.equals(inv.getIsDeleted()) &&
////                        (inv.getCustomerName().toLowerCase().contains(term) ||
////                                inv.getInvoiceNumber().toLowerCase().contains(term)))
////                .collect(Collectors.toList());
////    }
////
////    private String generateInvoiceNumber() {
////        return "INV-" + System.currentTimeMillis();
////    }
////
////
////}


//............................................

//
//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class InvoiceService {
//    private final InvoiceRepository invoiceRepository;
//    private final InventoryService inventoryService;
//    private final JobCardRepository jobCardRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//
//    /**
//     * Create a new invoice with items
//     */
//    @Transactional
//    public Invoice createInvoice(Invoice invoice) {
//        // Generate unique invoice number
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//        invoice.setCreatedAt(LocalDateTime.now());
//
//        // Calculate subtotal from items
//        double subtotal = invoice.getItems() != null
//                ? invoice.getItems().stream()
//                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
//                .sum()
//                : 0;
//
//        invoice.setSubtotal(subtotal);
//
//        // Calculate total (subtotal - discount + tax)
//        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
//                + (invoice.getTax() != null ? invoice.getTax() : 0);
//        invoice.setTotal(total);
//
//        // Calculate balance
//        double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
//        invoice.setBalance(total - paidAmount);
//
//        // Determine payment status
//        if (paidAmount >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (paidAmount > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        // Save invoice
//        Invoice saved = invoiceRepository.save(invoice);
//
//        // Set invoice reference in all items and deduct stock
//        if (saved.getItems() != null) {
//            for (InvoiceItem item : saved.getItems()) {
//                item.setInvoice(saved); // Set the invoice reference
//
//                // Deduct stock from inventory
//                if (item.getInventoryItem() != null) {
//                    inventoryService.deductStock(
//                            item.getInventoryItem().getId(),
//                            item.getQuantity() != null ? item.getQuantity() : 0,
//                            item.getSerialNumbers()
//                    );
//                }
//            }
//        }
//
//        // Update job card status if linked
//        if (saved.getJobCard() != null) {
//            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
//                    .orElseThrow(() -> new RuntimeException("Job card not found"));
//            jobCard.setStatus(JobStatus.DELIVERED);
//            jobCardRepository.save(jobCard);
//        }
//
//        return saved;
//    }
//
//    /**
//     * Add payment to invoice and update payment status
//     */
//    @Transactional
//    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Add payment
//        double currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
//        invoice.setPaidAmount(currentPaid + amount);
//        invoice.setPaymentMethod(method);
//
//        // Update balance
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//
//        // Update payment status
//        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        }
//
//        return invoiceRepository.save(invoice);
//    }
//
//    /**
//     * Get all invoices (excluding deleted ones)
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> getAllInvoices() {
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Get invoice by ID (LAZY loading - items not loaded)
//     */
//    @Transactional(readOnly = true)
//    public Invoice getInvoiceById(Long id) {
//        return invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//    }
//
//    /**
//     * Get invoice by ID WITH items loaded (EAGER loading)
//     * IMPORTANT: Use this when you need items to be displayed
//     */
//    @Transactional(readOnly = true)
//    public Invoice getInvoiceByIdWithItems(Long id) {
//        // Fetch invoice from database
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Force loading of items (triggers database query)
//        if (invoice.getItems() != null) {
//            invoice.getItems().size();
//            // Also load details of each item
//            invoice.getItems().forEach(item -> {
//                if (item.getSerialNumbers() != null) {
//                    item.getSerialNumbers().size();
//                }
//                if (item.getInventoryItem() != null) {
//                    item.getInventoryItem().getId();
//                }
//            });
//        }
//
//        // Force loading of job card if present
//        if (invoice.getJobCard() != null) {
//            invoice.getJobCard().getJobNumber();
//        }
//
//        return invoice;
//    }
//
//    /**
//     * Get invoices by date range
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
//                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Search invoices by job card number
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
//                        inv.getJobCard() != null &&
//                        inv.getJobCard().getJobNumber() != null &&
//                        inv.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Search invoices by customer name or invoice number
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> searchByCustomerOrInvoice(String searchTerm) {
//        String term = searchTerm.toLowerCase();
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
//                        ((inv.getCustomerName() != null && inv.getCustomerName().toLowerCase().contains(term)) ||
//                                (inv.getInvoiceNumber() != null && inv.getInvoiceNumber().toLowerCase().contains(term))))
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Delete invoice (soft delete - mark as deleted)
//     */
//    @Transactional
//    public void deleteInvoice(Long invoiceId, Long userId, String reason) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Mark as deleted instead of actual delete
//        invoice.setIsDeleted(true);
//        invoice.setDeletedBy(userId);
//        invoice.setDeletedAt(LocalDateTime.now());
//        invoice.setDeletionReason(reason);
//
//        invoiceRepository.save(invoice);
//
//        // RESTORE STOCK when invoice is deleted
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() != null) {
//                    InventoryItem inventoryItem = item.getInventoryItem();
//
//                    if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
//                        // Restore serialized items
//                        for (String serial : item.getSerialNumbers()) {
//                            // Mark serial as AVAILABLE again
//                            // Implementation depends on your InventorySerial table structure
//                        }
//                    } else {
//                        // Restore quantity
//                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
//                        inventoryItem.setQuantity((inventoryItem.getQuantity() != null ? inventoryItem.getQuantity() : 0) + quantity);
//                        inventoryItemRepository.save(inventoryItem);
//                    }
//                }
//            }
//        }
//    }
//
//    /**
//     * Update invoice
//     */
//    @Transactional
//    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Update fields
//        if (invoiceDetails.getCustomerName() != null) {
//            invoice.setCustomerName(invoiceDetails.getCustomerName());
//        }
//        if (invoiceDetails.getCustomerPhone() != null) {
//            invoice.setCustomerPhone(invoiceDetails.getCustomerPhone());
//        }
//        if (invoiceDetails.getDiscount() != null) {
//            invoice.setDiscount(invoiceDetails.getDiscount());
//        }
//        if (invoiceDetails.getTax() != null) {
//            invoice.setTax(invoiceDetails.getTax());
//        }
//
//        // Recalculate totals
//        double subtotal = invoice.getItems() != null
//                ? invoice.getItems().stream()
//                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
//                .sum()
//                : 0;
//
//        invoice.setSubtotal(subtotal);
//        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
//                + (invoice.getTax() != null ? invoice.getTax() : 0);
//        invoice.setTotal(total);
//        invoice.setBalance(total - (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0));
//
//        return invoiceRepository.save(invoice);
//    }
//
//    /**
//     * Generate unique invoice number
//     */
//    private String generateInvoiceNumber() {
//        // Format: INV-YYYYMMDD-000001
//        String dateStr = LocalDateTime.now().toString().replace("-", "").substring(0, 8);
//        long count = invoiceRepository.count() + 1;
//        return String.format("INV-%s-%06d", dateStr, count);
//    }
//
//    /**
//     * Get invoice summary (statistics)
//     */
//    @Transactional(readOnly = true)
//    public InvoiceSummary getInvoiceSummary() {
//        List<Invoice> invoices = getAllInvoices();
//
//        double totalRevenue = invoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0)
//                .sum();
//
//        double totalCollected = invoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0)
//                .sum();
//
//        double totalOutstanding = invoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0)
//                .sum();
//
//        long paidCount = invoices.stream()
//                .filter(inv -> PaymentStatus.PAID.equals(inv.getPaymentStatus()))
//                .count();
//
//        long partialCount = invoices.stream()
//                .filter(inv -> PaymentStatus.PARTIAL.equals(inv.getPaymentStatus()))
//                .count();
//
//        long unpaidCount = invoices.stream()
//                .filter(inv -> PaymentStatus.UNPAID.equals(inv.getPaymentStatus()))
//                .count();
//
//        return new InvoiceSummary(
//                totalRevenue,
//                totalCollected,
//                totalOutstanding,
//                invoices.size(),
//                paidCount,
//                partialCount,
//                unpaidCount
//        );
//    }
//
//
//    */
//
//    /**
//     * Inner class for invoice summary statistics
//     */
//    public static class InvoiceSummary {
//        public double totalRevenue;
//        public double totalCollected;
//        public double totalOutstanding;
//        public long totalInvoices;
//        public long paidInvoices;
//        public long partialInvoices;
//        public long unpaidInvoices;
//
//        public InvoiceSummary(double totalRevenue, double totalCollected, double totalOutstanding,
//                              long totalInvoices, long paidInvoices, long partialInvoices, long unpaidInvoices) {
//            this.totalRevenue = totalRevenue;
//            this.totalCollected = totalCollected;
//            this.totalOutstanding = totalOutstanding;
//            this.totalInvoices = totalInvoices;
//            this.paidInvoices = paidInvoices;
//            this.partialInvoices = partialInvoices;
//            this.unpaidInvoices = unpaidInvoices;
//        }
//    }
//}
//..............................................................................


//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.repositories.InventoryItemRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class InvoiceService {
//    private final InvoiceRepository invoiceRepository;
//    private final InventoryService inventoryService;
//    private final JobCardRepository jobCardRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//
//    /**
//     * Create a new invoice with items
//     */
//    @Transactional
//    public Invoice createInvoice(Invoice invoice) {
//        // Generate unique invoice number
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//        invoice.setCreatedAt(LocalDateTime.now());
//
//        // Calculate subtotal from items
//        double subtotal = invoice.getItems() != null
//                ? invoice.getItems().stream()
//                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
//                .sum()
//                : 0;
//
//        invoice.setSubtotal(subtotal);
//
//        // Calculate total (subtotal - discount + tax)
//        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
//                + (invoice.getTax() != null ? invoice.getTax() : 0);
//        invoice.setTotal(total);
//
//        // Calculate balance
//        double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
//        invoice.setBalance(total - paidAmount);
//
//        // Determine payment status
//        if (paidAmount >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (paidAmount > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//
//        // Save invoice
//        Invoice saved = invoiceRepository.save(invoice);
//
//        // Set invoice reference in all items and deduct stock
//        if (saved.getItems() != null) {
//            for (InvoiceItem item : saved.getItems()) {
//                item.setInvoice(saved); // Set the invoice reference
//
//                // Deduct stock from inventory
//                if (item.getInventoryItem() != null) {
//                    inventoryService.deductStock(
//                            item.getInventoryItem().getId(),
//                            item.getQuantity() != null ? item.getQuantity() : 0,
//                            item.getSerialNumbers()
//                    );
//                }
//            }
//        }
//
//        // Update job card status if linked
//        if (saved.getJobCard() != null) {
//            JobCard jobCard = jobCardRepository.findById(saved.getJobCard().getId())
//                    .orElseThrow(() -> new RuntimeException("Job card not found"));
//            jobCard.setStatus(JobStatus.DELIVERED);
//            jobCardRepository.save(jobCard);
//        }
//
//        return saved;
//    }
//
//    /**
//     * Add payment to invoice and update payment status
//     */
//    @Transactional
//    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Add payment
//        double currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
//        invoice.setPaidAmount(currentPaid + amount);
//        invoice.setPaymentMethod(method);
//
//        // Update balance
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//
//        // Update payment status
//        if (invoice.getPaidAmount() >= invoice.getTotal()) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//        } else if (invoice.getPaidAmount() > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        }
//
//        return invoiceRepository.save(invoice);
//    }
//
//    /**
//     * Get all invoices (excluding deleted ones)
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> getAllInvoices() {
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
//                .map(this::enrichInvoiceWithJobCardDetails)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Get invoice by ID (LAZY loading - items not loaded)
//     */
//    @Transactional(readOnly = true)
//    public Invoice getInvoiceById(Long id) {
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//        return enrichInvoiceWithJobCardDetails(invoice);
//    }
//
//    /**
//     * Get invoice by ID WITH items and full job card details loaded (EAGER loading)
//     * IMPORTANT: Use this when you need all details including serials and faults
//     */
//    @Transactional(readOnly = true)
//    public Invoice getInvoiceByIdWithItems(Long id) {
//        // Fetch invoice from database
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Force loading of items (triggers database query)
//        if (invoice.getItems() != null) {
//            invoice.getItems().size();
//            // Also load details of each item
//            invoice.getItems().forEach(item -> {
//                if (item.getSerialNumbers() != null) {
//                    item.getSerialNumbers().size();
//                }
//                if (item.getInventoryItem() != null) {
//                    item.getInventoryItem().getId();
//                }
//            });
//        }
//
//        // Force loading of job card if present
//        if (invoice.getJobCard() != null) {
//            invoice.getJobCard().getJobNumber();
//            // Force load all job card relationships
//            if (invoice.getJobCard().getFaults() != null) {
//                invoice.getJobCard().getFaults().size();
//            }
//            if (invoice.getJobCard().getServiceCategories() != null) {
//                invoice.getJobCard().getServiceCategories().size();
//            }
//            if (invoice.getJobCard().getSerials() != null) {
//                invoice.getJobCard().getSerials().size();
//            }
//            if (invoice.getJobCard().getUsedItems() != null) {
//                invoice.getJobCard().getUsedItems().size();
//            }
//        }
//
//        return enrichInvoiceWithJobCardDetails(invoice);
//    }
//
//    /**
//     * ADDED: Enrich invoice with complete job card details including serials and faults
//     */
//    private Invoice enrichInvoiceWithJobCardDetails(Invoice invoice) {
//        if (invoice.getJobCard() != null) {
//            JobCard jobCard = invoice.getJobCard();
//
//            // Ensure all relationships are loaded
//            if (jobCard.getFaults() != null) {
//                jobCard.getFaults().forEach(fault -> {
//                    // Trigger lazy loading
//                    fault.getId();
//                });
//            }
//
//            if (jobCard.getServiceCategories() != null) {
//                jobCard.getServiceCategories().forEach(service -> {
//                    // Trigger lazy loading
//                    service.getId();
//                });
//            }
//
//            if (jobCard.getSerials() != null) {
//                jobCard.getSerials().forEach(serial -> {
//                    // Trigger lazy loading
//                    serial.getId();
//                });
//            }
//
//            if (jobCard.getUsedItems() != null) {
//                jobCard.getUsedItems().forEach(item -> {
//                    // Trigger lazy loading
//                    item.getId();
//                });
//            }
//        }
//        return invoice;
//    }
//
//    /**
//     * Get invoices by date range
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
//                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
//                .map(this::enrichInvoiceWithJobCardDetails)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Search invoices by job card number
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
//                        inv.getJobCard() != null &&
//                        inv.getJobCard().getJobNumber() != null &&
//                        inv.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
//                .map(this::enrichInvoiceWithJobCardDetails)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Search invoices by customer name or invoice number
//     */
//    @Transactional(readOnly = true)
//    public List<Invoice> searchByCustomerOrInvoice(String searchTerm) {
//        String term = searchTerm.toLowerCase();
//        return invoiceRepository.findAll().stream()
//                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
//                        ((inv.getCustomerName() != null && inv.getCustomerName().toLowerCase().contains(term)) ||
//                                (inv.getInvoiceNumber() != null && inv.getInvoiceNumber().toLowerCase().contains(term))))
//                .map(this::enrichInvoiceWithJobCardDetails)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Delete invoice (soft delete - mark as deleted)
//     */
//    @Transactional
//    public void deleteInvoice(Long invoiceId, Long userId, String reason) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Mark as deleted instead of actual delete
//        invoice.setIsDeleted(true);
//        invoice.setDeletedBy(userId);
//        invoice.setDeletedAt(LocalDateTime.now());
//        invoice.setDeletionReason(reason);
//
//        invoiceRepository.save(invoice);
//
//        // RESTORE STOCK when invoice is deleted
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() != null) {
//                    InventoryItem inventoryItem = item.getInventoryItem();
//
//                    if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
//                        // Restore serialized items
//                        for (String serial : item.getSerialNumbers()) {
//                            // Mark serial as AVAILABLE again
//                            // Implementation depends on your InventorySerial table structure
//                        }
//                    } else {
//                        // Restore quantity
//                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
//                        inventoryItem.setQuantity((inventoryItem.getQuantity() != null ? inventoryItem.getQuantity() : 0) + quantity);
//                        inventoryItemRepository.save(inventoryItem);
//                    }
//                }
//            }
//        }
//    }
//
//    /**
//     * Update invoice
//     */
//    @Transactional
//    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        // Update fields
//        if (invoiceDetails.getCustomerName() != null) {
//            invoice.setCustomerName(invoiceDetails.getCustomerName());
//        }
//        if (invoiceDetails.getCustomerPhone() != null) {
//            invoice.setCustomerPhone(invoiceDetails.getCustomerPhone());
//        }
//        if (invoiceDetails.getDiscount() != null) {
//            invoice.setDiscount(invoiceDetails.getDiscount());
//        }
//        if (invoiceDetails.getTax() != null) {
//            invoice.setTax(invoiceDetails.getTax());
//        }
//
//        // Recalculate totals
//        double subtotal = invoice.getItems() != null
//                ? invoice.getItems().stream()
//                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
//                .sum()
//                : 0;
//
//        invoice.setSubtotal(subtotal);
//        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
//                + (invoice.getTax() != null ? invoice.getTax() : 0);
//        invoice.setTotal(total);
//        invoice.setBalance(total - (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0));
//
//        Invoice updated = invoiceRepository.save(invoice);
//        return enrichInvoiceWithJobCardDetails(updated);
//    }
//
//    /**
//     * Generate unique invoice number
//     */
//    private String generateInvoiceNumber() {
//        // Format: INV-YYYYMMDD-000001
//        String dateStr = LocalDateTime.now().toString().replace("-", "").substring(0, 8);
//        long count = invoiceRepository.count() + 1;
//        return String.format("INV-%s-%06d", dateStr, count);
//    }
//
//    /**
//     * Get invoice summary (statistics)
//     */
//    @Transactional(readOnly = true)
//    public InvoiceSummary getInvoiceSummary() {
//        List<Invoice> invoices = getAllInvoices();
//
//        double totalRevenue = invoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0)
//                .sum();
//
//        double totalCollected = invoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0)
//                .sum();
//
//        double totalOutstanding = invoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0)
//                .sum();
//
//        long paidCount = invoices.stream()
//                .filter(inv -> PaymentStatus.PAID.equals(inv.getPaymentStatus()))
//                .count();
//
//        long partialCount = invoices.stream()
//                .filter(inv -> PaymentStatus.PARTIAL.equals(inv.getPaymentStatus()))
//                .count();
//
//        long unpaidCount = invoices.stream()
//                .filter(inv -> PaymentStatus.UNPAID.equals(inv.getPaymentStatus()))
//                .count();
//
//        return new InvoiceSummary(
//                totalRevenue,
//                totalCollected,
//                totalOutstanding,
//                invoices.size(),
//                paidCount,
//                partialCount,
//                unpaidCount
//        );
//    }
//
//    /**
//     * Inner class for invoice summary statistics
//     */
//    public static class InvoiceSummary {
//        public double totalRevenue;
//        public double totalCollected;
//        public double totalOutstanding;
//        public long totalInvoices;
//        public long paidInvoices;
//        public long partialInvoices;
//        public long unpaidInvoices;
//
//        public InvoiceSummary(double totalRevenue, double totalCollected, double totalOutstanding,
//                              long totalInvoices, long paidInvoices, long partialInvoices, long unpaidInvoices) {
//            this.totalRevenue = totalRevenue;
//            this.totalCollected = totalCollected;
//            this.totalOutstanding = totalOutstanding;
//            this.totalInvoices = totalInvoices;
//            this.paidInvoices = paidInvoices;
//            this.partialInvoices = partialInvoices;
//            this.unpaidInvoices = unpaidInvoices;
//        }
//    }
//}
//








package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import com.example.demo.repositories.InventoryItemRepository;
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
    private final InventoryItemRepository inventoryItemRepository;

    /**
     * Create a new invoice with items
     * IMPORTANT: Deducts inventory and does NOT change job card status yet
     */
    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        // Generate unique invoice number
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCreatedAt(LocalDateTime.now());

        // Calculate subtotal from items
        double subtotal = invoice.getItems() != null
                ? invoice.getItems().stream()
                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
                .sum()
                : 0;

        invoice.setSubtotal(subtotal);

        // Calculate total (subtotal - discount + tax)
        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
                + (invoice.getTax() != null ? invoice.getTax() : 0);
        invoice.setTotal(total);

        // Calculate balance
        double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
        invoice.setBalance(total - paidAmount);

        // Determine payment status
        if (paidAmount >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (paidAmount > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }

        // Save invoice
        Invoice saved = invoiceRepository.save(invoice);

        // Set invoice reference in all items and deduct stock
        if (saved.getItems() != null) {
            for (InvoiceItem item : saved.getItems()) {
                item.setInvoice(saved);

                // Deduct stock from inventory
                if (item.getInventoryItem() != null) {
                    inventoryService.deductStock(
                            item.getInventoryItem().getId(),
                            item.getQuantity() != null ? item.getQuantity() : 0,
                            item.getSerialNumbers()
                    );
                }
            }
        }

        // CRITICAL: Update job card status to DELIVERED if invoice is PAID on creation
        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    /**
     * Add payment to invoice and update payment status
     * CRITICAL: Automatically changes job card status to DELIVERED when fully paid
     */
    @Transactional
    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Add payment
        double currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0;
        invoice.setPaidAmount(currentPaid + amount);
        invoice.setPaymentMethod(method);

        // Update balance
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());

        // Store old payment status
        PaymentStatus oldStatus = invoice.getPaymentStatus();

        // Update payment status
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else if (invoice.getPaidAmount() > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // CRITICAL: Update job card status to DELIVERED if:
        // 1. Invoice is now PAID
        // 2. Previous status was not PAID
        // 3. Job card exists
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID &&
                oldStatus != PaymentStatus.PAID &&
                savedInvoice.getJobCard() != null) {

            updateJobCardToDelivered(savedInvoice.getJobCard().getId());

            // Log the status change
            System.out.println("✅ Job Card " + savedInvoice.getJobCard().getJobNumber() +
                    " status changed to DELIVERED (Invoice fully paid)");
        }

        return savedInvoice;
    }

    /**
     * CRITICAL METHOD: Update job card status to DELIVERED
     * Called when invoice is fully paid
     */
    private void updateJobCardToDelivered(Long jobCardId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Only update if not already DELIVERED or CANCELLED
        if (jobCard.getStatus() != JobStatus.DELIVERED && jobCard.getStatus() != JobStatus.CANCELLED) {
            jobCard.setStatus(JobStatus.DELIVERED);
            jobCard.setUpdatedAt(LocalDateTime.now());
            jobCardRepository.save(jobCard);

            System.out.println("✅ Job Card " + jobCard.getJobNumber() + " marked as DELIVERED");
        }
    }

    /**
     * Get all invoices (excluding deleted ones)
     */
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
                .map(this::enrichInvoiceWithJobCardDetails)
                .collect(Collectors.toList());
    }

    /**
     * Get invoice by ID (LAZY loading - items not loaded)
     */
    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return enrichInvoiceWithJobCardDetails(invoice);
    }

    /**
     * Get invoice by ID WITH items and full job card details loaded (EAGER loading)
     * IMPORTANT: Use this when you need all details including serials and faults
     */
    @Transactional(readOnly = true)
    public Invoice getInvoiceByIdWithItems(Long id) {
        // Fetch invoice from database
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Force loading of items (triggers database query)
        if (invoice.getItems() != null) {
            invoice.getItems().size();
            // Also load details of each item
            invoice.getItems().forEach(item -> {
                if (item.getSerialNumbers() != null) {
                    item.getSerialNumbers().size();
                }
                if (item.getInventoryItem() != null) {
                    item.getInventoryItem().getId();
                }
            });
        }

        // Force loading of job card if present
        if (invoice.getJobCard() != null) {
            invoice.getJobCard().getJobNumber();
            // Force load all job card relationships
            if (invoice.getJobCard().getFaults() != null) {
                invoice.getJobCard().getFaults().size();
            }
            if (invoice.getJobCard().getServiceCategories() != null) {
                invoice.getJobCard().getServiceCategories().size();
            }
            if (invoice.getJobCard().getSerials() != null) {
                invoice.getJobCard().getSerials().size();
            }
            if (invoice.getJobCard().getUsedItems() != null) {
                invoice.getJobCard().getUsedItems().size();
            }
        }

        return enrichInvoiceWithJobCardDetails(invoice);
    }

    /**
     * ADDED: Enrich invoice with complete job card details including serials and faults
     */
    private Invoice enrichInvoiceWithJobCardDetails(Invoice invoice) {
        if (invoice.getJobCard() != null) {
            JobCard jobCard = invoice.getJobCard();

            // Ensure all relationships are loaded
            if (jobCard.getFaults() != null) {
                jobCard.getFaults().forEach(fault -> {
                    fault.getId();
                });
            }

            if (jobCard.getServiceCategories() != null) {
                jobCard.getServiceCategories().forEach(service -> {
                    service.getId();
                });
            }

            if (jobCard.getSerials() != null) {
                jobCard.getSerials().forEach(serial -> {
                    serial.getId();
                });
            }

            if (jobCard.getUsedItems() != null) {
                jobCard.getUsedItems().forEach(item -> {
                    item.getId();
                });
            }
        }
        return invoice;
    }

    /**
     * Get invoices by date range
     */
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
                .filter(inv -> inv.getIsDeleted() == null || !inv.getIsDeleted())
                .map(this::enrichInvoiceWithJobCardDetails)
                .collect(Collectors.toList());
    }

    /**
     * Search invoices by job card number
     */
    @Transactional(readOnly = true)
    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
        return invoiceRepository.findAll().stream()
                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
                        inv.getJobCard() != null &&
                        inv.getJobCard().getJobNumber() != null &&
                        inv.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
                .map(this::enrichInvoiceWithJobCardDetails)
                .collect(Collectors.toList());
    }

    /**
     * Search invoices by customer name or invoice number
     */
    @Transactional(readOnly = true)
    public List<Invoice> searchByCustomerOrInvoice(String searchTerm) {
        String term = searchTerm.toLowerCase();
        return invoiceRepository.findAll().stream()
                .filter(inv -> (inv.getIsDeleted() == null || !inv.getIsDeleted()) &&
                        ((inv.getCustomerName() != null && inv.getCustomerName().toLowerCase().contains(term)) ||
                                (inv.getInvoiceNumber() != null && inv.getInvoiceNumber().toLowerCase().contains(term))))
                .map(this::enrichInvoiceWithJobCardDetails)
                .collect(Collectors.toList());
    }

    /**
     * Delete invoice (soft delete - mark as deleted)
     */
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
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() != null) {
                    InventoryItem inventoryItem = item.getInventoryItem();

                    if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                        // Restore serialized items
                        for (String serial : item.getSerialNumbers()) {
                            // Mark serial as AVAILABLE again
                        }
                    } else {
                        // Restore quantity
                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                        inventoryItem.setQuantity((inventoryItem.getQuantity() != null ? inventoryItem.getQuantity() : 0) + quantity);
                        inventoryItemRepository.save(inventoryItem);
                    }
                }
            }
        }

        // IMPORTANT: If job card was DELIVERED because of this invoice, revert to COMPLETED
        if (invoice.getJobCard() != null && invoice.getJobCard().getStatus() == JobStatus.DELIVERED) {
            JobCard jobCard = invoice.getJobCard();
            jobCard.setStatus(JobStatus.COMPLETED);
            jobCard.setUpdatedAt(LocalDateTime.now());
            jobCardRepository.save(jobCard);

            System.out.println("⚠️ Job Card " + jobCard.getJobNumber() + " reverted to COMPLETED (Invoice deleted)");
        }
    }

    /**
     * Update invoice
     */
    @Transactional
    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Update fields
        if (invoiceDetails.getCustomerName() != null) {
            invoice.setCustomerName(invoiceDetails.getCustomerName());
        }
        if (invoiceDetails.getCustomerPhone() != null) {
            invoice.setCustomerPhone(invoiceDetails.getCustomerPhone());
        }
        if (invoiceDetails.getDiscount() != null) {
            invoice.setDiscount(invoiceDetails.getDiscount());
        }
        if (invoiceDetails.getTax() != null) {
            invoice.setTax(invoiceDetails.getTax());
        }

        // Recalculate totals
        double subtotal = invoice.getItems() != null
                ? invoice.getItems().stream()
                .mapToDouble(item -> item.getTotal() != null ? item.getTotal() : 0)
                .sum()
                : 0;

        invoice.setSubtotal(subtotal);
        double total = subtotal - (invoice.getDiscount() != null ? invoice.getDiscount() : 0)
                + (invoice.getTax() != null ? invoice.getTax() : 0);
        invoice.setTotal(total);
        invoice.setBalance(total - (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0));

        Invoice updated = invoiceRepository.save(invoice);
        return enrichInvoiceWithJobCardDetails(updated);
    }

    /**
     * Generate unique invoice number
     */
    private String generateInvoiceNumber() {
        // Format: INV-YYYYMMDD-000001
        String dateStr = LocalDateTime.now().toString().replace("-", "").substring(0, 8);
        long count = invoiceRepository.count() + 1;
        return String.format("INV-%s-%06d", dateStr, count);
    }

    /**
     * Get invoice summary (statistics)
     */
    @Transactional(readOnly = true)
    public InvoiceSummary getInvoiceSummary() {
        List<Invoice> invoices = getAllInvoices();

        double totalRevenue = invoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0)
                .sum();

        double totalCollected = invoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0)
                .sum();

        double totalOutstanding = invoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0)
                .sum();

        long paidCount = invoices.stream()
                .filter(inv -> PaymentStatus.PAID.equals(inv.getPaymentStatus()))
                .count();

        long partialCount = invoices.stream()
                .filter(inv -> PaymentStatus.PARTIAL.equals(inv.getPaymentStatus()))
                .count();

        long unpaidCount = invoices.stream()
                .filter(inv -> PaymentStatus.UNPAID.equals(inv.getPaymentStatus()))
                .count();

        return new InvoiceSummary(
                totalRevenue,
                totalCollected,
                totalOutstanding,
                invoices.size(),
                paidCount,
                partialCount,
                unpaidCount
        );
    }

    /**
     * Inner class for invoice summary statistics
     */
    public static class InvoiceSummary {
        public double totalRevenue;
        public double totalCollected;
        public double totalOutstanding;
        public long totalInvoices;
        public long paidInvoices;
        public long partialInvoices;
        public long unpaidInvoices;

        public InvoiceSummary(double totalRevenue, double totalCollected, double totalOutstanding,
                              long totalInvoices, long paidInvoices, long partialInvoices, long unpaidInvoices) {
            this.totalRevenue = totalRevenue;
            this.totalCollected = totalCollected;
            this.totalOutstanding = totalOutstanding;
            this.totalInvoices = totalInvoices;
            this.paidInvoices = paidInvoices;
            this.partialInvoices = partialInvoices;
            this.unpaidInvoices = unpaidInvoices;
        }
    }
}





