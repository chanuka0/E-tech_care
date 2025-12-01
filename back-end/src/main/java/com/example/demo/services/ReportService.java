//package com.example.demo.services;
//
//import com.example.demo.entity.JobStatus;
//import com.example.demo.repositories.DamagedItemRepository;
//import com.example.demo.repositories.ExpenseRepository;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final InvoiceRepository invoiceRepository;
//    private final ExpenseRepository expenseRepository;
//    private final JobCardRepository jobCardRepository;
//    private final DamagedItemRepository damagedItemRepository;
//
//    public Map<String, Object> getDashboardStats() {
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
//        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
//
//        Map<String, Object> stats = new HashMap<>();
//
//        // Job stats
//        stats.put("totalJobs", jobCardRepository.count());
//        stats.put("pendingJobs", jobCardRepository.countByStatus(JobStatus.PENDING));
//
//        // Revenue
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, now);
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, now);
//        stats.put("dailyRevenue", dailyRevenue != null ? dailyRevenue : 0.0);
//        stats.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : 0.0);
//
//        // Expenses
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, now);
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, now);
//        stats.put("dailyExpenses", dailyExpenses != null ? dailyExpenses : 0.0);
//        stats.put("monthlyExpenses", monthlyExpenses != null ? monthlyExpenses : 0.0);
//
//        // Profit
//        double dailyProfit = (dailyRevenue != null ? dailyRevenue : 0.0) -
//                (dailyExpenses != null ? dailyExpenses : 0.0);
//        double monthlyProfit = (monthlyRevenue != null ? monthlyRevenue : 0.0) -
//                (monthlyExpenses != null ? monthlyExpenses : 0.0);
//        stats.put("dailyProfit", dailyProfit);
//        stats.put("monthlyProfit", monthlyProfit);
//
//        return stats;
//    }
//
//    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//
//        Map<String, Object> report = new HashMap<>();
//        report.put("totalRevenue", revenue != null ? revenue : 0.0);
//        report.put("totalExpenses", expenses != null ? expenses : 0.0);
//        report.put("netProfit", (revenue != null ? revenue : 0.0) -
//                (expenses != null ? expenses : 0.0));
//
//        return report;
//    }
//}

