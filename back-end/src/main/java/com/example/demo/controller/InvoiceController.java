//package com.example.demo.controller;
//
//
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.PaymentMethod;
//import com.example.demo.services.InvoiceService;
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
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
//        return ResponseEntity.ok(invoiceService.createInvoice(invoice));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> getAllInvoices() {
//        return ResponseEntity.ok(invoiceService.getAllInvoices());
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
//        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
//    }
//
//    @PostMapping("/{id}/payment")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Invoice> addPayment(
//            @PathVariable Long id,
//            @RequestBody Map<String, Object> paymentData) {
//        Double amount = Double.valueOf(paymentData.get("amount").toString());
//        PaymentMethod method = PaymentMethod.valueOf((String) paymentData.get("method"));
//
//        return ResponseEntity.ok(invoiceService.addPayment(id, amount, method));
//    }
//
//    @GetMapping("/range")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
//        return ResponseEntity.ok(invoiceService.getInvoicesByDateRange(start, end));
//    }
//}
package com.example.demo.controller;

import com.example.demo.entity.Invoice;
import com.example.demo.entity.PaymentMethod;
import com.example.demo.services.InvoiceService;
//import com.example.demo.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
    //private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        return ResponseEntity.ok(invoiceService.createInvoice(invoice));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Invoice> addPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentData) {
        Double amount = Double.valueOf(paymentData.get("amount").toString());
        PaymentMethod method = PaymentMethod.valueOf((String) paymentData.get("method"));

        return ResponseEntity.ok(invoiceService.addPayment(id, amount, method));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(invoiceService.getInvoicesByDateRange(start, end));
    }

    // NEW: Search by job card number
    @GetMapping("/search/jobcard/{jobCardNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> searchByJobCard(@PathVariable String jobCardNumber) {
        return ResponseEntity.ok(invoiceService.searchByJobCardNumber(jobCardNumber));
    }

    // NEW: Search by customer or invoice number
    @GetMapping("/search/customer-invoice")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Invoice>> searchByCustomerOrInvoice(
            @RequestParam String term) {
        return ResponseEntity.ok(invoiceService.searchByCustomerOrInvoice(term));
    }

    // NEW: Delete invoice
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, String>> deleteInvoice(
            @PathVariable Long id,
            @RequestBody Map<String, String> deleteData) {
        Invoice invoice = invoiceService.getInvoiceById(id);

        // Authorization check
        // Admin can delete PAID invoices
        // Anyone can delete UNPAID/PARTIAL invoices
        boolean isAdmin = true; // Get from JWT token
        if ("PAID".equals(invoice.getPaymentStatus().toString()) && !isAdmin) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Only admin can delete paid invoices"
            ));
        }

        String reason = deleteData.get("reason");
        invoiceService.deleteInvoice(id, getUserIdFromToken(), reason);

        return ResponseEntity.ok(Map.of(
                "message", "Invoice deleted successfully",
                "invoiceNumber", invoice.getInvoiceNumber()
        ));
    }

    private Long getUserIdFromToken() {
        // Extract from JWT token - implement based on your JWT provider
        return 1L;
    }
}