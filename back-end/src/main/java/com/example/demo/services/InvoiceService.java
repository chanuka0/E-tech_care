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









//package com.example.demo.services;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class InvoiceService {
//    private final InvoiceRepository invoiceRepository;
//    private final JobCardRepository jobCardRepository;
//    private final InventoryItemRepository inventoryItemRepository;
//    private final InventorySerialRepository inventorySerialRepository;
//    private final StockMovementRepository stockMovementRepository;
//    private final NotificationService notificationService;
//    private final InventoryService inventoryService;
//
//    @Transactional
//    public Invoice createInvoice(Invoice invoice) {
//        // Generate invoice number
//        invoice.setInvoiceNumber(generateInvoiceNumber());
//
//        // Set payment status based on paid amount
//        updatePaymentStatus(invoice);
//
//        // Auto-populate used items from job card if not already provided
//        if (invoice.getJobCard() != null && (invoice.getItems() == null || invoice.getItems().isEmpty())) {
//            autoPopulateItemsFromJobCard(invoice);
//        }
//
//        // Calculate totals
//        calculateInvoiceTotals(invoice);
//
//        // Validate serial numbers before creating invoice
//        validateInvoiceSerials(invoice);
//
//        // Set bidirectional relationships for items
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                item.setInvoice(invoice);
//
//                // Deduct inventory stock when invoice is created (for direct invoices only)
//                if (item.getInventoryItem() != null && invoice.getJobCard() == null) {
//                    deductInventoryForInvoiceItem(invoice, item);
//                }
//            }
//        }
//
//        Invoice saved = invoiceRepository.save(invoice);
//
//        // If invoice is created as PAID (full payment upfront), process stock
//        if (saved.getPaymentStatus() == PaymentStatus.PAID) {
//            processStockForPaidInvoice(saved);
//        }
//
//        // Update job card status if invoice is fully paid
//        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(saved.getJobCard().getId());
//        }
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_CREATED,
//                "Invoice created: " + saved.getInvoiceNumber() +
//                        " | Amount: Rs." + saved.getTotal() +
//                        " | Status: " + saved.getPaymentStatus(),
//                saved
//        );
//
//        return saved;
//    }
//
//    /**
//     * Auto-populate invoice items from job card used items with serial numbers
//     */
//    private void autoPopulateItemsFromJobCard(Invoice invoice) {
//        if (invoice.getJobCard() == null) return;
//
//        JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId())
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
//            List<InvoiceItem> invoiceItems = new ArrayList<>();
//
//            for (UsedItem usedItem : jobCard.getUsedItems()) {
//                InvoiceItem invoiceItem = new InvoiceItem();
//                invoiceItem.setInvoice(invoice);
//                invoiceItem.setInventoryItem(usedItem.getInventoryItem());
//                invoiceItem.setItemName(usedItem.getInventoryItem().getName());
//                invoiceItem.setQuantity(usedItem.getQuantityUsed());
//                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
//                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
//                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
//                        usedItem.getWarrantyPeriod() : "No Warranty");
//
//                // Transfer serial numbers from used item to invoice item
//                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
//                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
//                } else {
//                    invoiceItem.setSerialNumbers(new ArrayList<>());
//                }
//
//                invoiceItems.add(invoiceItem);
//            }
//
//            invoice.setItems(invoiceItems);
//        }
//    }
//
//    /**
//     * Validate that serial numbers are available for invoice items
//     */
//    private void validateInvoiceSerials(Invoice invoice) {
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() != null && item.getInventoryItem().getHasSerialization()) {
//                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
//                        throw new RuntimeException("Serial numbers required for item: " + item.getItemName());
//                    }
//
//                    if (item.getSerialNumbers().size() != item.getQuantity()) {
//                        throw new RuntimeException("Number of serials must match quantity for item: " + item.getItemName());
//                    }
//
//                    // Validate each serial is available
//                    for (String serialNumber : item.getSerialNumbers()) {
//                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                                .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));
//
//                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
//                            throw new RuntimeException("Serial number not available: " + serialNumber);
//                        }
//                    }
//                }
//            }
//        }
//    }
//
//    @Transactional
//    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
//        Invoice invoice = invoiceRepository.findById(invoiceId)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
//            throw new RuntimeException("Invoice is already fully paid");
//        }
//
//        if (amount <= 0) {
//            throw new RuntimeException("Payment amount must be greater than 0");
//        }
//
//        if (amount > invoice.getBalance()) {
//            throw new RuntimeException("Payment amount cannot exceed balance due");
//        }
//
//        // Store old payment status to check if we're transitioning to PAID
//        PaymentStatus oldStatus = invoice.getPaymentStatus();
//
//        // Update paid amount
//        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
//        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
//        invoice.setPaymentMethod(method);
//
//        // Update payment status
//        updatePaymentStatus(invoice);
//
//        Invoice saved = invoiceRepository.save(invoice);
//
//        // Process stock when invoice becomes fully paid
//        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
//            processStockForPaidInvoice(saved);
//        }
//
//        notificationService.sendNotification(
//                NotificationType.PAYMENT_RECEIVED,
//                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
//                        " | New Balance: Rs." + saved.getBalance(),
//                saved
//        );
//
//        // Update job card status to DELIVERED if invoice is now fully paid
//        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(saved.getJobCard().getId());
//        }
//
//        return saved;
//    }
//
//    /**
//     * Process stock for paid invoice (mark serials as SOLD and update quantities)
//     */
//    private void processStockForPaidInvoice(Invoice invoice) {
//        if (invoice.getItems() != null) {
//            for (InvoiceItem item : invoice.getItems()) {
//                if (item.getInventoryItem() != null) {
//                    if (item.getInventoryItem().getHasSerialization()) {
//                        // For serialized items, mark serials as SOLD
//                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
//                            markSerialsAsSoldForInvoice(item, invoice);
//                        }
//                    }
//
//                    // Update inventory quantity for both serialized and non-serialized items
//                    updateInventoryQuantityForInvoiceItem(item, invoice);
//                }
//            }
//        }
//    }
//
//    /**
//     * Mark serial numbers as SOLD for invoice
//     */
//    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
//        for (String serialNumber : item.getSerialNumbers()) {
//            try {
//                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
//                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));
//
//                // Only mark as SOLD if not already sold
//                if (inventorySerial.getStatus() == SerialStatus.AVAILABLE) {
//                    inventorySerial.setStatus(SerialStatus.SOLD);
//                    inventorySerial.setUsedAt(LocalDateTime.now());
//                    inventorySerial.setUsedBy(getCurrentUsername());
//                    inventorySerial.setUsedInReferenceType("INVOICE");
//                    inventorySerial.setUsedInReferenceId(invoice.getId());
//                    inventorySerial.setUsedInReferenceNumber(invoice.getInvoiceNumber());
//                    inventorySerial.setNotes("Sold via invoice payment");
//                    inventorySerialRepository.save(inventorySerial);
//
//                    // Record stock movement for serial
//                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
//                }
//            } catch (Exception e) {
//                // Log error but don't fail the entire payment process
//                System.err.println("Failed to mark serial as SOLD: " + serialNumber + " - " + e.getMessage());
//            }
//        }
//    }
//
//    /**
//     * Update inventory quantity for invoice items
//     */
//    private void updateInventoryQuantityForInvoiceItem(InvoiceItem item, Invoice invoice) {
//        try {
//            InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//            int quantityToDeduct = item.getQuantity();
//            int previousQuantity = invItem.getQuantity();
//            int newQuantity = previousQuantity - quantityToDeduct;
//
//            if (newQuantity < 0) {
//                throw new RuntimeException("Not enough stock for item: " + invItem.getName());
//            }
//
//            invItem.setQuantity(newQuantity);
//            inventoryItemRepository.save(invItem);
//
//            // Record stock movement for quantity update
//            recordStockMovementForQuantity(invItem, invoice, quantityToDeduct, previousQuantity, newQuantity);
//
//        } catch (Exception e) {
//            System.err.println("Failed to update inventory quantity for item: " + item.getItemName() + " - " + e.getMessage());
//        }
//    }
//
//    /**
//     * Record stock movement for serial
//     */
//    private void recordStockMovementForSerial(InventoryItem item, Invoice invoice, String serialNumber) {
//        try {
//            StockMovement movement = new StockMovement();
//            movement.setInventoryItem(item);
//            movement.setMovementType(MovementType.OUT);
//            movement.setQuantity(1);
//            movement.setReferenceType("INVOICE");
//            movement.setReferenceId(invoice.getId());
//            movement.setReferenceNumber(invoice.getInvoiceNumber());
//            movement.setReason("Serial sold via invoice payment");
//            movement.setSerialNumber(serialNumber);
//            movement.setPerformedBy(getCurrentUsername());
//            movement.setPreviousQuantity(item.getQuantity() + 1);
//            movement.setNewQuantity(item.getQuantity());
//            movement.setCreatedAt(LocalDateTime.now());
//
//            stockMovementRepository.save(movement);
//        } catch (Exception e) {
//            System.err.println("Failed to record stock movement for serial: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Record stock movement for quantity update
//     */
//    private void recordStockMovementForQuantity(InventoryItem item, Invoice invoice, Integer quantity,
//                                                Integer previousQuantity, Integer newQuantity) {
//        try {
//            StockMovement movement = new StockMovement();
//            movement.setInventoryItem(item);
//            movement.setMovementType(MovementType.OUT);
//            movement.setQuantity(quantity);
//            movement.setReferenceType("INVOICE");
//            movement.setReferenceId(invoice.getId());
//            movement.setReferenceNumber(invoice.getInvoiceNumber());
//            movement.setReason("Quantity sold via invoice payment");
//            movement.setPerformedBy(getCurrentUsername());
//            movement.setPreviousQuantity(previousQuantity);
//            movement.setNewQuantity(newQuantity);
//            movement.setCreatedAt(LocalDateTime.now());
//
//            stockMovementRepository.save(movement);
//        } catch (Exception e) {
//            System.err.println("Failed to record stock movement: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Get current username for audit purposes
//     */
//    private String getCurrentUsername() {
//        try {
//            return SecurityContextHolder.getContext().getAuthentication().getName();
//        } catch (Exception e) {
//            return "SYSTEM";
//        }
//    }
//
//    @Transactional
//    public Invoice updateInvoice(Long id, Invoice updates) {
//        Invoice existing = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (existing.getPaymentStatus() == PaymentStatus.PAID) {
//            throw new RuntimeException("Cannot update a fully paid invoice");
//        }
//
//        // Update basic fields
//        existing.setCustomerName(updates.getCustomerName());
//        existing.setCustomerPhone(updates.getCustomerPhone());
//        existing.setCustomerEmail(updates.getCustomerEmail());
//        existing.setDiscount(updates.getDiscount());
//        existing.setTax(updates.getTax());
//        existing.setPaymentMethod(updates.getPaymentMethod());
//        existing.setPaidAmount(updates.getPaidAmount());
//
//        // Update items
//        if (updates.getItems() != null) {
//            existing.getItems().clear();
//            for (InvoiceItem item : updates.getItems()) {
//                item.setInvoice(existing);
//                existing.getItems().add(item);
//            }
//        }
//
//        // Recalculate totals and payment status
//        calculateInvoiceTotals(existing);
//        updatePaymentStatus(existing);
//
//        Invoice saved = invoiceRepository.save(existing);
//
//        // Update job card status if invoice is now fully paid
//        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
//            updateJobCardStatusToDelivered(saved.getJobCard().getId());
//        }
//
//        return saved;
//    }
//
//    /**
//     * Update job card status to DELIVERED when invoice is fully paid
//     */
//    @Transactional
//    protected void updateJobCardStatusToDelivered(Long jobCardId) {
//        JobCard jobCard = jobCardRepository.findById(jobCardId)
//                .orElseThrow(() -> new RuntimeException("Job card not found"));
//
//        // Only update if status is COMPLETED
//        if (jobCard.getStatus() == JobStatus.COMPLETED) {
//            jobCard.setStatus(JobStatus.DELIVERED);
//            jobCardRepository.save(jobCard);
//
//            notificationService.sendNotification(
//                    NotificationType.DELIVERED,
//                    "Job card " + jobCard.getJobNumber() + " marked as DELIVERED (Invoice fully paid)",
//                    jobCard
//            );
//        }
//    }
//
//    /**
//     * Deduct inventory stock for invoice items (for direct invoices only)
//     */
//    private void deductInventoryForInvoiceItem(Invoice invoice, InvoiceItem item) {
//        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
//                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
//
//        // Only deduct for direct invoices (job card invoices are handled when paid)
//        if (invoice.getJobCard() == null) {
//            List<String> serialNumbers = item.getSerialNumbers();
//
//            inventoryService.deductStockForInvoice(
//                    invItem.getId(),
//                    item.getQuantity(),
//                    serialNumbers,
//                    invoice.getId(),
//                    invoice.getInvoiceNumber(),
//                    "Sold via invoice: " + invoice.getInvoiceNumber()
//            );
//        }
//    }
//
//    private void calculateInvoiceTotals(Invoice invoice) {
//        Double itemsSubtotal = 0.0;
//        if (invoice.getItems() != null) {
//            itemsSubtotal = invoice.getItems().stream()
//                    .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
//                    .sum();
//        }
//
//        // If invoice has a job card, add service categories total
//        Double serviceTotal = 0.0;
//        if (invoice.getJobCard() != null && invoice.getJobCard().getServiceCategories() != null) {
//            serviceTotal = invoice.getJobCard().getServiceCategories().stream()
//                    .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
//                    .sum();
//        }
//
//        Double subtotal = itemsSubtotal + serviceTotal;
//        Double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
//        Double tax = invoice.getTax() != null ? invoice.getTax() : 0.0;
//        Double total = subtotal - discount + tax;
//        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
//        Double balance = total - paidAmount;
//
//        invoice.setSubtotal(subtotal);
//        invoice.setTotal(total);
//        invoice.setBalance(balance);
//    }
//
//    private void updatePaymentStatus(Invoice invoice) {
//        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
//        Double total = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
//
//        if (paidAmount >= total) {
//            invoice.setPaymentStatus(PaymentStatus.PAID);
//            invoice.setBalance(0.0);
//        } else if (paidAmount > 0) {
//            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
//        } else {
//            invoice.setPaymentStatus(PaymentStatus.UNPAID);
//        }
//    }
//
//    @Transactional
//    public void deleteInvoice(Long id, Long deletedBy, String reason) {
//        Invoice invoice = invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//
//        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
//            throw new RuntimeException("Cannot delete a fully paid invoice");
//        }
//
//        invoice.setIsDeleted(true);
//        invoice.setDeletedBy(deletedBy);
//        invoice.setDeletedAt(LocalDateTime.now());
//        invoice.setDeletionReason(reason);
//
//        invoiceRepository.save(invoice);
//
//        notificationService.sendNotification(
//                NotificationType.INVOICE_DELETED,
//                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
//                invoice
//        );
//    }
//
//    /**
//     * Get invoice by ID with items loaded
//     */
//    public Invoice getInvoiceByIdWithItems(Long id) {
//        return invoiceRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Invoice not found"));
//    }
//
//    public List<Invoice> getAllInvoices() {
//        return invoiceRepository.findAll().stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
//        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
//        return invoiceRepository.findAll().stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .filter(invoice -> invoice.getJobCard() != null)
//                .filter(invoice -> invoice.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
//                .toList();
//    }
//
//    public List<Invoice> searchByCustomerOrInvoice(String term) {
//        return invoiceRepository.searchInvoices(term).stream()
//                .filter(invoice -> !invoice.getIsDeleted())
//                .toList();
//    }
//
//    public InvoiceSummary getInvoiceSummary() {
//        List<Invoice> allInvoices = getAllInvoices();
//
//        Double totalRevenue = allInvoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
//                .sum();
//
//        Double totalCollected = allInvoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
//                .sum();
//
//        Double totalOutstanding = allInvoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
//                .sum();
//
//        Long paidCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
//                .count();
//
//        Long partialCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PARTIAL)
//                .count();
//
//        Long unpaidCount = allInvoices.stream()
//                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID)
//                .count();
//
//        return new InvoiceSummary(
//                totalRevenue,
//                totalCollected,
//                totalOutstanding,
//                (long) allInvoices.size(),
//                paidCount,
//                partialCount,
//                unpaidCount
//        );
//    }
//
//    private String generateInvoiceNumber() {
//        return "INV-" + System.currentTimeMillis();
//    }
//
//    // DTO for summary
//    public record InvoiceSummary(
//            Double totalRevenue,
//            Double totalCollected,
//            Double totalOutstanding,
//            Long totalInvoices,
//            Long paidCount,
//            Long partialCount,
//            Long unpaidCount
//    ) {}
//}





package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventorySerialRepository inventorySerialRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        // Generate invoice number
        invoice.setInvoiceNumber(generateInvoiceNumber());

        // Auto-populate used items from job card if not already provided
        if (invoice.getJobCard() != null && (invoice.getItems() == null || invoice.getItems().isEmpty())) {
            autoPopulateItemsFromJobCard(invoice);
        }

        // Calculate totals (INCLUDING SERVICE CATEGORIES)
        calculateInvoiceTotals(invoice);

        // Set payment status based on paid amount
        updatePaymentStatus(invoice);

        // Validate serial numbers before creating invoice
        validateInvoiceSerials(invoice);

        // Set bidirectional relationships for items
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
            }
        }

        // STEP 1: Save the invoice first (without payments) to get an ID
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // STEP 2: Now create payment record if there's an initial payment
        if (savedInvoice.getPaidAmount() != null && savedInvoice.getPaidAmount() > 0) {
            savedInvoice.setFirstPaymentDate(LocalDateTime.now());
            savedInvoice.setLastPaymentDate(LocalDateTime.now());

            // If fully paid, set fully paid date
            if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
                savedInvoice.setFullyPaidDate(LocalDateTime.now());
            }

            // Create payment record for initial payment (invoice now has ID)
            Payment payment = createPaymentRecord(savedInvoice, savedInvoice.getPaidAmount(),
                    savedInvoice.getPaymentMethod(), "Initial payment");

            // Add payment to invoice's payment list
            if (savedInvoice.getPayments() == null) {
                savedInvoice.setPayments(new ArrayList<>());
            }
            savedInvoice.getPayments().add(payment);

            // Update the invoice with payment info
            savedInvoice = invoiceRepository.save(savedInvoice);
        }

        // Deduct inventory stock when invoice is created (for direct invoices only)
        if (savedInvoice.getItems() != null) {
            for (InvoiceItem item : savedInvoice.getItems()) {
                if (item.getInventoryItem() != null && savedInvoice.getJobCard() == null) {
                    deductInventoryForInvoiceItem(savedInvoice, item);
                }
            }
        }

        // If invoice is created as PAID (full payment upfront), process stock
        if (savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            processStockForPaidInvoice(savedInvoice);
        }

        // Update job card status if invoice is fully paid
        if (savedInvoice.getJobCard() != null && savedInvoice.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(savedInvoice.getJobCard().getId());
        }

        notificationService.sendNotification(
                NotificationType.INVOICE_CREATED,
                "Invoice created: " + savedInvoice.getInvoiceNumber() +
                        " | Amount: Rs." + savedInvoice.getTotal() +
                        " | Status: " + savedInvoice.getPaymentStatus(),
                savedInvoice
        );

        return savedInvoice;
    }

    /**
     * Create payment record for tracking individual payments
     */
    private Payment createPaymentRecord(Invoice invoice, Double amount, PaymentMethod method, String notes) {
        // Ensure invoice has been persisted and has an ID
        if (invoice.getId() == null) {
            throw new RuntimeException("Cannot create payment for unsaved invoice");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice); // This invoice should already be persisted
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setNotes(notes);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setReceivedBy(getCurrentUserId());

        return paymentRepository.save(payment);
    }

    /**
     * Get current user ID for audit purposes
     */
    private Long getCurrentUserId() {
        try {
            // Implement based on your authentication system
            // This is a placeholder - replace with actual user ID retrieval
            return 1L;
        } catch (Exception e) {
            return 1L; // Default system user
        }
    }

    @Transactional
    public Invoice addPayment(Long invoiceId, Double amount, PaymentMethod method) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Invoice is already fully paid");
        }

        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }

        if (amount > invoice.getBalance()) {
            throw new RuntimeException("Payment amount cannot exceed balance due");
        }

        // Store old payment status to check if we're transitioning to PAID
        PaymentStatus oldStatus = invoice.getPaymentStatus();
        LocalDateTime paymentTime = LocalDateTime.now();

        // Update paid amount
        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.setBalance(invoice.getTotal() - invoice.getPaidAmount());
        invoice.setPaymentMethod(method);

        // UPDATE PAYMENT DATES
        if (invoice.getFirstPaymentDate() == null) {
            // This is the first payment
            invoice.setFirstPaymentDate(paymentTime);
        }
        // Always update last payment date
        invoice.setLastPaymentDate(paymentTime);

        // If becoming fully paid, set fully paid date
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setFullyPaidDate(paymentTime);
        }

        // Update payment status
        updatePaymentStatus(invoice);

        // CREATE PAYMENT RECORD
        Payment payment = createPaymentRecord(invoice, amount, method, "Payment received");

        // Add to invoice's payment list
        if (invoice.getPayments() == null) {
            invoice.setPayments(new ArrayList<>());
        }
        invoice.getPayments().add(payment);

        Invoice saved = invoiceRepository.save(invoice);

        // Process stock when invoice becomes fully paid
        if (saved.getPaymentStatus() == PaymentStatus.PAID && oldStatus != PaymentStatus.PAID) {
            processStockForPaidInvoice(saved);
        }

        notificationService.sendNotification(
                NotificationType.PAYMENT_RECEIVED,
                "Payment received: Rs." + amount + " for Invoice " + saved.getInvoiceNumber() +
                        " | New Balance: Rs." + saved.getBalance() +
                        " | Payment Date: " + paymentTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                saved
        );

        // Update job card status to DELIVERED if invoice is now fully paid
        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    /**
     * Get payment history for an invoice
     */
    public List<Payment> getPaymentHistory(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
    }

    /**
     * Get total paid amount from payment records (for verification)
     */
    public Double getVerifiedPaidAmount(Long invoiceId) {
        Double verifiedAmount = paymentRepository.getTotalPaidAmountByInvoiceId(invoiceId);
        return verifiedAmount != null ? verifiedAmount : 0.0;
    }

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updates) {
        Invoice existing = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (existing.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Cannot update a fully paid invoice");
        }

        // Store old paid amount to check if we need to update payment dates
        Double oldPaidAmount = existing.getPaidAmount();

        // Update basic fields
        existing.setCustomerName(updates.getCustomerName());
        existing.setCustomerPhone(updates.getCustomerPhone());
        existing.setCustomerEmail(updates.getCustomerEmail());
        existing.setDiscount(updates.getDiscount());
        existing.setTax(updates.getTax());
        existing.setPaymentMethod(updates.getPaymentMethod());
        existing.setPaidAmount(updates.getPaidAmount());

        // Update items
        if (updates.getItems() != null) {
            existing.getItems().clear();
            for (InvoiceItem item : updates.getItems()) {
                item.setInvoice(existing);
                existing.getItems().add(item);
            }
        }

        // Recalculate totals and payment status
        calculateInvoiceTotals(existing);
        updatePaymentStatus(existing);

        // Update payment dates if paid amount changed
        if (!oldPaidAmount.equals(existing.getPaidAmount())) {
            updatePaymentDates(existing, oldPaidAmount);
        }

        Invoice saved = invoiceRepository.save(existing);

        // Update job card status if invoice is now fully paid
        if (saved.getJobCard() != null && saved.getPaymentStatus() == PaymentStatus.PAID) {
            updateJobCardStatusToDelivered(saved.getJobCard().getId());
        }

        return saved;
    }

    /**
     * Update payment dates when paid amount changes
     */
    private void updatePaymentDates(Invoice invoice, Double oldPaidAmount) {
        LocalDateTime now = LocalDateTime.now();

        if (invoice.getPaidAmount() > 0 && invoice.getFirstPaymentDate() == null) {
            // First payment
            invoice.setFirstPaymentDate(now);
            invoice.setLastPaymentDate(now);

            // Create payment record for the initial payment
            if (invoice.getId() != null) {
                createPaymentRecord(invoice, invoice.getPaidAmount(),
                        invoice.getPaymentMethod(), "Initial payment (via update)");
            }
        } else if (invoice.getPaidAmount() > oldPaidAmount) {
            // Additional payment
            invoice.setLastPaymentDate(now);

            // Create payment record for additional payment
            if (invoice.getId() != null) {
                Double additionalAmount = invoice.getPaidAmount() - oldPaidAmount;
                createPaymentRecord(invoice, additionalAmount,
                        invoice.getPaymentMethod(), "Additional payment (via update)");
            }
        }

        // Check if fully paid
        if (invoice.getPaidAmount() >= invoice.getTotal()) {
            invoice.setFullyPaidDate(now);
        } else {
            invoice.setFullyPaidDate(null);
        }
    }

    /**
     * Auto-populate invoice items from job card used items with serial numbers
     */
    private void autoPopulateItemsFromJobCard(Invoice invoice) {
        if (invoice.getJobCard() == null) return;

        JobCard jobCard = jobCardRepository.findById(invoice.getJobCard().getId())
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        if (jobCard.getUsedItems() != null && !jobCard.getUsedItems().isEmpty()) {
            List<InvoiceItem> invoiceItems = new ArrayList<>();

            for (UsedItem usedItem : jobCard.getUsedItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(invoice);
                invoiceItem.setInventoryItem(usedItem.getInventoryItem());
                invoiceItem.setItemName(usedItem.getInventoryItem().getName());
                invoiceItem.setQuantity(usedItem.getQuantityUsed());
                invoiceItem.setUnitPrice(usedItem.getUnitPrice());
                invoiceItem.setTotal(usedItem.getQuantityUsed() * usedItem.getUnitPrice());
                invoiceItem.setWarranty(usedItem.getWarrantyPeriod() != null ?
                        usedItem.getWarrantyPeriod() : "No Warranty");

                // Transfer serial numbers from used item to invoice item
                if (usedItem.getUsedSerialNumbers() != null && !usedItem.getUsedSerialNumbers().isEmpty()) {
                    invoiceItem.setSerialNumbers(new ArrayList<>(usedItem.getUsedSerialNumbers()));
                } else {
                    invoiceItem.setSerialNumbers(new ArrayList<>());
                }

                invoiceItems.add(invoiceItem);
            }

            invoice.setItems(invoiceItems);
        }
    }

    /**
     * Validate that serial numbers are available for invoice items
     */
    private void validateInvoiceSerials(Invoice invoice) {
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() != null && item.getInventoryItem().getHasSerialization()) {
                    if (item.getSerialNumbers() == null || item.getSerialNumbers().isEmpty()) {
                        throw new RuntimeException("Serial numbers required for item: " + item.getItemName());
                    }

                    if (item.getSerialNumbers().size() != item.getQuantity()) {
                        throw new RuntimeException("Number of serials must match quantity for item: " + item.getItemName());
                    }

                    // Validate each serial is available
                    for (String serialNumber : item.getSerialNumbers()) {
                        InventorySerial serial = inventorySerialRepository.findBySerialNumber(serialNumber)
                                .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                        if (serial.getStatus() != SerialStatus.AVAILABLE) {
                            throw new RuntimeException("Serial number not available: " + serialNumber);
                        }
                    }
                }
            }
        }
    }

    /**
     * Process stock for paid invoice (mark serials as SOLD and update quantities)
     */
    private void processStockForPaidInvoice(Invoice invoice) {
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getInventoryItem() != null) {
                    if (item.getInventoryItem().getHasSerialization()) {
                        // For serialized items, mark serials as SOLD
                        if (item.getSerialNumbers() != null && !item.getSerialNumbers().isEmpty()) {
                            markSerialsAsSoldForInvoice(item, invoice);
                        }
                    }

                    // Update inventory quantity for both serialized and non-serialized items
                    updateInventoryQuantityForInvoiceItem(item, invoice);
                }
            }
        }
    }

    /**
     * Mark serial numbers as SOLD for invoice
     */
    private void markSerialsAsSoldForInvoice(InvoiceItem item, Invoice invoice) {
        for (String serialNumber : item.getSerialNumbers()) {
            try {
                InventorySerial inventorySerial = inventorySerialRepository.findBySerialNumber(serialNumber)
                        .orElseThrow(() -> new RuntimeException("Serial number not found: " + serialNumber));

                // Only mark as SOLD if not already sold
                if (inventorySerial.getStatus() == SerialStatus.AVAILABLE) {
                    inventorySerial.setStatus(SerialStatus.SOLD);
                    inventorySerial.setUsedAt(LocalDateTime.now());
                    inventorySerial.setUsedBy(getCurrentUsername());
                    inventorySerial.setUsedInReferenceType("INVOICE");
                    inventorySerial.setUsedInReferenceId(invoice.getId());
                    inventorySerial.setUsedInReferenceNumber(invoice.getInvoiceNumber());
                    inventorySerial.setNotes("Sold via invoice payment");
                    inventorySerialRepository.save(inventorySerial);

                    // Record stock movement for serial
                    recordStockMovementForSerial(item.getInventoryItem(), invoice, serialNumber);
                }
            } catch (Exception e) {
                // Log error but don't fail the entire payment process
                System.err.println("Failed to mark serial as SOLD: " + serialNumber + " - " + e.getMessage());
            }
        }
    }

    /**
     * Update inventory quantity for invoice items
     */
    private void updateInventoryQuantityForInvoiceItem(InvoiceItem item, Invoice invoice) {
        try {
            InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                    .orElseThrow(() -> new RuntimeException("Inventory item not found"));

            int quantityToDeduct = item.getQuantity();
            int previousQuantity = invItem.getQuantity();
            int newQuantity = previousQuantity - quantityToDeduct;

            if (newQuantity < 0) {
                throw new RuntimeException("Not enough stock for item: " + invItem.getName());
            }

            invItem.setQuantity(newQuantity);
            inventoryItemRepository.save(invItem);

            // Record stock movement for quantity update
            recordStockMovementForQuantity(invItem, invoice, quantityToDeduct, previousQuantity, newQuantity);

        } catch (Exception e) {
            System.err.println("Failed to update inventory quantity for item: " + item.getItemName() + " - " + e.getMessage());
        }
    }

    /**
     * Record stock movement for serial
     */
    private void recordStockMovementForSerial(InventoryItem item, Invoice invoice, String serialNumber) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.OUT);
            movement.setQuantity(1);
            movement.setReferenceType("INVOICE");
            movement.setReferenceId(invoice.getId());
            movement.setReferenceNumber(invoice.getInvoiceNumber());
            movement.setReason("Serial sold via invoice payment");
            movement.setSerialNumber(serialNumber);
            movement.setPerformedBy(getCurrentUsername());
            movement.setPreviousQuantity(item.getQuantity() + 1);
            movement.setNewQuantity(item.getQuantity());
            movement.setCreatedAt(LocalDateTime.now());

            stockMovementRepository.save(movement);
        } catch (Exception e) {
            System.err.println("Failed to record stock movement for serial: " + e.getMessage());
        }
    }

    /**
     * Record stock movement for quantity update
     */
    private void recordStockMovementForQuantity(InventoryItem item, Invoice invoice, Integer quantity,
                                                Integer previousQuantity, Integer newQuantity) {
        try {
            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(MovementType.OUT);
            movement.setQuantity(quantity);
            movement.setReferenceType("INVOICE");
            movement.setReferenceId(invoice.getId());
            movement.setReferenceNumber(invoice.getInvoiceNumber());
            movement.setReason("Quantity sold via invoice payment");
            movement.setPerformedBy(getCurrentUsername());
            movement.setPreviousQuantity(previousQuantity);
            movement.setNewQuantity(newQuantity);
            movement.setCreatedAt(LocalDateTime.now());

            stockMovementRepository.save(movement);
        } catch (Exception e) {
            System.err.println("Failed to record stock movement: " + e.getMessage());
        }
    }

    /**
     * Get current username for audit purposes
     */
    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    /**
     * Update job card status to DELIVERED when invoice is fully paid
     */
    @Transactional
    protected void updateJobCardStatusToDelivered(Long jobCardId) {
        JobCard jobCard = jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Only update if status is COMPLETED
        if (jobCard.getStatus() == JobStatus.COMPLETED) {
            jobCard.setStatus(JobStatus.DELIVERED);
            jobCardRepository.save(jobCard);

            notificationService.sendNotification(
                    NotificationType.DELIVERED,
                    "Job card " + jobCard.getJobNumber() + " marked as DELIVERED (Invoice fully paid)",
                    jobCard
            );
        }
    }

    /**
     * Deduct inventory stock for invoice items (for direct invoices only)
     */
    private void deductInventoryForInvoiceItem(Invoice invoice, InvoiceItem item) {
        InventoryItem invItem = inventoryItemRepository.findById(item.getInventoryItem().getId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        // Only deduct for direct invoices (job card invoices are handled when paid)
        if (invoice.getJobCard() == null) {
            List<String> serialNumbers = item.getSerialNumbers();

            inventoryService.deductStockForInvoice(
                    invItem.getId(),
                    item.getQuantity(),
                    serialNumbers,
                    invoice.getId(),
                    invoice.getInvoiceNumber(),
                    "Sold via invoice: " + invoice.getInvoiceNumber()
            );
        }
    }

    /**
     * CALCULATE TOTALS INCLUDING SERVICE CATEGORIES - FIXED VERSION
     */
    private void calculateInvoiceTotals(Invoice invoice) {
        // Calculate items subtotal
        Double itemsSubtotal = 0.0;
        if (invoice.getItems() != null) {
            itemsSubtotal = invoice.getItems().stream()
                    .mapToDouble(item -> {
                        if (item.getQuantity() != null && item.getUnitPrice() != null) {
                            return item.getQuantity() * item.getUnitPrice();
                        }
                        return 0.0;
                    })
                    .sum();
        }

        // Calculate service total from job card service categories
        Double serviceTotal = 0.0;
        if (invoice.getJobCard() != null && invoice.getJobCard().getServiceCategories() != null) {
            serviceTotal = invoice.getJobCard().getServiceCategories().stream()
                    .mapToDouble(sc -> sc.getServicePrice() != null ? sc.getServicePrice() : 0.0)
                    .sum();
        }

        // Calculate combined subtotal (ITEMS + SERVICES)
        Double combinedSubtotal = itemsSubtotal + serviceTotal;
        Double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
        Double tax = invoice.getTax() != null ? invoice.getTax() : 0.0;

        // FIX: Total should be calculated from combinedSubtotal (items + services)
        Double total = combinedSubtotal - discount + tax;
        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        Double balance = total - paidAmount;

        // SET ALL THE TOTALS
        invoice.setItemsSubtotal(itemsSubtotal);
        invoice.setServiceTotal(serviceTotal);
        invoice.setSubtotal(combinedSubtotal); // This is now items + services
        invoice.setTotal(total); // This now includes services
        invoice.setBalance(balance);
    }

    private void updatePaymentStatus(Invoice invoice) {
        Double paidAmount = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
        Double total = invoice.getTotal() != null ? invoice.getTotal() : 0.0;

        if (paidAmount >= total) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setBalance(0.0);
        } else if (paidAmount > 0) {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
        }
    }

    @Transactional
    public void deleteInvoice(Long id, Long deletedBy, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Cannot delete a fully paid invoice");
        }

        invoice.setIsDeleted(true);
        invoice.setDeletedBy(deletedBy);
        invoice.setDeletedAt(LocalDateTime.now());
        invoice.setDeletionReason(reason);

        invoiceRepository.save(invoice);

        notificationService.sendNotification(
                NotificationType.INVOICE_DELETED,
                "Invoice deleted: " + invoice.getInvoiceNumber() + " | Reason: " + reason,
                invoice
        );
    }

    /**
     * Get invoice by ID with items loaded
     */
    public Invoice getInvoiceByIdWithItems(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public List<Invoice> getInvoicesByDateRange(LocalDateTime start, LocalDateTime end) {
        return invoiceRepository.findByCreatedAtBetween(start, end).stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public List<Invoice> searchByJobCardNumber(String jobCardNumber) {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .filter(invoice -> invoice.getJobCard() != null)
                .filter(invoice -> invoice.getJobCard().getJobNumber().toLowerCase().contains(jobCardNumber.toLowerCase()))
                .toList();
    }

    public List<Invoice> searchByCustomerOrInvoice(String term) {
        return invoiceRepository.searchInvoices(term).stream()
                .filter(invoice -> !invoice.getIsDeleted())
                .toList();
    }

    public InvoiceSummary getInvoiceSummary() {
        List<Invoice> allInvoices = getAllInvoices();

        Double totalRevenue = allInvoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        Double totalCollected = allInvoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double totalOutstanding = allInvoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        Long paidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .count();

        Long partialCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PARTIAL)
                .count();

        Long unpaidCount = allInvoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID)
                .count();

        return new InvoiceSummary(
                totalRevenue,
                totalCollected,
                totalOutstanding,
                (long) allInvoices.size(),
                paidCount,
                partialCount,
                unpaidCount
        );
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    // DTO for summary
    public record InvoiceSummary(
            Double totalRevenue,
            Double totalCollected,
            Double totalOutstanding,
            Long totalInvoices,
            Long paidCount,
            Long partialCount,
            Long unpaidCount
    ) {}
}