package com.example.demo.services;

import com.example.demo.entity.JobStatus;
import com.example.demo.repositories.DamagedItemRepository;
import com.example.demo.repositories.ExpenseRepository;
import com.example.demo.repositories.InvoiceRepository;
import com.example.demo.repositories.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final JobCardRepository jobCardRepository;
    private final DamagedItemRepository damagedItemRepository;

    public Map<String, Object> getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        Map<String, Object> stats = new HashMap<>();

        // Job stats
        stats.put("totalJobs", jobCardRepository.count());
        stats.put("pendingJobs", jobCardRepository.countByStatus(JobStatus.PENDING));

        // Revenue
        Double dailyRevenue = invoiceRepository.getTotalRevenue(startOfDay, now);
        Double monthlyRevenue = invoiceRepository.getTotalRevenue(startOfMonth, now);
        stats.put("dailyRevenue", dailyRevenue != null ? dailyRevenue : 0.0);
        stats.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : 0.0);

        // Expenses
        Double dailyExpenses = expenseRepository.getTotalExpenses(startOfDay, now);
        Double monthlyExpenses = expenseRepository.getTotalExpenses(startOfMonth, now);
        stats.put("dailyExpenses", dailyExpenses != null ? dailyExpenses : 0.0);
        stats.put("monthlyExpenses", monthlyExpenses != null ? monthlyExpenses : 0.0);

        // Profit
        double dailyProfit = (dailyRevenue != null ? dailyRevenue : 0.0) -
                (dailyExpenses != null ? dailyExpenses : 0.0);
        double monthlyProfit = (monthlyRevenue != null ? monthlyRevenue : 0.0) -
                (monthlyExpenses != null ? monthlyExpenses : 0.0);
        stats.put("dailyProfit", dailyProfit);
        stats.put("monthlyProfit", monthlyProfit);

        return stats;
    }

    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
        Double revenue = invoiceRepository.getTotalRevenue(start, end);
        Double expenses = expenseRepository.getTotalExpenses(start, end);

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", revenue != null ? revenue : 0.0);
        report.put("totalExpenses", expenses != null ? expenses : 0.0);
        report.put("netProfit", (revenue != null ? revenue : 0.0) -
                (expenses != null ? expenses : 0.0));

        return report;
    }
}