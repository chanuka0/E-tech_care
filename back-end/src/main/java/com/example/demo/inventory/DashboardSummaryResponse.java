package com.example.demo.inventory;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DashboardSummaryResponse {
    private InventorySummary inventorySummary;
    private SalesSummary salesSummary;
    private List<com.example.demo.inventory.dto.StockAlertResponse> lowStockAlerts;
    private List<RecentInvoiceResponse> recentInvoices;

    @Data
    public static class InventorySummary {
        private Long totalItems;
        private Long lowStockItems;
        private Long outOfStockItems;
        private BigDecimal totalInventoryValue;
    }

    @Data
    public static class SalesSummary {
        private BigDecimal todaysSales;
        private BigDecimal monthlyLOAD_STOCKSales;
        private Long pendingInvoices;
        private Long completedJobsToday;


        public void setMonthlySales(BigDecimal bigDecimal) {
        }
    }

    @Data
    public static class RecentInvoiceResponse {
        private Long id;
        private String invoiceNumber;
        private String customerName;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdDate;
    }
}