package com.example.demo.inventory;

//import com.example.demo.invoice.*;
//import com.example.demo.invoice.dto.*;
//import com.example.demo.invoice.repository.InvoiceRepository;
//import com.example.demo.inventory.repository.JobCardItemRepository;
import com.example.demo.inventory.dto.InvoiceCreateRequest;
import com.example.demo.inventory.dto.InvoiceResponse;
import com.example.demo.job_card.JobCard;
import com.example.demo.job_card.JobCardRepository;
import com.example.demo.job_card.JobStatus;
import com.example.demo.users.User;
import com.example.demo.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final JobCardItemRepository jobCardItemRepository;
    private final UserRepository userRepository;

    public List<InvoiceResponse> getAllInvoices() {
        log.debug("Fetching all invoices");
        return invoiceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse getInvoiceById(Long id) {
        log.debug("Fetching invoice with id: {}", id);
        Invoice invoice = findInvoiceById(id);
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        log.debug("Fetching invoice with number: {}", invoiceNumber);
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Invoice not found with number: " + invoiceNumber));
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceByJobCardId(Long jobCardId) {
        log.debug("Fetching invoice for job card id: {}", jobCardId);
        Invoice invoice = invoiceRepository.findByJobCard_Id(jobCardId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for job card id: " + jobCardId));
        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        log.info("Creating invoice for job card id: {}", request.getJobCardId());

        JobCard jobCard = findJobCardById(request.getJobCardId());

        // Check if invoice already exists for this job card
        if (invoiceRepository.findByJobCard_Id(request.getJobCardId()).isPresent()) {
            throw new RuntimeException("Invoice already exists for this job card");
        }

        // Get current user
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate items total
        BigDecimal itemsTotal = jobCardItemRepository.calculateTotalForJobCard(request.getJobCardId());
        if (itemsTotal == null) {
            itemsTotal = BigDecimal.ZERO;
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setJobCard(jobCard);
        invoice.setCustomerName(jobCard.getCustomerName());
        invoice.setCustomerContact(jobCard.getContactNumber());
        invoice.setItemsTotal(itemsTotal);
        invoice.setServiceCharge(request.getServiceCharge());
        invoice.setDiscount(request.getDiscount());
        invoice.setAdvancePayment(jobCard.getAdvanceAmount());
        invoice.setNotes(request.getNotes());
        invoice.setWarrantyDetails(request.getWarrantyDetails());
        invoice.setCreatedBy(user);

        // Calculate total amount
        BigDecimal totalAmount = itemsTotal
                .add(request.getServiceCharge())
                .subtract(request.getDiscount());
        invoice.setTotalAmount(totalAmount);

        // Update job card status to COMPLETED
        jobCard.setStatus(JobStatus.COMPLETED);
        jobCardRepository.save(jobCard);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice created successfully with number: {}", savedInvoice.getInvoiceNumber());

        return mapToResponse(savedInvoice);
    }

    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceUpdateRequest request) {
        log.info("Updating invoice with id: {}", id);

        Invoice invoice = findInvoiceById(id);
        updateInvoiceFields(invoice, request);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice updated successfully: {}", savedInvoice.getInvoiceNumber());

        return mapToResponse(savedInvoice);
    }

    @Transactional
    public InvoiceResponse markAsPaid(Long id) {
        log.info("Marking invoice as paid: {}", id);

        Invoice invoice = findInvoiceById(id);
        invoice.setStatus(InvoiceStatus.PAID);

        // Update job card status to DELIVERED
        invoice.getJobCard().setStatus(JobStatus.DELIVERED);
        invoice.getJobCard().setActualDeliveryDate(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        jobCardRepository.save(invoice.getJobCard());

        log.info("Invoice marked as paid: {}", savedInvoice.getInvoiceNumber());
        return mapToResponse(savedInvoice);
    }

    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        log.debug("Fetching invoices with status: {}", status);
        return invoiceRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> searchInvoices(String searchTerm) {
        log.debug("Searching invoices with term: {}", searchTerm);
        return invoiceRepository.searchInvoices(searchTerm)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Fetching invoices between {} and {}", startDate, endDate);
        return invoiceRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Private helper methods
    private JobCard findJobCardById(Long jobCardId) {
        return jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found with id: " + jobCardId));
    }

    private Invoice findInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    private synchronized String generateInvoiceNumber() {
        Integer maxNumber = invoiceRepository.findMaxInvoiceNumber();
        if (maxNumber == null) {
            maxNumber = 0;
        }
        String invoiceNumber = String.format("INV%06d", maxNumber + 1);
        log.debug("Generated invoice number: {}", invoiceNumber);
        return invoiceNumber;
    }

    private void updateInvoiceFields(Invoice invoice, InvoiceUpdateRequest request) {
        if (request.getServiceCharge() != null) {
            invoice.setServiceCharge(request.getServiceCharge());
        }
        if (request.getDiscount() != null) {
            invoice.setDiscount(request.getDiscount());
        }
        if (request.getAdvancePayment() != null) {
            invoice.setAdvancePayment(request.getAdvancePayment());
        }
        if (request.getNotes() != null) {
            invoice.setNotes(request.getNotes());
        }
        if (request.getWarrantyDetails() != null) {
            invoice.setWarrantyDetails(request.getWarrantyDetails());
        }
        if (request.getStatus() != null) {
            invoice.setStatus(request.getStatus());
        }

        // Recalculate total amount
        BigDecimal totalAmount = invoice.getItemsTotal()
                .add(invoice.getServiceCharge())
                .subtract(invoice.getDiscount());
        invoice.setTotalAmount(totalAmount);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setJobCardId(invoice.getJobCard().getId());
        response.setJobCardNumber(invoice.getJobCard().getJobCardNumber());
        response.setCustomerName(invoice.getCustomerName());
        response.setCustomerContact(invoice.getCustomerContact());
        response.setItemsTotal(invoice.getItemsTotal());
        response.setServiceCharge(invoice.getServiceCharge());
        response.setDiscount(invoice.getDiscount());
        response.setAdvancePayment(invoice.getAdvancePayment());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setBalanceAmount(invoice.getBalanceAmount());
        response.setNotes(invoice.getNotes());
        response.setWarrantyDetails(invoice.getWarrantyDetails());
        response.setStatus(invoice.getStatus());
        response.setStatusDisplayName(invoice.getStatus().getDisplayName());
        response.setCreatedByUsername(invoice.getCreatedBy().getUserName());
        response.setCreatedDate(invoice.getCreatedDate());
        response.setUpdatedDate(invoice.getUpdatedDate());

        // Add invoice items
        List<InvoiceItemResponse> items = jobCardItemRepository.findByJobCard_Id(invoice.getJobCard().getId())
                .stream()
                .map(this::mapToInvoiceItemResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }

    private InvoiceItemResponse mapToInvoiceItemResponse(com.example.demo.inventory.JobCardItem jobCardItem) {
        InvoiceItemResponse response = new InvoiceItemResponse();
        response.setId(jobCardItem.getId());
        response.setItemName(jobCardItem.getInventoryItem().getName());
        response.setQuantity(jobCardItem.getQuantityUsed());
        response.setUnitPrice(jobCardItem.getUnitPrice());
        response.setTotalPrice(jobCardItem.getTotalPrice());
        response.setNotes(jobCardItem.getNotes());
        return response;
    }
}