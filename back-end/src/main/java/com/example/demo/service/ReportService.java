//package com.example.demo.service;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.repositories.ExpenseRepository;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final InvoiceRepository invoiceRepository;
//    private final ExpenseRepository expenseRepository;
//    private final JobCardRepository jobCardRepository;
//
//    /**
//     * Get dashboard statistics for today and this month
//     * ✅ FIXED: Income counted only from PAID invoices
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
//        // ✅ FIXED: Daily Revenue from PAID invoices only (by fullyPaidDate)
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
//        if (dailyRevenue == null) dailyRevenue = 0.0;
//        stats.put("dailyRevenue", dailyRevenue);
//
//        // Daily Expenses
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
//        if (dailyExpenses == null) dailyExpenses = 0.0;
//        stats.put("dailyExpenses", dailyExpenses);
//
//        stats.put("dailyProfit", dailyRevenue - dailyExpenses);
//
//        // ============ MONTHLY STATISTICS ============
//
//        // ✅ FIXED: Monthly Revenue from PAID invoices only
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
//        if (monthlyRevenue == null) monthlyRevenue = 0.0;
//        stats.put("monthlyRevenue", monthlyRevenue);
//
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
//        if (monthlyExpenses == null) monthlyExpenses = 0.0;
//        stats.put("monthlyExpenses", monthlyExpenses);
//
//        stats.put("monthlyProfit", monthlyRevenue - monthlyExpenses);
//
//        return stats;
//    }
//
//    /**
//     * Get detailed profit report for a custom date range
//     * ✅ FIXED: Only counts PAID invoice amounts as income
//     */
//    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        if (start.isAfter(end)) {
//            throw new IllegalArgumentException("Start date must be before end date");
//        }
//
//        // ✅ FIXED: Get revenue ONLY from PAID invoices
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        if (revenue == null) revenue = 0.0;
//
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//        if (expenses == null) expenses = 0.0;
//
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
//     * Get income vs expenses report for a date range
//     * ✅ FIXED: Income only from PAID invoices (by fullyPaidDate)
//     */
//    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
//        LocalDateTime startDateTime = startDate.atStartOfDay();
//        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
//
//        // ✅ FIXED: Get ONLY PAID invoices with fullyPaidDate in range
//        var paidInvoices = invoiceRepository.findPaidInvoicesByDateRange(startDateTime, endDateTime);
//        var expenses = expenseRepository.findByCreatedAtBetween(startDate.atStartOfDay(), endDate.plusDays(1).minusDays(1).atStartOfDay());
//
//        // Calculate income ONLY from paid amount
//        Double totalIncome = paidInvoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
//                .sum();
//
//        Double totalExpenses = expenses.stream()
//                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
//                .sum();
//
//        Double netProfit = totalIncome - totalExpenses;
//
//        // Calculate daily breakdown using fullyPaidDate for invoices
//        Map<LocalDate, DailySummary> dailyBreakdown = calculateDailyBreakdown(paidInvoices, expenses, startDate, endDate);
//
//        return new IncomeExpenseReport(
//                startDate,
//                endDate,
//                totalIncome,
//                totalExpenses,
//                netProfit,
//                (long) paidInvoices.size(),
//                (long) expenses.size(),
//                dailyBreakdown
//        );
//    }
//
//    /**
//     * Get current month income vs expenses report
//     */
//    public IncomeExpenseReport getCurrentMonthReport() {
//        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
//        LocalDate endDate = LocalDate.now();
//        return getIncomeExpenseReport(startDate, endDate);
//    }
//
//    /**
//     * Calculate daily breakdown - uses fullyPaidDate for invoices
//     */
//    private Map<LocalDate, DailySummary> calculateDailyBreakdown(
//            List<Invoice> paidInvoices,
//            List<Expense> expenses,
//            LocalDate startDate,
//            LocalDate endDate) {
//
//        Map<LocalDate, DailySummary> dailyMap = new HashMap<>();
//
//        // Initialize all dates
//        LocalDate currentDate = startDate;
//        while (!currentDate.isAfter(endDate)) {
//            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
//            currentDate = currentDate.plusDays(1);
//        }
//
//        // Process PAID invoices by fullyPaidDate
//        paidInvoices.forEach(invoice -> {
//            if (invoice.getFullyPaidDate() != null) {
//                LocalDate paidDate = invoice.getFullyPaidDate().toLocalDate();
//                if (!paidDate.isBefore(startDate) && !paidDate.isAfter(endDate)) {
//                    DailySummary summary = dailyMap.get(paidDate);
//                    if (summary != null) {
//                        summary = new DailySummary(
//                                paidDate,
//                                summary.income() + (invoice.getTotal() != null ? invoice.getTotal() : 0.0),
//                                summary.expenses()
//                        );
//                        dailyMap.put(paidDate, summary);
//                    }
//                }
//            }
//        });
//
//        // Process expenses
//        expenses.forEach(expense -> {
//            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
//            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
//                DailySummary summary = dailyMap.get(expenseDate);
//                if (summary != null) {
//                    summary = new DailySummary(
//                            expenseDate,
//                            summary.income(),
//                            summary.expenses() + (expense.getAmount() != null ? expense.getAmount().doubleValue() : 0.0)
//                    );
//                    dailyMap.put(expenseDate, summary);
//                }
//            }
//        });
//
//        return dailyMap;
//    }
//
//    /**
//     * Get revenue for a specific date range - PAID invoices only
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
//        var categoryBreakdown = expenseRepository.getExpensesSummaryByCategory(start, end);
//        summary.put("categoryBreakdown", categoryBreakdown);
//
//        Double total = expenseRepository.getTotalExpenses(start, end);
//        summary.put("totalExpenses", total != null ? total : 0.0);
//
//        Long count = expenseRepository.countExpensesByDateRange(start, end);
//        summary.put("expenseCount", count != null ? count : 0L);
//
//        return summary;
//    }
//
//    // Record classes
//    public record IncomeExpenseReport(
//            LocalDate startDate,
//            LocalDate endDate,
//            Double totalIncome,
//            Double totalExpenses,
//            Double netProfit,
//            Long totalInvoices,
//            Long totalExpensesCount,
//            Map<LocalDate, DailySummary> dailyBreakdown
//    ) {}
//
//    public record DailySummary(
//            LocalDate date,
//            Double income,
//            Double expenses
//    ) {}
//}

