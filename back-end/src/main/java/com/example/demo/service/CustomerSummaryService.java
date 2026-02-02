//package com.example.demo.service;
//
//import com.example.demo.entity.*;
//import com.example.demo.repositories.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
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
//    /**
//     * Get or create customer summary
//     */
//    @Transactional
//    public CustomerSummary getOrCreateSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        return customerSummaryRepository.findByCustomerId(customerId)
//                .orElseGet(() -> {
//                    CustomerSummary newSummary = new CustomerSummary();
//                    newSummary.setCustomer(customer);
//                    return customerSummaryRepository.save(newSummary);
//                });
//    }
//
//    /**
//     * Update customer summary with latest data
//     */
//    @Transactional
//    public CustomerSummary updateSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        CustomerSummary summary = getOrCreateSummary(customerId);
//
//        // Get all job cards for this customer
//        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//        // Calculate job statistics
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
//        // Calculate financial statistics
//        Double totalServiceCost = jobCards.stream()
//                .mapToDouble(job -> job.getTotalServicePrice() != null ? job.getTotalServicePrice() : 0.0)
//                .sum();
//
//        // Get all invoices for this customer
//        List<Invoice> invoices = invoiceRepository.findByCustomerPhone(customer.getPhoneNumber());
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
//        // Update last job date
//        jobCards.stream()
//                .map(JobCard::getCreatedAt)
//                .max(LocalDateTime::compareTo)
//                .ifPresent(summary::updateLastJobDate);
//
//        // Update last payment date
//        invoices.stream()
//                .filter(inv -> inv.getPaidAmount() != null && inv.getPaidAmount() > 0)
//                .map(Invoice::getUpdatedAt)
//                .max(LocalDateTime::compareTo)
//                .ifPresent(summary::updateLastPaymentDate);
//
//        CustomerSummary updated = customerSummaryRepository.save(summary);
//        log.info("Updated customer summary for customer ID: {}", customerId);
//
//        return updated;
//    }
//
//    /**
//     * Get detailed customer summary with job cards and invoices
//     */
//    @Transactional(readOnly = true)
//    public Map<String, Object> getDetailedSummary(Long customerId) {
//        Customer customer = customerRepository.findById(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
//
//        CustomerSummary summary = getOrCreateSummary(customerId);
//
//        // Get job cards
//        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);
//
//        // Get invoices
//        List<Invoice> invoices = invoiceRepository.findByCustomerPhone(customer.getPhoneNumber());
//
//        // Build response
//        Map<String, Object> response = new HashMap<>();
//
//        // Customer info
//        response.put("customer", buildCustomerInfo(customer));
//
//        // Summary stats
//        response.put("summary", buildSummaryStats(summary));
//
//        // Job history
//        response.put("jobHistory", buildJobHistory(jobCards));
//
//        // Payment history
//        response.put("paymentHistory", buildPaymentHistory(invoices));
//
//        // Recent activity
//        response.put("recentActivity", buildRecentActivity(jobCards, invoices));
//
//        return response;
//    }
//
//    /**
//     * Get customer summary statistics only
//     */
//    @Transactional(readOnly = true)
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
//    // ========== HELPER METHODS ==========
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
//
//        // Group by status
//        Map<String, Long> byStatus = new HashMap<>();
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
//        // Add faults
//        if (job.getFaults() != null && !job.getFaults().isEmpty()) {
//            jobInfo.put("faults", job.getFaults().stream()
//                    .map(Fault::getFaultName)
//                    .toList());
//        }
//
//        // Add services
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
//    private Map<String, Object> buildInvoiceSummary(Invoice invoice) {
//        Map<String, Object> invInfo = new HashMap<>();
//        invInfo.put("invoiceNumber", invoice.getInvoiceNumber());
//        invInfo.put("total", invoice.getTotal());
//        invInfo.put("paidAmount", invoice.getPaidAmount());
//        invInfo.put("balance", invoice.getBalance());
//        invInfo.put("paymentStatus", invoice.getPaymentStatus());
//        invInfo.put("paymentMethod", invoice.getPaymentMethod());
//        invInfo.put("createdAt", invoice.getCreatedAt());
//
//        if (invoice.getJobCard() != null) {
//            invInfo.put("jobNumber", invoice.getJobCard().getJobNumber());
//        }
//
//        return invInfo;
//    }
//
//    private Map<String, Object> buildRecentActivity(List<JobCard> jobCards, List<Invoice> invoices) {
//        Map<String, Object> recentActivity = new HashMap<>();
//
//        // Last 5 jobs
//        List<JobCard> recentJobs = jobCards.stream()
//                .sorted((j1, j2) -> j2.getCreatedAt().compareTo(j1.getCreatedAt()))
//                .limit(5)
//                .toList();
//
//        recentActivity.put("recentJobs", recentJobs.stream()
//                .map(this::buildJobCardSummary)
//                .toList());
//
//        // Last 5 invoices
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
//    /**
//     * Delete customer summary
//     */
//    @Transactional
//    public void deleteSummary(Long customerId) {
//        customerSummaryRepository.findByCustomerId(customerId)
//                .ifPresent(summary -> {
//                    customerSummaryRepository.delete(summary);
//                    log.info("Deleted customer summary for customer ID: {}", customerId);
//                });
//    }
//
//    /**
//     * Refresh all customer summaries (background task)
//     */
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@Service
@RequiredArgsConstructor
public class CustomerSummaryService {