//package com.example.demo.services;
//
//import com.example.demo.entity.JobStatus;
//import com.example.demo.repositories.DamagedItemRepository;
//import com.example.demo.repositories.ExpenseRepository;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final InvoiceRepository invoiceRepository;
//    private final ExpenseRepository expenseRepository;
//    private final JobCardRepository jobCardRepository;
//    private final DamagedItemRepository damagedItemRepository;
//
//    /**
//     * Get dashboard statistics for today and this month
//     * Includes job stats, revenue, expenses, and profit
//     */
//    public Map<String, Object> getDashboardStats() {
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
//        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);
//
//        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
//        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
//                .toLocalDate().atTime(23, 59, 59);
//
//        Map<String, Object> stats = new HashMap<>();
//
//        // ============ JOB STATISTICS ============
//        stats.put("totalJobs", jobCardRepository.count());
//        stats.put("pendingJobs", jobCardRepository.countByStatus(JobStatus.PENDING));
//
//        // ============ DAILY STATISTICS ============
//
//        // Daily Revenue
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
//        if (dailyRevenue == null) {
//            dailyRevenue = 0.0;
//        }
//        stats.put("dailyRevenue", dailyRevenue);
//
//        // Daily Expenses - CORRECTED: Use getTotalExpenses with proper date range
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
//        if (dailyExpenses == null) {
//            dailyExpenses = 0.0;
//        }
//        stats.put("dailyExpenses", dailyExpenses);
//
//        // Daily Profit
//        double dailyProfit = dailyRevenue - dailyExpenses;
//        stats.put("dailyProfit", dailyProfit);
//
//        // ============ MONTHLY STATISTICS ============
//
//        // Monthly Revenue
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
//        if (monthlyRevenue == null) {
//            monthlyRevenue = 0.0;
//        }
//        stats.put("monthlyRevenue", monthlyRevenue);
//
//        // Monthly Expenses - CORRECTED: Use getTotalExpenses with proper date range
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
//        if (monthlyExpenses == null) {
//            monthlyExpenses = 0.0;
//        }
//        stats.put("monthlyExpenses", monthlyExpenses);
//
//        // Monthly Profit
//        double monthlyProfit = monthlyRevenue - monthlyExpenses;
//        stats.put("monthlyProfit", monthlyProfit);
//
//        return stats;
//    }
//
//    /**
//     * Get detailed profit report for a custom date range
//     * Used for custom date range filtering in frontend
//     */
//    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
//        // Validate date range
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        if (start.isAfter(end)) {
//            throw new IllegalArgumentException("Start date must be before end date");
//        }
//
//        // Get revenue for date range
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        if (revenue == null) {
//            revenue = 0.0;
//        }
//
//        // Get expenses for date range - CORRECTED: Use getTotalExpenses
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//        if (expenses == null) {
//            expenses = 0.0;
//        }
//
//        // Calculate profit
//        Double netProfit = revenue - expenses;
//
//        Map<String, Object> report = new HashMap<>();
//        report.put("totalRevenue", revenue);
//        report.put("totalExpenses", expenses);
//        report.put("netProfit", netProfit);
//        report.put("startDate", start);
//        report.put("endDate", end);
//
//        return report;
//    }
//
//    /**
//     * Get revenue for a specific date range
//     */
//    public Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        return revenue != null ? revenue : 0.0;
//    }
//
//    /**
//     * Get expenses for a specific date range
//     */
//    public Double getExpensesByDateRange(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//        return expenses != null ? expenses : 0.0;
//    }
//
//    /**
//     * Get daily statistics only
//     */
//    public Map<String, Object> getDailyStats() {
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
//        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);
//
//        Map<String, Object> dailyStats = new HashMap<>();
//
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
//
//        dailyStats.put("date", now.toLocalDate());
//        dailyStats.put("revenue", dailyRevenue != null ? dailyRevenue : 0.0);
//        dailyStats.put("expenses", dailyExpenses != null ? dailyExpenses : 0.0);
//        dailyStats.put("profit", (dailyRevenue != null ? dailyRevenue : 0.0) -
//                (dailyExpenses != null ? dailyExpenses : 0.0));
//
//        return dailyStats;
//    }
//
//    /**
//     * Get monthly statistics only
//     */
//    public Map<String, Object> getMonthlyStats() {
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
//        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
//                .toLocalDate().atTime(23, 59, 59);
//
//        Map<String, Object> monthlyStats = new HashMap<>();
//
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
//
//        monthlyStats.put("month", now.getMonth().toString());
//        monthlyStats.put("year", now.getYear());
//        monthlyStats.put("revenue", monthlyRevenue != null ? monthlyRevenue : 0.0);
//        monthlyStats.put("expenses", monthlyExpenses != null ? monthlyExpenses : 0.0);
//        monthlyStats.put("profit", (monthlyRevenue != null ? monthlyRevenue : 0.0) -
//                (monthlyExpenses != null ? monthlyExpenses : 0.0));
//
//        return monthlyStats;
//    }
//
//    /**
//     * Get expenses summary by category for date range
//     */
//    public Map<String, Object> getExpensesSummary(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//
//        Map<String, Object> summary = new HashMap<>();
//
//        // Get category breakdown
//        java.util.List<Object[]> categoryBreakdown = expenseRepository.getExpensesSummaryByCategory(start, end);
//        summary.put("categoryBreakdown", categoryBreakdown);
//
//        // Get total
//        Double total = expenseRepository.getTotalExpenses(start, end);
//        summary.put("totalExpenses", total != null ? total : 0.0);
//
//        // Get count
//        Long count = expenseRepository.countExpensesByDateRange(start, end);
//        summary.put("expenseCount", count != null ? count : 0L);
//
//        return summary;
//    }
//
//}

package com.example.demo.services;

import com.example.demo.entity.Expense;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.JobStatus;
import com.example.demo.repositories.DamagedItemRepository;
import com.example.demo.repositories.ExpenseRepository;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final JobCardRepository jobCardRepository;
    private final DamagedItemRepository damagedItemRepository;
    private final InvoiceService invoiceService;
    private final ExpenseService expenseService;

    /**
     * Get dashboard statistics for today and this month
     * Includes job stats, revenue, expenses, and profit
     */
    public Map<String, Object> getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);

        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                .toLocalDate().atTime(23, 59, 59);

        Map<String, Object> stats = new HashMap<>();

        // ============ JOB STATISTICS ============
        stats.put("totalJobs", jobCardRepository.count());
        stats.put("pendingJobs", jobCardRepository.countByStatus(JobStatus.PENDING));

        // ============ DAILY STATISTICS ============

        // Daily Revenue
        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
        if (dailyRevenue == null) {
            dailyRevenue = 0.0;
        }
        stats.put("dailyRevenue", dailyRevenue);

        // Daily Expenses - CORRECTED: Use getTotalExpenses with proper date range
        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
        if (dailyExpenses == null) {
            dailyExpenses = 0.0;
        }
        stats.put("dailyExpenses", dailyExpenses);

        // Daily Profit
        double dailyProfit = dailyRevenue - dailyExpenses;
        stats.put("dailyProfit", dailyProfit);

        // ============ MONTHLY STATISTICS ============

        // Monthly Revenue
        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
        if (monthlyRevenue == null) {
            monthlyRevenue = 0.0;
        }
        stats.put("monthlyRevenue", monthlyRevenue);

        // Monthly Expenses - CORRECTED: Use getTotalExpenses with proper date range
        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
        if (monthlyExpenses == null) {
            monthlyExpenses = 0.0;
        }
        stats.put("monthlyExpenses", monthlyExpenses);

        // Monthly Profit
        double monthlyProfit = monthlyRevenue - monthlyExpenses;
        stats.put("monthlyProfit", monthlyProfit);

        return stats;
    }

    /**
     * Get detailed profit report for a custom date range
     * Used for custom date range filtering in frontend
     */
    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
        // Validate date range
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Get revenue for date range
        Double revenue = invoiceRepository.getTotalRevenue(start, end);
        if (revenue == null) {
            revenue = 0.0;
        }

        // Get expenses for date range - CORRECTED: Use getTotalExpenses
        Double expenses = expenseRepository.getTotalExpenses(start, end);
        if (expenses == null) {
            expenses = 0.0;
        }

        // Calculate profit
        Double netProfit = revenue - expenses;

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", revenue);
        report.put("totalExpenses", expenses);
        report.put("netProfit", netProfit);
        report.put("startDate", start);
        report.put("endDate", end);

        return report;
    }

    /**
     * Get income vs expenses report for a date range
     */
    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
        // Convert to LocalDateTime for database queries
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Get all invoices and expenses for the date range
        var invoices = invoiceService.getInvoicesByDateRange(startDateTime, endDateTime);
        var expenses = expenseService.getExpensesByDateRange(startDate, endDate);

        // Calculate totals
        Double totalIncome = invoices.stream()
                .mapToDouble(inv -> inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0)
                .sum();

        Double totalExpenses = expenses.stream()
                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
                .sum();

        Double netProfit = totalIncome - totalExpenses;

        // Calculate daily breakdown
        Map<LocalDate, DailySummary> dailyBreakdown = calculateDailyBreakdown(invoices, expenses, startDate, endDate);

        return new IncomeExpenseReport(
                startDate,
                endDate,
                totalIncome,
                totalExpenses,
                netProfit,
                (long) invoices.size(),
                (long) expenses.size(),
                dailyBreakdown
        );
    }

    /**
     * Get current month income vs expenses report
     */
    public IncomeExpenseReport getCurrentMonthReport() {
        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();
        return getIncomeExpenseReport(startDate, endDate);
    }

    private Map<LocalDate, DailySummary> calculateDailyBreakdown(
            List<Invoice> invoices,
            List<Expense> expenses,
            LocalDate startDate,
            LocalDate endDate) {

        Map<LocalDate, DailySummary> dailyMap = new HashMap<>();

        // Initialize all dates in range
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
            currentDate = currentDate.plusDays(1);
        }

        // Process invoices by day
        invoices.forEach(invoice -> {
            LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate();
            if (!invoiceDate.isBefore(startDate) && !invoiceDate.isAfter(endDate)) {
                DailySummary summary = dailyMap.get(invoiceDate);
                if (summary != null) {
                    summary = new DailySummary(
                            invoiceDate,
                            summary.income() + (invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0),
                            summary.expenses()
                    );
                    dailyMap.put(invoiceDate, summary);
                }
            }
        });

        // Process expenses by day
        expenses.forEach(expense -> {
            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
                DailySummary summary = dailyMap.get(expenseDate);
                if (summary != null) {
                    summary = new DailySummary(
                            expenseDate,
                            summary.income(),
                            summary.expenses() + (expense.getAmount() != null ? expense.getAmount().doubleValue() : 0.0)
                    );
                    dailyMap.put(expenseDate, summary);
                }
            }
        });

        return dailyMap;
    }

    /**
     * Get revenue for a specific date range
     */
    public Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        Double revenue = invoiceRepository.getTotalRevenue(start, end);
        return revenue != null ? revenue : 0.0;
    }

    /**
     * Get expenses for a specific date range
     */
    public Double getExpensesByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        Double expenses = expenseRepository.getTotalExpenses(start, end);
        return expenses != null ? expenses : 0.0;
    }

    /**
     * Get daily statistics only
     */
    public Map<String, Object> getDailyStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);

        Map<String, Object> dailyStats = new HashMap<>();

        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);

        dailyStats.put("date", now.toLocalDate());
        dailyStats.put("revenue", dailyRevenue != null ? dailyRevenue : 0.0);
        dailyStats.put("expenses", dailyExpenses != null ? dailyExpenses : 0.0);
        dailyStats.put("profit", (dailyRevenue != null ? dailyRevenue : 0.0) -
                (dailyExpenses != null ? dailyExpenses : 0.0));

        return dailyStats;
    }

    /**
     * Get monthly statistics only
     */
    public Map<String, Object> getMonthlyStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime endOfMonth = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                .toLocalDate().atTime(23, 59, 59);

        Map<String, Object> monthlyStats = new HashMap<>();

        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);

        monthlyStats.put("month", now.getMonth().toString());
        monthlyStats.put("year", now.getYear());
        monthlyStats.put("revenue", monthlyRevenue != null ? monthlyRevenue : 0.0);
        monthlyStats.put("expenses", monthlyExpenses != null ? monthlyExpenses : 0.0);
        monthlyStats.put("profit", (monthlyRevenue != null ? monthlyRevenue : 0.0) -
                (monthlyExpenses != null ? monthlyExpenses : 0.0));

        return monthlyStats;
    }

    /**
     * Get expenses summary by category for date range
     */
    public Map<String, Object> getExpensesSummary(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }

        Map<String, Object> summary = new HashMap<>();

        // Get category breakdown
        java.util.List<Object[]> categoryBreakdown = expenseRepository.getExpensesSummaryByCategory(start, end);
        summary.put("categoryBreakdown", categoryBreakdown);

        // Get total
        Double total = expenseRepository.getTotalExpenses(start, end);
        summary.put("totalExpenses", total != null ? total : 0.0);

        // Get count
        Long count = expenseRepository.countExpensesByDateRange(start, end);
        summary.put("expenseCount", count != null ? count : 0L);

        return summary;
    }

    // Record classes for income expense report
    public record IncomeExpenseReport(
            LocalDate startDate,
            LocalDate endDate,
            Double totalIncome,
            Double totalExpenses,
            Double netProfit,
            Long totalInvoices,
            Long totalExpensesCount,
            Map<LocalDate, DailySummary> dailyBreakdown
    ) {}

    public record DailySummary(
            LocalDate date,
            Double income,
            Double expenses
    ) {}
}