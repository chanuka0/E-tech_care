package com.example.demo.inventory;

//import com.example.demo.dashboard.dto.DashboardSummaryResponse;
import com.example.demo.inventory.dto.JobCardItemResponse;
import com.example.demo.inventory.dto.StockAlertResponse;
//import com.example.demo.inventory.repository.InventoryItemRepository;
//import com.example.demo.inventory.repository.StockAlertRepository;
//import com.example.demo.inventory.service.InventoryService;
//import com.example.demo.invoice.repository.InvoiceRepository;
import com.example.demo.job_card.JobCardRepository;
import com.example.demo.job_card.JobStatus;
import com.example.demo.job_card.dto.JobCardResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final InventoryItemRepository inventoryRepository;
    private final InvoiceRepository invoiceRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryService inventoryService;

    public DashboardSummaryResponse getDashboardSummary() {
        log.debug("Generating dashboard summary");

        DashboardSummaryResponse response = new DashboardSummaryResponse();

        // Inventory Summary
        DashboardSummaryResponse.InventorySummary inventorySummary = new DashboardSummaryResponse.InventorySummary();
        inventorySummary.setTotalItems(inventoryRepository.countActiveItems());
        inventorySummary.setLowStockItems(inventoryRepository.countLowStockItems());
        inventorySummary.setOutOfStockItems(inventoryRepository.countOutOfStockItems());
        inventorySummary.setTotalInventoryValue(inventoryRepository.calculateTotalInventoryValue());
        response.setInventorySummary(inventorySummary);

        // Sales Summary
        DashboardSummaryResponse.SalesSummary salesSummary = new DashboardSummaryResponse.SalesSummary();
        LocalDateTime today = LocalDateTime.now();
        salesSummary.setTodaysSales(invoiceRepository.calculateDailySales(today));

        YearMonth currentMonth = YearMonth.now();
        salesSummary.setMonthlySales(invoiceRepository.calculateMonthlySales(
                currentMonth.getYear(), currentMonth.getMonthValue()));

        salesSummary.setPendingInvoices(invoiceRepository.countPendingInvoices());

        // Count completed jobs today
        LocalDateTime startOfDay = today.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = today.withHour(23).withMinute(59).withSecond(59);
        Long completedJobsToday = jobCardRepository.findByCreatedDateBetween(startOfDay, endOfDay)
                .stream()
                .filter(job -> job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.DELIVERED)
                .count();
        salesSummary.setCompletedJobsToday(completedJobsToday);

        response.setSalesSummary(salesSummary);

        // Low Stock Alerts
        response.setLowStockAlerts(inventoryService.getActiveAlerts());

        // Recent Invoices
        List<DashboardSummaryResponse.RecentInvoiceResponse> recentInvoices =
                invoiceRepository.findTop10ByOrderByCreatedDateDesc()
                        .stream()
                        .map(invoice -> {
                            DashboardSummaryResponse.RecentInvoiceResponse recentInvoice =
                                    new DashboardSummaryResponse.RecentInvoiceResponse();
                            recentInvoice.setId(invoice.getId());
                            recentInvoice.setInvoiceNumber(invoice.getInvoiceNumber());
                            recentInvoice.setCustomerName(invoice.getCustomerName());
                            recentInvoice.setTotalAmount(invoice.getTotalAmount());
                            recentInvoice.setStatus(invoice.getStatus().getDisplayName());
                            recentInvoice.setCreatedDate(invoice.getCreatedDate());
                            return recentInvoice;
                        })
                        .collect(Collectors.toList());
        response.setRecentInvoices(recentInvoices);

        return response;
    }
//import com.example.demo.inventory.dto.JobCardItemResponse;
//import com.example.demo.job_card.dto.JobCardResponse;
//import lombok.Data;
//import lombok.EqualsAndHashCode;
//import java.math.BigDecimal;
//import java.util.List;

        @Data
        @EqualsAndHashCode(callSuper = true)
        public static class EnhancedJobCardResponse extends JobCardResponse {
            private List<JobCardItemResponse> items;
            private BigDecimal serviceCharge = BigDecimal.ZERO;
            private BigDecimal itemsTotal = BigDecimal.ZERO;
            private BigDecimal grandTotal = BigDecimal.ZERO;
            private String warrantyDetails;
            private Boolean hasInvoice = false;
            private Long invoiceId;
        }
    }

//    public class EnhancedJobCardResponse {
//    }
//    }