// ============================================================
// FILE 2: ReportService.java (No Changes - Already Correct)
// ============================================================

//package com.example.demo.service;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.repositories.ExpenseRepository;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final InvoiceRepository invoiceRepository;
//    private final ExpenseRepository expenseRepository;
//    private final JobCardRepository jobCardRepository;
//
//    /**
//     * Get dashboard statistics for today and this month
//     * ✅ FIXED: Income counted only from PAID invoices
//     * ✅ Includes auto-created expenses from inventory purchases
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
//        // ✅ Daily Revenue from PAID invoices only (by fullyPaidDate)
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
//        if (dailyRevenue == null) dailyRevenue = 0.0;
//        stats.put("dailyRevenue", dailyRevenue);
//
//        // ✅ Daily Expenses (includes auto-created inventory expenses)
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
//        if (dailyExpenses == null) dailyExpenses = 0.0;
//        stats.put("dailyExpenses", dailyExpenses);
//
//        stats.put("dailyProfit", dailyRevenue - dailyExpenses);
//
//        // ============ MONTHLY STATISTICS ============
//
//        // ✅ Monthly Revenue from PAID invoices only
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
//        if (monthlyRevenue == null) monthlyRevenue = 0.0;
//        stats.put("monthlyRevenue", monthlyRevenue);
//
//        // ✅ Monthly Expenses (includes auto-created inventory expenses)
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
//        if (monthlyExpenses == null) monthlyExpenses = 0.0;
//        stats.put("monthlyExpenses", monthlyExpenses);
//
//        stats.put("monthlyProfit", monthlyRevenue - monthlyExpenses);
//
//        return stats;
//    }
//
//    /**
//     * Get detailed profit report for a custom date range
//     * ✅ FIXED: Only counts PAID invoice amounts as income
//     * ✅ Includes all expenses (manual + auto-created from inventory)
//     */
//    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        if (start.isAfter(end)) {
//            throw new IllegalArgumentException("Start date must be before end date");
//        }
//
//        // ✅ Get revenue ONLY from PAID invoices
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        if (revenue == null) revenue = 0.0;
//
//        // ✅ Get ALL expenses (includes inventory purchases)
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//        if (expenses == null) expenses = 0.0;
//
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
//     * Get income vs expenses report for a date range
//     * ✅ Income only from PAID invoices (by fullyPaidDate)
//     * ✅ Expenses include auto-created inventory purchases
//     */
//    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
//        LocalDateTime startDateTime = startDate.atStartOfDay();
//        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
//
//        // ✅ Get ONLY PAID invoices with fullyPaidDate in range
//        var paidInvoices = invoiceRepository.findPaidInvoicesByDateRange(startDateTime, endDateTime);
//
//        // ✅ Get ALL expenses (includes inventory purchases)
//        var expenses = expenseRepository.findByCreatedAtBetween(
//                startDate.atStartOfDay(),
//                endDate.plusDays(1).minusDays(1).atStartOfDay()
//        );
//
//        // Calculate income ONLY from paid amount
//        Double totalIncome = paidInvoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
//                .sum();
//
//        // Calculate total expenses
//        Double totalExpenses = expenses.stream()
//                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
//                .sum();
//
//        Double netProfit = totalIncome - totalExpenses;
//
//        // Calculate daily breakdown
//        Map<LocalDate, DailySummary> dailyBreakdown = calculateDailyBreakdown(
//                paidInvoices, expenses, startDate, endDate
//        );
//
//        return new IncomeExpenseReport(
//                startDate,
//                endDate,
//                totalIncome,
//                totalExpenses,
//                netProfit,
//                (long) paidInvoices.size(),
//                (long) expenses.size(),
//                dailyBreakdown
//        );
//    }
//
//    /**
//     * Get current month income vs expenses report
//     */
//    public IncomeExpenseReport getCurrentMonthReport() {
//        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
//        LocalDate endDate = LocalDate.now();
//        return getIncomeExpenseReport(startDate, endDate);
//    }
//
//    /**
//     * Calculate daily breakdown - uses fullyPaidDate for invoices
//     * ✅ Includes all expenses (manual + inventory purchases)
//     */
//    private Map<LocalDate, DailySummary> calculateDailyBreakdown(
//            List<Invoice> paidInvoices,
//            List<Expense> expenses,
//            LocalDate startDate,
//            LocalDate endDate) {
//
//        Map<LocalDate, DailySummary> dailyMap = new HashMap<>();
//
//        // Initialize all dates
//        LocalDate currentDate = startDate;
//        while (!currentDate.isAfter(endDate)) {
//            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
//            currentDate = currentDate.plusDays(1);
//        }
//
//        // Process PAID invoices by fullyPaidDate
//        paidInvoices.forEach(invoice -> {
//            if (invoice.getFullyPaidDate() != null) {
//                LocalDate paidDate = invoice.getFullyPaidDate().toLocalDate();
//                if (!paidDate.isBefore(startDate) && !paidDate.isAfter(endDate)) {
//                    DailySummary summary = dailyMap.get(paidDate);
//                    if (summary != null) {
//                        summary = new DailySummary(
//                                paidDate,
//                                summary.income() + (invoice.getTotal() != null ? invoice.getTotal() : 0.0),
//                                summary.expenses()
//                        );
//                        dailyMap.put(paidDate, summary);
//                    }
//                }
//            }
//        });
//
//        // Process ALL expenses (includes inventory purchases)
//        expenses.forEach(expense -> {
//            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
//            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
//                DailySummary summary = dailyMap.get(expenseDate);
//                if (summary != null) {
//                    summary = new DailySummary(
//                            expenseDate,
//                            summary.income(),
//                            summary.expenses() + (expense.getAmount() != null ? expense.getAmount().doubleValue() : 0.0)
//                    );
//                    dailyMap.put(expenseDate, summary);
//                }
//            }
//        });
//
//        return dailyMap;
//    }
//
//    /**
//     * Get revenue for a specific date range - PAID invoices only
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
//     * ✅ Includes auto-created inventory expenses
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
//     * ✅ Shows breakdown including "Inventory Purchase" category
//     */
//    public Map<String, Object> getExpensesSummary(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//
//        Map<String, Object> summary = new HashMap<>();
//
//        var categoryBreakdown = expenseRepository.getExpensesSummaryByCategory(start, end);
//        summary.put("categoryBreakdown", categoryBreakdown);
//
//        Double total = expenseRepository.getTotalExpenses(start, end);
//        summary.put("totalExpenses", total != null ? total : 0.0);
//
//        Long count = expenseRepository.countExpensesByDateRange(start, end);
//        summary.put("expenseCount", count != null ? count : 0L);
//
//        return summary;
//    }
//
//    // Record classes
//    public record IncomeExpenseReport(
//            LocalDate startDate,
//            LocalDate endDate,
//            Double totalIncome,
//            Double totalExpenses,
//            Double netProfit,
//            Long totalInvoices,
//            Long totalExpensesCount,
//            Map<LocalDate, DailySummary> dailyBreakdown
//    ) {}
//
//    public record DailySummary(
//            LocalDate date,
//            Double income,
//            Double expenses
//    ) {}
//}

