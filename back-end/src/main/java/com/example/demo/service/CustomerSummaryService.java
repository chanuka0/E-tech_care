//package com.example.demo.service;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Propagation;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Log4j2
//@Service
//@RequiredArgsConstructor
//public class CustomerSummaryService {
//
//    private final CustomerRepository customerRepository;
//    private final CustomerSummaryRepository customerSummaryRepository;
//    private final JobCardRepository jobCardRepository;
//    private final InvoiceRepository invoiceRepository;
//
//    @Transactional
//    protected void cleanupDuplicatesForCustomer(Long customerId) {
//        try {
//            List<CustomerSummary> summaries = customerSummaryRepository.findAllByCustomerId(customerId);
//
//            if (summaries.size() > 1) {
//                log.warn("Found {} duplicate summaries for customer ID: {}. Cleaning up...", summaries.size(), customerId);
//                CustomerSummary keepSummary = summaries.get(0);
//                for (int i = 1; i < summaries.size(); i++) {
//                    customerSummaryRepository.delete(summaries.get(i));
//                    log.info("Deleted duplicate summary ID: {} for customer: {}", summaries.get(i).getId(), customerId);
//                }
//            }
//        } catch (Exception e) {
//            log.error("Error cleaning duplicates for customer {}: {}", customerId, e.getMessage());
//        }
//    }
//
//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    public CustomerSummary getOrCreateSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        cleanupDuplicatesForCustomer(customerId);
//
//        Optional<CustomerSummary> existingSummary = customerSummaryRepository.findByCustomerId(customerId);
//
//        if (existingSummary.isPresent()) {
//            return existingSummary.get();
//        }
//
//        CustomerSummary newSummary = new CustomerSummary();
//        newSummary.setCustomer(customer);
//        newSummary.setCreatedAt(LocalDateTime.now());
//        newSummary.setLastUpdated(LocalDateTime.now());
//
//        log.info("Creating new CustomerSummary for customer ID: {}", customerId);
//        return customerSummaryRepository.save(newSummary);
//    }
//
//    @Transactional
//    public CustomerSummary updateSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        CustomerSummary summary = getOrCreateSummary(customerId);
//
//        // Get job cards ONLY for this specific customer ID
//        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//        int totalJobs = jobCards.size();
//        int completedJobs = (int) jobCards.stream()
//                .filter(job -> job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.DELIVERED)
//                .count();
//        int pendingJobs = (int) jobCards.stream()
//                .filter(job -> job.getStatus() == JobStatus.PENDING ||
//                        job.getStatus() == JobStatus.IN_PROGRESS ||
//                        job.getStatus() == JobStatus.WAITING_FOR_PARTS ||
//                        job.getStatus() == JobStatus.WAITING_FOR_APPROVAL)
//                .count();
//        int cancelledJobs = (int) jobCards.stream()
//                .filter(job -> job.getStatus() == JobStatus.CANCELLED)
//                .count();
//
//        summary.updateJobStats(totalJobs, completedJobs, pendingJobs, cancelledJobs);
//
//        Double totalServiceCost = jobCards.stream()
//                .mapToDouble(job -> job.getTotalServicePrice() != null ? job.getTotalServicePrice() : 0.0)
//                .sum();
//
//        // Get invoices ONLY for job cards belonging to this customer
//        List<Long> jobCardIds = jobCards.stream().map(JobCard::getId).collect(Collectors.toList());
//        List<Invoice> invoices = jobCardIds.isEmpty() ?
//                List.of() :
//                invoiceRepository.findByJobCardIdIn(jobCardIds);
//
//        Double totalPaid = invoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
//                .sum();
//
//        Double outstandingBalance = invoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
//                .sum();
//
//        summary.updateFinancialStats(totalServiceCost, totalPaid, outstandingBalance);
//
//        jobCards.stream()
//                .map(JobCard::getCreatedAt)
//                .max(LocalDateTime::compareTo)
//                .ifPresent(summary::updateLastJobDate);
//
//        invoices.stream()
//                .filter(inv -> inv.getPaidAmount() != null && inv.getPaidAmount() > 0)
//                .map(Invoice::getCreatedAt)
//                .max(LocalDateTime::compareTo)
//                .ifPresent(summary::updateLastPaymentDate);
//
//        summary.setLastUpdated(LocalDateTime.now());
//
//        CustomerSummary updated = customerSummaryRepository.save(summary);
//        log.info("Updated customer summary for customer ID: {}", customerId);
//
//        return updated;
//    }
//
////    @Transactional
////    public Map<String, Object> getDetailedSummary(Long customerId) {
////        Customer customer = customerRepository.findById(customerId)
////                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
////
////        CustomerSummary summary = updateSummary(customerId);
////
////        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
////        List<Long> jobCardIds = jobCards.stream().map(JobCard::getId).collect(Collectors.toList());
////        List<Invoice> invoices = jobCardIds.isEmpty() ?
////                List.of() :
////                invoiceRepository.findByJobCardIdIn(jobCardIds);
////
////        Map<String, Object> response = new HashMap<>();
////        response.put("customer", buildCustomerInfo(customer));
////        response.put("summary", buildSummaryStats(summary));
////        response.put("jobHistory", buildJobHistory(jobCards));
////        response.put("paymentHistory", buildPaymentHistory(invoices));
////        response.put("recentActivity", buildRecentActivity(jobCards, invoices));
////
////        return response;
////    }
//
//    @Transactional
//    public Map<String, Object> getSummaryStats(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        CustomerSummary summary = getOrCreateSummary(customerId);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("customer", buildCustomerInfo(customer));
//        response.put("summary", buildSummaryStats(summary));
//
//        return response;
//    }
//
//    private Map<String, Object> buildCustomerInfo(Customer customer) {
//        Map<String, Object> customerInfo = new HashMap<>();
//        customerInfo.put("customerId", customer.getCustomerId());
//        customerInfo.put("customerName", customer.getCustomerName());
//        customerInfo.put("phoneNumber", customer.getPhoneNumber());
//        customerInfo.put("email", customer.getEmail());
//        customerInfo.put("address", customer.getAddress());
//        customerInfo.put("creditBalance", customer.getCreditBalance());
//        customerInfo.put("totalServiceCount", customer.getTotalServiceCount());
//        customerInfo.put("isActive", customer.getIsActive());
//        customerInfo.put("createdAt", customer.getCreatedAt());
//        customerInfo.put("lastVisit", customer.getLastVisit());
//        return customerInfo;
//    }
//
//    private Map<String, Object> buildSummaryStats(CustomerSummary summary) {
//        Map<String, Object> stats = new HashMap<>();
//        stats.put("totalJobs", summary.getTotalJobs());
//        stats.put("completedJobs", summary.getCompletedJobs());
//        stats.put("pendingJobs", summary.getPendingJobs());
//        stats.put("cancelledJobs", summary.getCancelledJobs());
//        stats.put("totalSpent", summary.getTotalSpent());
//        stats.put("totalPaid", summary.getTotalPaid());
//        stats.put("outstandingBalance", summary.getOutstandingBalance());
//        stats.put("averageJobValue", summary.getAverageJobValue());
//        stats.put("lastJobDate", summary.getLastJobDate());
//        stats.put("lastPaymentDate", summary.getLastPaymentDate());
//        stats.put("lastUpdated", summary.getLastUpdated());
//        return stats;
//    }
//
//    private Map<String, Object> buildJobHistory(List<JobCard> jobCards) {
//        Map<String, Object> jobHistory = new HashMap<>();
//        Map<String, Long> byStatus = new HashMap<>();
//
//        for (JobStatus status : JobStatus.values()) {
//            long count = jobCards.stream()
//                    .filter(job -> job.getStatus() == status)
//                    .count();
//            if (count > 0) {
//                byStatus.put(status.toString(), count);
//            }
//        }
//
//        jobHistory.put("totalJobs", jobCards.size());
//        jobHistory.put("byStatus", byStatus);
//        jobHistory.put("jobs", jobCards.stream()
//                .map(this::buildJobCardSummary)
//                .toList());
//
//        return jobHistory;
//    }
//
//    private Map<String, Object> buildJobCardSummary(JobCard job) {
//        Map<String, Object> jobInfo = new HashMap<>();
//        jobInfo.put("jobNumber", job.getJobNumber());
//        jobInfo.put("deviceType", job.getDeviceType());
//        jobInfo.put("status", job.getStatus());
//        jobInfo.put("totalServicePrice", job.getTotalServicePrice());
//        jobInfo.put("createdAt", job.getCreatedAt());
//        jobInfo.put("completedAt", job.getCompletedAt());
//        jobInfo.put("oneDayService", job.getOneDayService());
//
//        if (job.getFaults() != null && !job.getFaults().isEmpty()) {
//            jobInfo.put("faults", job.getFaults().stream()
//                    .map(Fault::getFaultName)
//                    .toList());
//        }
//
//        if (job.getServiceCategories() != null && !job.getServiceCategories().isEmpty()) {
//            jobInfo.put("services", job.getServiceCategories().stream()
//                    .map(ServiceCategory::getName)
//                    .toList());
//        }
//
//        return jobInfo;
//    }
//
//    private Map<String, Object> buildPaymentHistory(List<Invoice> invoices) {
//        Map<String, Object> paymentHistory = new HashMap<>();
//
//        Double totalInvoiced = invoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
//                .sum();
//
//        Double totalPaid = invoices.stream()
//                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
//                .sum();
//
//        Double totalOutstanding = invoices.stream()
//                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
//                .sum();
//
//        paymentHistory.put("totalInvoices", invoices.size());
//        paymentHistory.put("totalInvoiced", totalInvoiced);
//        paymentHistory.put("totalPaid", totalPaid);
//        paymentHistory.put("totalOutstanding", totalOutstanding);
//        paymentHistory.put("invoices", invoices.stream()
//                .map(this::buildInvoiceSummary)
//                .toList());
//
//        return paymentHistory;
//    }
//
////    private Map<String, Object> buildInvoiceSummary(Invoice invoice) {
////        Map<String, Object> invInfo = new HashMap<>();
////        invInfo.put("invoiceNumber", invoice.getInvoiceNumber());
////        invInfo.put("total", invoice.getTotal());
////        invInfo.put("paidAmount", invoice.getPaidAmount());
////        invInfo.put("balance", invoice.getBalance());
////        invInfo.put("subtotal", invoice.getSubtotal());
////        invInfo.put("discount", invoice.getDiscount());
////        invInfo.put("tax", invoice.getTax());
////        invInfo.put("paymentStatus", invoice.getPaymentStatus());
////        invInfo.put("paymentMethod", invoice.getPaymentMethod());
////        invInfo.put("createdAt", invoice.getCreatedAt());
////
////        if (invoice.getJobCard() != null) {
////            invInfo.put("jobNumber", invoice.getJobCard().getJobNumber());
////        }
////
////        return invInfo;
////    }
//
//    @Transactional
//    public Map<String, Object> getDetailedSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        CustomerSummary summary = updateSummary(customerId);
//
//        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//        List<Long> jobCardIds = jobCards.stream().map(JobCard::getId).collect(Collectors.toList());
//
//        // ✅ FIX: Get invoices via job cards AND direct invoices via customerId
//        List<Invoice> jobCardInvoices = jobCardIds.isEmpty()
//                ? List.of()
//                : invoiceRepository.findByJobCardIdIn(jobCardIds);
//
//        List<Invoice> directInvoices = invoiceRepository.findByCustomerIdAndIsDeletedFalse(customerId);
//
//        // Merge, deduplicate by invoice ID
//        Map<Long, Invoice> invoiceMap = new java.util.LinkedHashMap<>();
//        for (Invoice inv : jobCardInvoices) invoiceMap.put(inv.getId(), inv);
//        for (Invoice inv : directInvoices) invoiceMap.put(inv.getId(), inv);
//        List<Invoice> allInvoices = new java.util.ArrayList<>(invoiceMap.values());
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("customer", buildCustomerInfo(customer));
//        response.put("summary", buildSummaryStats(summary));
//        response.put("jobHistory", buildJobHistory(jobCards));
//        response.put("paymentHistory", buildPaymentHistory(allInvoices));
//        response.put("recentActivity", buildRecentActivity(jobCards, allInvoices));
//
//        return response;
//    }
//
//    private Map<String, Object> buildInvoiceSummary(Invoice invoice) {
//        Map<String, Object> invInfo = new HashMap<>();
//        invInfo.put("invoiceNumber", invoice.getInvoiceNumber());
//        invInfo.put("total", invoice.getTotal());
//        invInfo.put("paidAmount", invoice.getPaidAmount());
//        invInfo.put("balance", invoice.getBalance());
//        invInfo.put("subtotal", invoice.getSubtotal());
//        invInfo.put("discount", invoice.getDiscount());
//        invInfo.put("tax", invoice.getTax());
//        invInfo.put("paymentStatus", invoice.getPaymentStatus());
//        invInfo.put("paymentMethod", invoice.getPaymentMethod());
//        invInfo.put("createdAt", invoice.getCreatedAt());
//        // ✅ Mark direct invoices so frontend can distinguish them
//        invInfo.put("isDirect", invoice.getJobCard() == null);
//        if (invoice.getJobCard() != null) {
//            invInfo.put("jobNumber", invoice.getJobCard().getJobNumber());
//        }
//        return invInfo;
//    }
//
//    private Map<String, Object> buildRecentActivity(List<JobCard> jobCards, List<Invoice> invoices) {
//        Map<String, Object> recentActivity = new HashMap<>();
//
//        List<JobCard> recentJobs = jobCards.stream()
//                .sorted((j1, j2) -> j2.getCreatedAt().compareTo(j1.getCreatedAt()))
//                .limit(5)
//                .toList();
//
//        recentActivity.put("recentJobs", recentJobs.stream()
//                .map(this::buildJobCardSummary)
//                .toList());
//
//        List<Invoice> recentInvoices = invoices.stream()
//                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
//                .limit(5)
//                .toList();
//
//        recentActivity.put("recentInvoices", recentInvoices.stream()
//                .map(this::buildInvoiceSummary)
//                .toList());
//
//        return recentActivity;
//    }
//
//    @Transactional
//    public void deleteSummary(Long customerId) {
//        customerSummaryRepository.deleteByCustomerId(customerId);
//        log.info("Deleted customer summary for customer ID: {}", customerId);
//    }
//
//    @Transactional
//    public void refreshAllSummaries() {
//        List<Customer> activeCustomers = customerRepository.findByIsActiveTrueOrderByCustomerNameAsc();
//
//        for (Customer customer : activeCustomers) {
//            try {
//                updateSummary(customer.getCustomerId());
//            } catch (Exception e) {
//                log.error("Error updating summary for customer {}: {}",
//                        customer.getCustomerId(), e.getMessage());
//            }
//        }
//
//        log.info("Refreshed summaries for {} customers", activeCustomers.size());
//    }
//}









