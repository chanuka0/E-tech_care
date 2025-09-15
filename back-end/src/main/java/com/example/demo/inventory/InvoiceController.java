package com.example.demo.inventory;


import com.example.demo.inventory.dto.InvoiceCreateRequest;
import com.example.demo.inventory.dto.InvoiceResponse;
//import com.example.demo.invoice.InvoiceStatus;
//import com.example.demo.invoice.dto.*;
//import com.example.demo.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        try {
            return ResponseEntity.ok(invoiceService.getAllInvoices());
        } catch (Exception e) {
            log.error("Error fetching invoices", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id) {
        try {
            InvoiceResponse response = invoiceService.getInvoiceById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching invoice with id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<?> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        try {
            InvoiceResponse response = invoiceService.getInvoiceByNumber(invoiceNumber);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching invoice with number: {}", invoiceNumber, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<?> getInvoiceByJobCardId(@PathVariable Long jobCardId) {
        try {
            InvoiceResponse response = invoiceService.getInvoiceByJobCardId(jobCardId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching invoice for job card id: {}", jobCardId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        try {
            InvoiceResponse response = invoiceService.createInvoice(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating invoice", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvoice(@PathVariable Long id,
                                           @Valid @RequestBody InvoiceUpdateRequest request) {
        try {
            InvoiceResponse response = invoiceService.updateInvoice(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating invoice with id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markAsPaid(@PathVariable Long id) {
        try {
            InvoiceResponse response = invoiceService.markAsPaid(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking invoice as paid: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(@PathVariable InvoiceStatus status) {
        try {
            return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
        } catch (Exception e) {
            log.error("Error fetching invoices by status: {}", status, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<InvoiceResponse>> searchInvoices(@RequestParam(required = false) String q) {
        try {
            return ResponseEntity.ok(invoiceService.searchInvoices(q));
        } catch (Exception e) {
            log.error("Error searching invoices", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            return ResponseEntity.ok(invoiceService.getInvoicesByDateRange(startDate, endDate));
        } catch (Exception e) {
            log.error("Error fetching invoices by date range", e);
            return ResponseEntity.badRequest().build();
        }
    }
}