//package com.example.demo.service;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.Invoice;
//import com.example.demo.entity.JobStatus;
//import com.example.demo.repositories.ExpenseRepository;
//import com.example.demo.repositories.InvoiceRepository;
//import com.example.demo.repositories.JobCardRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class ReportService {
//    private final InvoiceRepository invoiceRepository;
//    private final ExpenseRepository expenseRepository;
//    private final JobCardRepository jobCardRepository;
//
//    /**
//     * ✅ FIXED: Get income vs expenses report for a date range
//     * - Income: ONLY from PAID invoices (by fullyPaidDate)
//     * - Expenses: ALL expenses including auto-created inventory purchases
//     */
//    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
//        System.out.println("📊 Generating Income vs Expense Report");
//        System.out.println("📅 Date Range: " + startDate + " to " + endDate);
//
//        LocalDateTime startDateTime = startDate.atStartOfDay();      // 00:00:00
//        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);      // 23:59:59
//
//        // ✅ Get ONLY PAID invoices (by fullyPaidDate)
//        List<Invoice> paidInvoices = invoiceRepository.findPaidInvoicesByDateRange(startDateTime, endDateTime);
//        System.out.println("✅ Paid Invoices Found: " + paidInvoices.size());
//
//        // ✅ Get ALL expenses (manual + auto-created inventory purchases)
//        // Using the same date range for expenses
//        List<Expense> allExpenses = expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
//        System.out.println("✅ All Expenses Found: " + allExpenses.size());
//
//        // Print expense details for debugging
//        if (!allExpenses.isEmpty()) {
//            allExpenses.forEach(exp ->
//                    System.out.println("  - Expense #" + exp.getId() + ": " + exp.getCategory() +
//                            " | Amount: Rs." + exp.getAmount() + " | Created: " + exp.getCreatedAt())
//            );
//        } else {
//            System.out.println("⚠️ WARNING: No expenses found in database for date range!");
//        }
//
//        // Calculate total income from PAID invoices only
//        Double totalIncome = paidInvoices.stream()
//                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
//                .sum();
//
//        // Calculate total expenses (includes auto-created inventory expenses)
//        Double totalExpenses = allExpenses.stream()
//                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
//                .sum();
//
//        Double netProfit = totalIncome - totalExpenses;
//
//        System.out.println("💰 Total Income: Rs." + totalIncome);
//        System.out.println("💸 Total Expenses: Rs." + totalExpenses);
//        System.out.println("📊 Net Profit: Rs." + netProfit);
//
//        // Calculate daily breakdown
//        Map<LocalDate, DailySummary> dailyBreakdown = calculateDailyBreakdown(
//                paidInvoices, allExpenses, startDate, endDate
//        );
//
//        return new IncomeExpenseReport(
//                startDate,
//                endDate,
//                totalIncome,
//                totalExpenses,
//                netProfit,
//                (long) paidInvoices.size(),
//                (long) allExpenses.size(),
//                dailyBreakdown
//        );
//    }
//
//    /**
//     * ✅ Calculate daily breakdown combining income and expenses
//     */
//    private Map<LocalDate, DailySummary> calculateDailyBreakdown(
//            List<Invoice> paidInvoices,
//            List<Expense> allExpenses,
//            LocalDate startDate,
//            LocalDate endDate) {
//
//        Map<LocalDate, DailySummary> dailyMap = new HashMap<>();
//
//        // Initialize all dates in range with zero values
//        LocalDate currentDate = startDate;
//        while (!currentDate.isAfter(endDate)) {
//            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
//            currentDate = currentDate.plusDays(1);
//        }
//
//        // ✅ Process PAID invoices by fullyPaidDate
//        paidInvoices.forEach(invoice -> {
//            if (invoice.getFullyPaidDate() != null) {
//                LocalDate paidDate = invoice.getFullyPaidDate().toLocalDate();
//                if (!paidDate.isBefore(startDate) && !paidDate.isAfter(endDate)) {
//                    DailySummary summary = dailyMap.get(paidDate);
//                    if (summary != null) {
//                        Double invoiceAmount = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
//                        summary = new DailySummary(
//                                paidDate,
//                                summary.income() + invoiceAmount,
//                                summary.expenses()
//                        );
//                        dailyMap.put(paidDate, summary);
//                    }
//                }
//            }
//        });
//
//        // ✅ Process ALL expenses (manual + inventory purchases)
//        allExpenses.forEach(expense -> {
//            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
//            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
//                DailySummary summary = dailyMap.get(expenseDate);
//                if (summary != null) {
//                    Double expenseAmount = expense.getAmount() != null ?
//                            expense.getAmount().doubleValue() : 0.0;
//                    summary = new DailySummary(
//                            expenseDate,
//                            summary.income(),
//                            summary.expenses() + expenseAmount
//                    );
//                    dailyMap.put(expenseDate, summary);
//                }
//            }
//        });
//
//        return dailyMap;
//    }
//
//    /**
//     * Get current month income vs expenses report
//     */
//    public IncomeExpenseReport getCurrentMonthReport() {
//        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
//        LocalDate endDate = LocalDate.now();
//        return getIncomeExpenseReport(startDate, endDate);
//    }
//
//    /**
//     * Get dashboard statistics
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
//        stats.put("totalJobs", jobCardRepository.count());
//        stats.put("pendingJobs", jobCardRepository.countByStatus(JobStatus.PENDING));
//
//        // Daily stats
//        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
//        if (dailyRevenue == null) dailyRevenue = 0.0;
//        stats.put("dailyRevenue", dailyRevenue);
//
//        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
//        if (dailyExpenses == null) dailyExpenses = 0.0;
//        stats.put("dailyExpenses", dailyExpenses);
//
//        stats.put("dailyProfit", dailyRevenue - dailyExpenses);
//
//        // Monthly stats
//        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
//        if (monthlyRevenue == null) monthlyRevenue = 0.0;
//        stats.put("monthlyRevenue", monthlyRevenue);
//
//        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
//        if (monthlyExpenses == null) monthlyExpenses = 0.0;
//        stats.put("monthlyExpenses", monthlyExpenses);
//
//        stats.put("monthlyProfit", monthlyRevenue - monthlyExpenses);
//
//        return stats;
//    }
//
//    /**
//     * Get profit report for custom date range
//     */
//    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
//        if (start == null || end == null) {
//            throw new IllegalArgumentException("Start and end dates are required");
//        }
//        if (start.isAfter(end)) {
//            throw new IllegalArgumentException("Start date must be before end date");
//        }
//
//        Double revenue = invoiceRepository.getTotalRevenue(start, end);
//        if (revenue == null) revenue = 0.0;
//
//        Double expenses = expenseRepository.getTotalExpenses(start, end);
//        if (expenses == null) expenses = 0.0;
//
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
//    // ✅ Record classes
//    public record IncomeExpenseReport(
//            LocalDate startDate,
//            LocalDate endDate,
//            Double totalIncome,
//            Double totalExpenses,
//            Double netProfit,
//            Long totalInvoices,
//            Long totalExpensesCount,
//            Map<LocalDate, DailySummary> dailyBreakdown
//    ) {}
//
//    public record DailySummary(
//            LocalDate date,
//            Double income,
//            Double expenses
//    ) {}
//}



