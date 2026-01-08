//package com.example.demo.controller;
//
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.Payment;
//import com.example.demo.entity.PaymentMethod;
//import com.example.demo.service.InvoiceService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/invoices")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class InvoiceController {
//    private final InvoiceService invoiceService;
//
//    /**
//     * Create a new invoice with items
//     */
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
//        return ResponseEntity.ok(invoiceService.createInvoice(invoice));
//    }
//
//    /**
//     * Get all invoices (excluding deleted ones)
//     */
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> getAllInvoices() {
//        return ResponseEntity.ok(invoiceService.getAllInvoices());
//    }
//
//    /**
//     * Get invoice by ID with all items loaded
//     * IMPORTANT: This uses getInvoiceByIdWithItems to ensure items are loaded
//     */
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
//        // Use getInvoiceByIdWithItems to ensure items are loaded
//        return ResponseEntity.ok(invoiceService.getInvoiceByIdWithItems(id));
//    }
//
//
//    /**
//     * Update invoice details (customer info, discount, tax, etc.)
//     */
//    @PutMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> updateInvoice(
//            @PathVariable Long id,
//            @RequestBody Invoice invoiceDetails) {
//        return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDetails));
//    }
//
//    /**
//     * Add payment to invoice
//     */
//    @PostMapping("/{id}/payment")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> addPayment(
//            @PathVariable Long id,
//            @RequestBody Map<String, Object> paymentData) {
//
//        Double amount = Double.valueOf(paymentData.get("amount").toString());
//        PaymentMethod method = PaymentMethod.valueOf((String) paymentData.get("method"));
//
//        return ResponseEntity.ok(invoiceService.addPayment(id, amount, method));
//    }
//
//    /**
//     * Get payment history for an invoice
//     */
//    @GetMapping("/{id}/payments")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long id) {
//        return ResponseEntity.ok(invoiceService.getPaymentHistory(id));
//    }
//
//    /**
//     * Get invoices by date range
//     */
//    @GetMapping("/range")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
//        return ResponseEntity.ok(invoiceService.getInvoicesByDateRange(start, end));
//    }
//
//    /**
//     * Search invoices by job card number
//     */
//    @GetMapping("/search/jobcard/{jobCardNumber}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> searchByJobCard(
//            @PathVariable String jobCardNumber) {
//        return ResponseEntity.ok(invoiceService.searchByJobCardNumber(jobCardNumber));
//    }
//
//    /**
//     * Search invoices by customer name or invoice number
//     */
//    @GetMapping("/search/customer")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> searchByCustomerOrInvoice(
//            @RequestParam String term) {
//        return ResponseEntity.ok(invoiceService.searchByCustomerOrInvoice(term));
//    }
//
//    /**
//     * Delete invoice (soft delete - mark as deleted)
//     */
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Map<String, String>> deleteInvoice(
//            @PathVariable Long id,
//            @RequestBody Map<String, String> deleteData) {
//
//        String reason = deleteData.get("reason");
//        invoiceService.deleteInvoice(id, getUserIdFromToken(), reason);
//
//        return ResponseEntity.ok(Map.of(
//                "message", "Invoice deleted successfully",
//                "invoiceId", id.toString()
//        ));
//    }
//
//    /**
//     * Get invoice summary/statistics
//     */
//    @GetMapping("/summary/stats")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<InvoiceService.InvoiceSummary> getInvoiceSummary() {
//        return ResponseEntity.ok(invoiceService.getInvoiceSummary());
//    }
//
//    /**
//     * Extract user ID from JWT token
//     * Implement based on your JWT provider
//     */
//    private Long getUserIdFromToken() {
//        // TODO: Extract from JWT token
//        // For now, return default user ID
//        return 1L;
//    }
//}






package com.example.demo.controller;

import com.example.demo.entity.Invoice;
import com.example.demo.entity.Payment;
import com.example.demo.entity.PaymentMethod;
import com.example.demo.service.CreateInvoiceRequest;
import com.example.demo.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {
    private final InvoiceService invoiceService;

    /**
     * Create a new invoice with items
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice) {
        try {
            return ResponseEntity.ok(invoiceService.createInvoice(invoice));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * Create invoice from job card
     */
    @PostMapping("/from-jobcard/{jobCardId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> createInvoiceFromJobCard(
            @PathVariable Long jobCardId,
            @RequestBody CreateInvoiceRequest request) {
        try {
            return ResponseEntity.ok(invoiceService.createInvoiceFromJobCard(jobCardId, request));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * Create direct invoice
     */
    @PostMapping("/direct")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> createDirectInvoice(@RequestBody CreateInvoiceRequest request) {
        try {
            return ResponseEntity.ok(invoiceService.createDirectInvoice(request));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * Get all invoices (excluding deleted ones)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    /**
     * Get invoice by ID with all items loaded
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceByIdWithItems(id));
    }

    /**
     * Update invoice details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice invoiceDetails) {
        try {
            return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDetails));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * Add payment to invoice
     */
    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentData) {

        try {
            Double amount = Double.valueOf(paymentData.get("amount").toString());
            PaymentMethod method = PaymentMethod.valueOf((String) paymentData.get("method"));

            return ResponseEntity.ok(invoiceService.addPayment(id, amount, method));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * Get payment history for an invoice
     */
    @GetMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getPaymentHistory(id));
    }

    /**
     * Get invoices by date range
     */
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(invoiceService.getInvoicesByDateRange(start, end));
    }

    /**
     * Search invoices by job card number
     */
    @GetMapping("/search/jobcard/{jobCardNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> searchByJobCard(
            @PathVariable String jobCardNumber) {
        return ResponseEntity.ok(invoiceService.searchByJobCardNumber(jobCardNumber));
    }

    /**
     * Search invoices by customer name or invoice number
     */
    @GetMapping("/search/customer")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> searchByCustomerOrInvoice(
            @RequestParam String term) {
        return ResponseEntity.ok(invoiceService.searchByCustomerOrInvoice(term));
    }

    /**
     * Delete invoice (soft delete - mark as deleted)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, String>> deleteInvoice(
            @PathVariable Long id,
            @RequestBody Map<String, String> deleteData) {

        String reason = deleteData.get("reason");
        invoiceService.deleteInvoice(id, getUserIdFromToken(), reason);

        return ResponseEntity.ok(Map.of(
                "message", "Invoice deleted successfully",
                "invoiceId", id.toString()
        ));
    }

    /**
     * Get invoice summary/statistics
     */
    @GetMapping("/summary/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<InvoiceService.InvoiceSummary> getInvoiceSummary() {
        return ResponseEntity.ok(invoiceService.getInvoiceSummary());
    }

    /**
     * Extract user ID from JWT token
     */
    private Long getUserIdFromToken() {
        // TODO: Extract from JWT token
        // For now, return default user ID
        return 1L;
    }
}