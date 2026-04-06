
package com.example.demo.service;

import com.example.demo.entity.Expense;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.JobStatus;
import com.example.demo.repositories.ExpenseRepository;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import com.example.demo.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final JobCardRepository jobCardRepository;
    private final PaymentRepository paymentRepository;

    /**
     * ✅ Get income vs expenses report for a date range
     * - Income: ONLY from PAID invoices (by fullyPaidDate)
     * - Expenses: ALL expenses including auto-created inventory purchases
     */
    public IncomeExpenseReport getIncomeExpenseReport(LocalDate startDate, LocalDate endDate) {
        System.out.println("📊 Generating Income vs Expense Report");
        System.out.println("📅 Date Range: " + startDate + " to " + endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Invoice> paidInvoices = invoiceRepository.findPaidInvoicesByDateRange(startDateTime, endDateTime);
        System.out.println("✅ Paid Invoices Found: " + paidInvoices.size());

        List<Expense> allExpenses = expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        System.out.println("✅ All Expenses Found: " + allExpenses.size());

        Double totalIncome = paidInvoices.stream()
                .mapToDouble(inv -> inv.getTotal() != null ? inv.getTotal() : 0.0)
                .sum();

        Double totalExpenses = allExpenses.stream()
                .mapToDouble(exp -> exp.getAmount() != null ? exp.getAmount().doubleValue() : 0.0)
                .sum();

        Double netProfit = totalIncome - totalExpenses;

        System.out.println("💰 Total Income: Rs." + totalIncome);
        System.out.println("💸 Total Expenses: Rs." + totalExpenses);
        System.out.println("📊 Net Profit: Rs." + netProfit);

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
     * ✅ Get income vs expenses report for a specific year and month
     */
    public IncomeExpenseReport getMonthlyIncomeExpenseReport(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return getIncomeExpenseReport(startDate, endDate);
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

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyMap.put(currentDate, new DailySummary(currentDate, 0.0, 0.0));
            currentDate = currentDate.plusDays(1);
        }

        paidInvoices.forEach(invoice -> {
            if (invoice.getFullyPaidDate() != null) {
                LocalDate paidDate = invoice.getFullyPaidDate().toLocalDate();
                if (!paidDate.isBefore(startDate) && !paidDate.isAfter(endDate)) {
                    DailySummary summary = dailyMap.get(paidDate);
                    if (summary != null) {
                        Double invoiceAmount = invoice.getTotal() != null ? invoice.getTotal() : 0.0;
                        dailyMap.put(paidDate, new DailySummary(
                                paidDate,
                                summary.income() + invoiceAmount,
                                summary.expenses()
                        ));
                    }
                }
            }
        });

        allExpenses.forEach(expense -> {
            LocalDate expenseDate = expense.getCreatedAt().toLocalDate();
            if (!expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate)) {
                DailySummary summary = dailyMap.get(expenseDate);
                if (summary != null) {
                    Double expenseAmount = expense.getAmount() != null ?
                            expense.getAmount().doubleValue() : 0.0;
                    dailyMap.put(expenseDate, new DailySummary(
                            expenseDate,
                            summary.income(),
                            summary.expenses() + expenseAmount
                    ));
                }
            }
        });

        return dailyMap;
    }

    /**
     * ✅ Get detailed breakdown for a specific date
     */
    public DailyDetailsReport getDailyDetails(LocalDate date) {
        System.out.println("📊 Getting Daily Details for: " + date);

        List<Invoice> dailyInvoices = invoiceRepository.findPaidInvoicesByDate(date);
        List<Expense> dailyExpenses = expenseRepository.findExpensesByDate(date);

        List<InvoiceDetail> invoiceDetails = dailyInvoices.stream()
                .map(inv -> new InvoiceDetail(
                        inv.getId(),
                        inv.getInvoiceNumber(),
                        inv.getCustomerName(),
                        inv.getTotal(),
                        inv.getFullyPaidDate()
                ))
                .collect(Collectors.toList());

        List<ExpenseDetail> expenseDetails = dailyExpenses.stream()
                .map(exp -> new ExpenseDetail(
                        exp.getId(),
                        exp.getCategory(),
                        exp.getDescription(),
                        exp.getAmount().doubleValue(),
                        exp.getInvoiceNumber(),
                        exp.getCreatedAt()
                ))
                .collect(Collectors.toList());

        Double totalIncome = invoiceDetails.stream().mapToDouble(InvoiceDetail::amount).sum();
        Double totalExpenses = expenseDetails.stream().mapToDouble(ExpenseDetail::amount).sum();

        return new DailyDetailsReport(
                date,
                totalIncome,
                totalExpenses,
                totalIncome - totalExpenses,
                invoiceDetails,
                expenseDetails
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

    /**
     * ✅ FIXED getDashboardStats:
     *
     * Revenue = actual Payment records received today
     *         + advance payments on job cards created today that have NO invoice yet
     *           (these will be excluded once an invoice is created, because the invoice
     *            creation creates its own Payment record for the same advance amount)
     *
     * This ensures:
     * - Advance at job card creation → shows immediately in Today's Revenue
     * - When invoice is created later with that advance as paidAmount → the Payment
     *   record replaces it (the job card advance query excludes job cards that already
     *   have an invoice, so no double-counting)
     * - Additional payments via addPayment() → show on the day they are received
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

        // ============ DAILY REVENUE ============
        // Step 1: Sum all Payment records received today (covers invoice payments
        //         and advances that were recorded via Invoice creation)
        Double dailyPayments = paymentRepository.getTotalPaymentsByDateRange(startOfDay, endOfDay);
        if (dailyPayments == null) dailyPayments = 0.0;

        // Step 2: Sum advance payments on job cards created TODAY that have NO invoice yet
        // These are advances that haven't been converted to a Payment record yet
        Double dailyJobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(startOfDay, endOfDay);
        if (dailyJobCardAdvances == null) dailyJobCardAdvances = 0.0;

        // Total daily revenue = invoice payments received today + raw job card advances (no invoice yet)
        Double dailyRevenue = dailyPayments + dailyJobCardAdvances;
        stats.put("dailyRevenue", dailyRevenue);

        System.out.println("💰 Daily Revenue Breakdown:");
        System.out.println("   Payment records today: Rs." + dailyPayments);
        System.out.println("   Job card advances (no invoice): Rs." + dailyJobCardAdvances);
        System.out.println("   Total daily revenue: Rs." + dailyRevenue);

        // ============ DAILY EXPENSES ============
        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
        if (dailyExpenses == null) dailyExpenses = 0.0;
        stats.put("dailyExpenses", dailyExpenses);

        stats.put("dailyProfit", dailyRevenue - dailyExpenses);

        // ============ MONTHLY REVENUE ============
        // Same logic applied to the full month
        Double monthlyPayments = paymentRepository.getTotalPaymentsByDateRange(startOfMonth, endOfMonth);
        if (monthlyPayments == null) monthlyPayments = 0.0;

        Double monthlyJobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(startOfMonth, endOfMonth);
        if (monthlyJobCardAdvances == null) monthlyJobCardAdvances = 0.0;

        Double monthlyRevenue = monthlyPayments + monthlyJobCardAdvances;
        stats.put("monthlyRevenue", monthlyRevenue);

        System.out.println("📅 Monthly Revenue Breakdown:");
        System.out.println("   Payment records this month: Rs." + monthlyPayments);
        System.out.println("   Job card advances (no invoice): Rs." + monthlyJobCardAdvances);
        System.out.println("   Total monthly revenue: Rs." + monthlyRevenue);

        // ============ MONTHLY EXPENSES ============
        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
        if (monthlyExpenses == null) monthlyExpenses = 0.0;
        stats.put("monthlyExpenses", monthlyExpenses);

        stats.put("monthlyProfit", monthlyRevenue - monthlyExpenses);

        return stats;
    }

    /**
     * ✅ Get profit report for custom date range
     * Uses Payment records + job card advances without invoice for the given range.
     */
    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Revenue = payments received in range + job card advances without invoice in range
        Double payments = paymentRepository.getTotalPaymentsByDateRange(start, end);
        if (payments == null) payments = 0.0;

        Double jobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(start, end);
        if (jobCardAdvances == null) jobCardAdvances = 0.0;

        Double revenue = payments + jobCardAdvances;

        Double expenses = expenseRepository.getTotalExpenses(start, end);
        if (expenses == null) expenses = 0.0;

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", revenue);
        report.put("totalExpenses", expenses);
        report.put("netProfit", revenue - expenses);
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

        Double dailyPayments = paymentRepository.getTotalPaymentsByDateRange(startOfDay, endOfDay);
        if (dailyPayments == null) dailyPayments = 0.0;

        Double dailyJobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(startOfDay, endOfDay);
        if (dailyJobCardAdvances == null) dailyJobCardAdvances = 0.0;

        Double dailyRevenue = dailyPayments + dailyJobCardAdvances;
        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, endOfDay);
        if (dailyExpenses == null) dailyExpenses = 0.0;

        dailyStats.put("date", now.toLocalDate());
        dailyStats.put("revenue", dailyRevenue);
        dailyStats.put("expenses", dailyExpenses);
        dailyStats.put("profit", dailyRevenue - dailyExpenses);

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

        Double monthlyPayments = paymentRepository.getTotalPaymentsByDateRange(startOfMonth, endOfMonth);
        if (monthlyPayments == null) monthlyPayments = 0.0;

        Double monthlyJobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(startOfMonth, endOfMonth);
        if (monthlyJobCardAdvances == null) monthlyJobCardAdvances = 0.0;

        Double monthlyRevenue = monthlyPayments + monthlyJobCardAdvances;
        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, endOfMonth);
        if (monthlyExpenses == null) monthlyExpenses = 0.0;

        monthlyStats.put("month", now.getMonth().toString());
        monthlyStats.put("year", now.getYear());
        monthlyStats.put("revenue", monthlyRevenue);
        monthlyStats.put("expenses", monthlyExpenses);
        monthlyStats.put("profit", monthlyRevenue - monthlyExpenses);

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
     * ✅ Get revenue for a specific date range
     * Uses Payment records + job card advances without invoice
     */
    public Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }

        Double payments = paymentRepository.getTotalPaymentsByDateRange(start, end);
        if (payments == null) payments = 0.0;

        Double jobCardAdvances = jobCardRepository.sumAdvancePaymentsWithoutInvoice(start, end);
        if (jobCardAdvances == null) jobCardAdvances = 0.0;

        return payments + jobCardAdvances;
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

    public record DailyDetailsReport(
            LocalDate date,
            Double totalIncome,
            Double totalExpenses,
            Double netProfit,
            List<InvoiceDetail> incomeDetails,
            List<ExpenseDetail> expenseDetails
    ) {}

    public record InvoiceDetail(
            Long id,
            String invoiceNumber,
            String customerName,
            Double amount,
            LocalDateTime paidDate
    ) {}

    public record ExpenseDetail(
            Long id,
            String category,
            String description,
            Double amount,
            String invoiceNumber,
            LocalDateTime createdAt
    ) {}
}