package com.example.demo.service;

import com.example.demo.entity.Expense;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.JobStatus;
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

    /**
     * ✅ Get income vs expenses report for a date range
     * - Income: ONLY from PAID invoices (by fullyPaidDate)
     * - Expenses: ALL expenses including auto-created inventory purchases
     */
    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
        System.out.println("📊 Generating Income vs Expense Report");
        System.out.println("📅 Date Range: " + startDate + " to " + endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();      // 00:00:00
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);      // 23:59:59

        // ✅ Get ONLY PAID invoices (by fullyPaidDate)
        List<Invoice> paidInvoices = invoiceRepository.findPaidInvoicesByDateRange(startDateTime, endDateTime);
        System.out.println("✅ Paid Invoices Found: " + paidInvoices.size());

        // ✅ Get ALL expenses (manual + auto-created inventory purchases)
        List<Expense> allExpenses = expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        System.out.println("✅ All Expenses Found: " + allExpenses.size());

        // Print expense details for debugging
        if (!allExpenses.isEmpty()) {
            allExpenses.forEach(exp ->
                    System.out.println("  - Expense #" + exp.getId() + ": " + exp.getCategory() +
                            " | Amount: Rs." + exp.getAmount() + " | Created: " + exp.getCreatedAt())
            );
        } else {
            System.out.println("⚠️ WARNING: No expenses found in database for date range!");
        }

        // Calculate total income from PAID invoices only
        Double totalIncome = paidInvoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        // Calculate total expenses (includes auto-created inventory expenses)
        Double totalExpenses = allExpenses.stream()
                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
                .sum();

        Double netProfit = totalIncome - totalExpenses;

        System.out.println("💰 Total Income: Rs." + totalIncome);
        System.out.println("💸 Total Expenses: Rs." + totalExpenses);
        System.out.println("📊 Net Profit: Rs." + netProfit);

        // Calculate daily breakdown
        Map<LocalDate, DailySummary> dailyBreakdown = calculateDailyBreakdown(
                paidInvoices, allExpenses, startDate, endDate
        );

        return new IncomeExpenseReport(
                startDate,
                endDate,
                totalIncome,
                totalExpenses,
                netProfit,
                (long) paidInvoices.size(),
                (long) allExpenses.size(),
                dailyBreakdown
        );
    }

    /**
     * ✅ Calculate daily breakdown combining income and expenses
     */
    private Map<LocalDate, DailySummary> calculateDailyBreakdown(
            List<Invoice> paidInvoices,
            List<Expense> allExpenses,
            LocalDate startDate,
            LocalDate endDate) {

        Map<LocalDate, DailySummary> dailyMap = new HashMap<>();

        // Initialize all dates in range with zero values
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
            currentDate = currentDate.plusDays(1);
        }

        // ✅ Process PAID invoices by fullyPaidDate
        paidInvoices.forEach(invoice -> {
            if (invoice.getFullyPaidDate() != null) {
                LocalDate paidDate = invoice.getFullyPaidDate().toLocalDate();
                if (!paidDate.isBefore(startDate) && !paidDate.isAfter(endDate)) {
                    DailySummary summary = dailyMap.get(paidDate);
                    if (summary != null) {
                        Double invoiceAmount = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
                        summary = new DailySummary(
                                paidDate,
                                summary.income() + invoiceAmount,
                                summary.expenses()
                        );
                        dailyMap.put(paidDate, summary);
                    }
                }
            }
        });

        // ✅ Process ALL expenses (manual + inventory purchases)
        allExpenses.forEach(expense -> {
            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
                DailySummary summary = dailyMap.get(expenseDate);
                if (summary != null) {
                    Double expenseAmount = expense.getAmount() != null ?
                            expense.getAmount().doubleValue() : 0.0;
                    summary = new DailySummary(
                            expenseDate,
                            summary.income(),
                            summary.expenses() + expenseAmount
                    );
                    dailyMap.put(expenseDate, summary);
                }
            }
        });

        return dailyMap;
    }

    /**
     * Get current month income vs expenses report
     */
    public IncomeExpenseReport getCurrentMonthReport() {
        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();
        return getIncomeExpenseReport(startDate, endDate);
    }

    /**
     * ✅ Get dashboard statistics for today and this month
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
        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, endOfDay);
        if (dailyRevenue == null) dailyRevenue = 0.0;
        stats.put("dailyRevenue", dailyRevenue);

        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
        if (dailyExpenses == null) dailyExpenses = 0.0;
        stats.put("dailyExpenses", dailyExpenses);

        stats.put("dailyProfit", dailyRevenue - dailyExpenses);

        // ============ MONTHLY STATISTICS ============
        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, endOfMonth);
        if (monthlyRevenue == null) monthlyRevenue = 0.0;
        stats.put("monthlyRevenue", monthlyRevenue);

        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
        if (monthlyExpenses == null) monthlyExpenses = 0.0;
        stats.put("monthlyExpenses", monthlyExpenses);

        stats.put("monthlyProfit", monthlyRevenue - monthlyExpenses);

        return stats;
    }

    /**
     * ✅ Get profit report for custom date range
     */
    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Double revenue = invoiceRepository.getTotalRevenue(start, end);
        if (revenue == null) revenue = 0.0;

        Double expenses = expenseRepository.getTotalExpenses(start, end);
        if (expenses == null) expenses = 0.0;

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
     * ✅ Get daily statistics only
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
     * ✅ Get monthly statistics only
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
     * ✅ Get expenses summary by category for date range
     */
    public Map<String, Object> getExpensesSummary(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }

        Map<String, Object> summary = new HashMap<>();

        var categoryBreakdown = expenseRepository.getExpensesSummaryByCategory(start, end);
        summary.put("categoryBreakdown", categoryBreakdown);

        Double total = expenseRepository.getTotalExpenses(start, end);
        summary.put("totalExpenses", total != null ? total : 0.0);

        Long count = expenseRepository.countExpensesByDateRange(start, end);
        summary.put("expenseCount", count != null ? count : 0L);

        return summary;
    }

    /**
     * ✅ Get revenue for a specific date range - PAID invoices only
     */
    public Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        Double revenue = invoiceRepository.getTotalRevenue(start, end);
        return revenue != null ? revenue : 0.0;
    }

    /**
     * ✅ Get expenses for a specific date range
     */
    public Double getExpensesByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        Double expenses = expenseRepository.getTotalExpenses(start, end);
        return expenses != null ? expenses : 0.0;
    }

    // ========== RECORD CLASSES ==========

    /**
     * Income & Expense Report DTO
     */
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

    /**
     * Daily Summary DTO
     */
    public record DailySummary(
            LocalDate date,
            Double income,
            Double expenses
    ) {}
}