package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class CustomerSummaryService {

    private final CustomerRepository customerRepository;
    private final CustomerSummaryRepository customerSummaryRepository;
    private final JobCardRepository jobCardRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    protected void cleanupDuplicatesForCustomer(Long customerId) {
        try {
            List<CustomerSummary> summaries = customerSummaryRepository.findAllByCustomerId(customerId);
            if (summaries.size() > 1) {
                log.warn("Found {} duplicate summaries for customer ID: {}. Cleaning up...", summaries.size(), customerId);
                for (int i = 1; i < summaries.size(); i++) {
                    customerSummaryRepository.delete(summaries.get(i));
                    log.info("Deleted duplicate summary ID: {} for customer: {}", summaries.get(i).getId(), customerId);
                }
            }
        } catch (Exception e) {
            log.error("Error cleaning duplicates for customer {}: {}", customerId, e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CustomerSummary getOrCreateSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        cleanupDuplicatesForCustomer(customerId);

        Optional<CustomerSummary> existingSummary = customerSummaryRepository.findByCustomerId(customerId);
        if (existingSummary.isPresent()) {
            return existingSummary.get();
        }

        CustomerSummary newSummary = new CustomerSummary();
        newSummary.setCustomer(customer);
        newSummary.setCreatedAt(LocalDateTime.now());
        newSummary.setLastUpdated(LocalDateTime.now());

        log.info("Creating new CustomerSummary for customer ID: {}", customerId);
        return customerSummaryRepository.save(newSummary);
    }

    @Transactional
    public CustomerSummary updateSummary(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = getOrCreateSummary(customerId);

        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

        int totalJobs = jobCards.size();
        int completedJobs = (int) jobCards.stream()
                .filter(job -> job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.DELIVERED)
                .count();
        int pendingJobs = (int) jobCards.stream()
                .filter(job -> job.getStatus() == JobStatus.PENDING ||
                        job.getStatus() == JobStatus.IN_PROGRESS ||
                        job.getStatus() == JobStatus.WAITING_FOR_PARTS ||
                        job.getStatus() == JobStatus.WAITING_FOR_APPROVAL)
                .count();
        int cancelledJobs = (int) jobCards.stream()
                .filter(job -> job.getStatus() == JobStatus.CANCELLED)
                .count();

        summary.updateJobStats(totalJobs, completedJobs, pendingJobs, cancelledJobs);

        Double totalServiceCost = jobCards.stream()
                .mapToDouble(job -> job.getTotalServicePrice() != null ? job.getTotalServicePrice() : 0.0)
                .sum();

        List<Long> jobCardIds = jobCards.stream().map(JobCard::getId).collect(Collectors.toList());
        List<Invoice> invoices = jobCardIds.isEmpty() ?
                List.of() :
                invoiceRepository.findByJobCardIdIn(jobCardIds);

        // ── Exclude returned invoices from all financial totals ──
        List<Invoice> activeInvoices = invoices.stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsReturned()))
                .collect(Collectors.toList());

        Double totalPaid = activeInvoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double outstandingBalance = activeInvoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        summary.updateFinancialStats(totalServiceCost, totalPaid, outstandingBalance);

        jobCards.stream()
                .map(JobCard::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .ifPresent(summary::updateLastJobDate);

        activeInvoices.stream()
                .filter(inv -> inv.getPaidAmount() != null && inv.getPaidAmount() > 0)
                .map(Invoice::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .ifPresent(summary::updateLastPaymentDate);

        summary.setLastUpdated(LocalDateTime.now());

        CustomerSummary updated = customerSummaryRepository.save(summary);
        log.info("Updated customer summary for customer ID: {}", customerId);
        return updated;
    }

    @Transactional
    public Map<String, Object> getSummaryStats(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = getOrCreateSummary(customerId);

        Map<String, Object> response = new HashMap<>();
        response.put("customer", buildCustomerInfo(customer));
        response.put("summary", buildSummaryStats(summary));
        return response;
    }

    @Transactional
    public Map<String, Object> getDetailedSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = updateSummary(customerId);

        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
        List<Long> jobCardIds = jobCards.stream().map(JobCard::getId).collect(Collectors.toList());

        // Get invoices via job cards AND direct invoices via customerId
        List<Invoice> jobCardInvoices = jobCardIds.isEmpty()
                ? List.of()
                : invoiceRepository.findByJobCardIdIn(jobCardIds);

        List<Invoice> directInvoices = invoiceRepository.findByCustomerIdAndIsDeletedFalse(customerId);

        // Merge, deduplicate by invoice ID
        Map<Long, Invoice> invoiceMap = new java.util.LinkedHashMap<>();
        for (Invoice inv : jobCardInvoices) invoiceMap.put(inv.getId(), inv);
        for (Invoice inv : directInvoices) invoiceMap.put(inv.getId(), inv);
        List<Invoice> allInvoices = new java.util.ArrayList<>(invoiceMap.values());

        Map<String, Object> response = new HashMap<>();
        response.put("customer", buildCustomerInfo(customer));
        response.put("summary", buildSummaryStats(summary));
        response.put("jobHistory", buildJobHistory(jobCards));
        response.put("paymentHistory", buildPaymentHistory(allInvoices));
        response.put("recentActivity", buildRecentActivity(jobCards, allInvoices));
        return response;
    }

    private Map<String, Object> buildCustomerInfo(Customer customer) {
        Map<String, Object> customerInfo = new HashMap<>();
        customerInfo.put("customerId", customer.getCustomerId());
        customerInfo.put("customerName", customer.getCustomerName());
        customerInfo.put("phoneNumber", customer.getPhoneNumber());
        customerInfo.put("email", customer.getEmail());
        customerInfo.put("address", customer.getAddress());
        customerInfo.put("creditBalance", customer.getCreditBalance());
        customerInfo.put("totalServiceCount", customer.getTotalServiceCount());
        customerInfo.put("isActive", customer.getIsActive());
        customerInfo.put("createdAt", customer.getCreatedAt());
        customerInfo.put("lastVisit", customer.getLastVisit());
        return customerInfo;
    }

    private Map<String, Object> buildSummaryStats(CustomerSummary summary) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", summary.getTotalJobs());
        stats.put("completedJobs", summary.getCompletedJobs());
        stats.put("pendingJobs", summary.getPendingJobs());
        stats.put("cancelledJobs", summary.getCancelledJobs());
        stats.put("totalSpent", summary.getTotalSpent());
        stats.put("totalPaid", summary.getTotalPaid());
        stats.put("outstandingBalance", summary.getOutstandingBalance());
        stats.put("averageJobValue", summary.getAverageJobValue());
        stats.put("lastJobDate", summary.getLastJobDate());
        stats.put("lastPaymentDate", summary.getLastPaymentDate());
        stats.put("lastUpdated", summary.getLastUpdated());
        return stats;
    }

    private Map<String, Object> buildJobHistory(List<JobCard> jobCards) {
        Map<String, Object> jobHistory = new HashMap<>();
        Map<String, Long> byStatus = new HashMap<>();

        for (JobStatus status : JobStatus.values()) {
            long count = jobCards.stream()
                    .filter(job -> job.getStatus() == status)
                    .count();
            if (count > 0) {
                byStatus.put(status.toString(), count);
            }
        }

        jobHistory.put("totalJobs", jobCards.size());
        jobHistory.put("byStatus", byStatus);
        jobHistory.put("jobs", jobCards.stream()
                .map(this::buildJobCardSummary)
                .toList());

        return jobHistory;
    }

    private Map<String, Object> buildJobCardSummary(JobCard job) {
        Map<String, Object> jobInfo = new HashMap<>();
        jobInfo.put("jobNumber", job.getJobNumber());
        jobInfo.put("deviceType", job.getDeviceType());
        jobInfo.put("status", job.getStatus());
        jobInfo.put("totalServicePrice", job.getTotalServicePrice());
        jobInfo.put("createdAt", job.getCreatedAt());
        jobInfo.put("completedAt", job.getCompletedAt());
        jobInfo.put("oneDayService", job.getOneDayService());

        if (job.getFaults() != null && !job.getFaults().isEmpty()) {
            jobInfo.put("faults", job.getFaults().stream()
                    .map(Fault::getFaultName)
                    .toList());
        }

        if (job.getServiceCategories() != null && !job.getServiceCategories().isEmpty()) {
            jobInfo.put("services", job.getServiceCategories().stream()
                    .map(ServiceCategory::getName)
                    .toList());
        }

        return jobInfo;
    }

    private Map<String, Object> buildPaymentHistory(List<Invoice> invoices) {
        Map<String, Object> paymentHistory = new HashMap<>();

        // ── Split returned vs active invoices ──
        List<Invoice> activeInvoices = invoices.stream()
                .filter(inv -> !Boolean.TRUE.equals(inv.getIsReturned()))
                .collect(Collectors.toList());

        List<Invoice> returnedInvoices = invoices.stream()
                .filter(inv -> Boolean.TRUE.equals(inv.getIsReturned()))
                .collect(Collectors.toList());

        // ── Totals from active (non-returned) invoices only ──
        Double totalInvoiced = activeInvoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        Double totalPaid = activeInvoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double totalOutstanding = activeInvoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        // ── Returned amount: sum of returnedAmount of returned invoices ──
        Double totalReturned = returnedInvoices.stream()
                .mapToDouble(inv -> {
                    if (inv.getReturnedAmount() != null && inv.getReturnedAmount() > 0)
                        return inv.getReturnedAmount();
                    return inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0;
                })
                .sum();

        paymentHistory.put("totalInvoices", invoices.size());
        paymentHistory.put("totalInvoiced", totalInvoiced);
        paymentHistory.put("totalPaid", totalPaid);
        paymentHistory.put("totalOutstanding", totalOutstanding);
        paymentHistory.put("totalReturned", totalReturned);
        paymentHistory.put("returnedInvoiceCount", returnedInvoices.size());
        paymentHistory.put("invoices", invoices.stream()
                .map(this::buildInvoiceSummary)
                .toList());

        return paymentHistory;
    }

    // ✅ FIXED: added paymentStatus so frontend badge works correctly
    private Map<String, Object> buildInvoiceSummary(Invoice invoice) {
        Map<String, Object> invInfo = new HashMap<>();
        invInfo.put("invoiceNumber", invoice.getInvoiceNumber());
        invInfo.put("total", invoice.getTotal());
        invInfo.put("paidAmount", invoice.getPaidAmount());
        invInfo.put("balance", invoice.getBalance());
        invInfo.put("subtotal", invoice.getSubtotal());
        invInfo.put("discount", invoice.getDiscount());
        invInfo.put("tax", invoice.getTax());
        invInfo.put("paymentStatus", invoice.getPaymentStatus());       // ✅ was already here
        invInfo.put("paymentMethod", invoice.getPaymentMethod());
        invInfo.put("createdAt", invoice.getCreatedAt());
        // ✅ FIXED: explicitly cast to boolean so null → false, never missing
        invInfo.put("isReturned", Boolean.TRUE.equals(invoice.getIsReturned()));
        invInfo.put("returnedAmount", invoice.getReturnedAmount() != null ? invoice.getReturnedAmount() : 0.0);
        invInfo.put("returnReason", invoice.getReturnReason());
        invInfo.put("returnedAt", invoice.getReturnedAt());
        invInfo.put("isDirect", invoice.getJobCard() == null);
        if (invoice.getJobCard() != null) {
            invInfo.put("jobNumber", invoice.getJobCard().getJobNumber());
        }
        return invInfo;
    }

    private Map<String, Object> buildRecentActivity(List<JobCard> jobCards, List<Invoice> invoices) {
        Map<String, Object> recentActivity = new HashMap<>();

        List<JobCard> recentJobs = jobCards.stream()
                .sorted((j1, j2) -> j2.getCreatedAt().compareTo(j1.getCreatedAt()))
                .limit(5)
                .toList();

        recentActivity.put("recentJobs", recentJobs.stream()
                .map(this::buildJobCardSummary)
                .toList());

        List<Invoice> recentInvoices = invoices.stream()
                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
                .limit(5)
                .toList();

        recentActivity.put("recentInvoices", recentInvoices.stream()
                .map(this::buildInvoiceSummary)
                .toList());

        return recentActivity;
    }

    @Transactional
    public void deleteSummary(Long customerId) {
        customerSummaryRepository.deleteByCustomerId(customerId);
        log.info("Deleted customer summary for customer ID: {}", customerId);
    }

    @Transactional
    public void refreshAllSummaries() {
        List<Customer> activeCustomers = customerRepository.findByIsActiveTrueOrderByCustomerNameAsc();

        for (Customer customer : activeCustomers) {
            try {
                updateSummary(customer.getCustomerId());
            } catch (Exception e) {
                log.error("Error updating summary for customer {}: {}",
                        customer.getCustomerId(), e.getMessage());
            }
        }

        log.info("Refreshed summaries for {} customers", activeCustomers.size());
    }
}