    private final CustomerRepository customerRepository;
    private final CustomerSummaryRepository customerSummaryRepository;
    private final JobCardRepository jobCardRepository;
    private final InvoiceRepository invoiceRepository;

    /**
     * Get or create customer summary
     */
    @Transactional
    public CustomerSummary getOrCreateSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        return customerSummaryRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    CustomerSummary newSummary = new CustomerSummary();
                    newSummary.setCustomer(customer);
                    return customerSummaryRepository.save(newSummary);
                });
    }

    /**
     * Update customer summary with latest data
     */
    @Transactional
    public CustomerSummary updateSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = getOrCreateSummary(customerId);

        // Get all job cards for this customer
        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

        // Calculate job statistics
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

        // Calculate financial statistics
        Double totalServiceCost = jobCards.stream()
                .mapToDouble(job -> job.getTotalServicePrice() != null ? job.getTotalServicePrice() : 0.0)
                .sum();

        // Get all invoices for this customer
        List<Invoice> invoices = invoiceRepository.findByCustomerPhone(customer.getPhoneNumber());

        Double totalPaid = invoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double outstandingBalance = invoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        summary.updateFinancialStats(totalServiceCost, totalPaid, outstandingBalance);

        // Update last job date
        jobCards.stream()
                .map(JobCard::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .ifPresent(summary::updateLastJobDate);

        // Update last payment date
        invoices.stream()
                .filter(inv -> inv.getPaidAmount() != null && inv.getPaidAmount() > 0)
                .map(Invoice::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .ifPresent(summary::updateLastPaymentDate);

        CustomerSummary updated = customerSummaryRepository.save(summary);
        log.info("Updated customer summary for customer ID: {}", customerId);

        return updated;
    }

    /**
     * Get detailed customer summary with job cards and invoices
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDetailedSummary(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = getOrCreateSummary(customerId);

        // Get job cards
        List<JobCard> jobCards = jobCardRepository.findByCustomerId(customerId);

        // Get invoices
        List<Invoice> invoices = invoiceRepository.findByCustomerPhone(customer.getPhoneNumber());

        // Build response
        Map<String, Object> response = new HashMap<>();

        // Customer info
        response.put("customer", buildCustomerInfo(customer));

        // Summary stats
        response.put("summary", buildSummaryStats(summary));

        // Job history
        response.put("jobHistory", buildJobHistory(jobCards));

        // Payment history
        response.put("paymentHistory", buildPaymentHistory(invoices));

        // Recent activity
        response.put("recentActivity", buildRecentActivity(jobCards, invoices));

        return response;
    }

    /**
     * Get customer summary statistics only
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSummaryStats(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        CustomerSummary summary = getOrCreateSummary(customerId);

        Map<String, Object> response = new HashMap<>();
        response.put("customer", buildCustomerInfo(customer));
        response.put("summary", buildSummaryStats(summary));

        return response;
    }

    // ========== HELPER METHODS ==========

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

        // Group by status
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

        // Add faults
        if (job.getFaults() != null && !job.getFaults().isEmpty()) {
            jobInfo.put("faults", job.getFaults().stream()
                    .map(Fault::getFaultName)
                    .toList());
        }

        // Add services
        if (job.getServiceCategories() != null && !job.getServiceCategories().isEmpty()) {
            jobInfo.put("services", job.getServiceCategories().stream()
                    .map(ServiceCategory::getName)
                    .toList());
        }

        return jobInfo;
    }

    private Map<String, Object> buildPaymentHistory(List<Invoice> invoices) {
        Map<String, Object> paymentHistory = new HashMap<>();

        Double totalInvoiced = invoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        Double totalPaid = invoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double totalOutstanding = invoices.stream()
                .mapToDouble(inv -> inv.getBalance() != null ? inv.getBalance() : 0.0)
                .sum();

        paymentHistory.put("totalInvoices", invoices.size());
        paymentHistory.put("totalInvoiced", totalInvoiced);
        paymentHistory.put("totalPaid", totalPaid);
        paymentHistory.put("totalOutstanding", totalOutstanding);
        paymentHistory.put("invoices", invoices.stream()
                .map(this::buildInvoiceSummary)
                .toList());

        return paymentHistory;
    }

    private Map<String, Object> buildInvoiceSummary(Invoice invoice) {
        Map<String, Object> invInfo = new HashMap<>();
        invInfo.put("invoiceNumber", invoice.getInvoiceNumber());
        invInfo.put("total", invoice.getTotal());
        invInfo.put("paidAmount", invoice.getPaidAmount());
        invInfo.put("balance", invoice.getBalance());
        invInfo.put("paymentStatus", invoice.getPaymentStatus());
        invInfo.put("paymentMethod", invoice.getPaymentMethod());
        invInfo.put("createdAt", invoice.getCreatedAt());

        if (invoice.getJobCard() != null) {
            invInfo.put("jobNumber", invoice.getJobCard().getJobNumber());
        }

        return invInfo;
    }

    private Map<String, Object> buildRecentActivity(List<JobCard> jobCards, List<Invoice> invoices) {
        Map<String, Object> recentActivity = new HashMap<>();

        // Last 5 jobs
        List<JobCard> recentJobs = jobCards.stream()
                .sorted((j1, j2) -> j2.getCreatedAt().compareTo(j1.getCreatedAt()))
                .limit(5)
                .toList();

        recentActivity.put("recentJobs", recentJobs.stream()
                .map(this::buildJobCardSummary)
                .toList());

        // Last 5 invoices
        List<Invoice> recentInvoices = invoices.stream()
                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()))
                .limit(5)
                .toList();

        recentActivity.put("recentInvoices", recentInvoices.stream()
                .map(this::buildInvoiceSummary)
                .toList());

        return recentActivity;
    }

    /**
     * Delete customer summary
     */
    @Transactional
    public void deleteSummary(Long customerId) {
        customerSummaryRepository.findByCustomerId(customerId)
                .ifPresent(summary -> {
                    customerSummaryRepository.delete(summary);
                    log.info("Deleted customer summary for customer ID: {}", customerId);
                });
    }

    /**
     * Refresh all customer summaries (background task)
     */
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