package com.example.demo.controller;

import com.example.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/profit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getProfitReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getProfitReport(start, end));
    }

    /**
     * Get income vs expenses report for a date range
     */
    @GetMapping("/income-expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReportService.IncomeExpenseReport> getIncomeExpenseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        return ResponseEntity.ok(reportService.getIncomeExpenseReport(startDate, endDate));
    }

    /**
     * Get current month income vs expenses report
     */
    @GetMapping("/income-expenses/current-month")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReportService.IncomeExpenseReport> getCurrentMonthReport() {
        return ResponseEntity.ok(reportService.getCurrentMonthReport());
    }

    /**
     * Get daily statistics only
     */
    @GetMapping("/daily-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getDailyStats() {
        return ResponseEntity.ok(reportService.getDailyStats());
    }

    /**
     * Get monthly statistics only
     */
    @GetMapping("/monthly-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getMonthlyStats() {
        return ResponseEntity.ok(reportService.getMonthlyStats());
    }

    /**
     * Get expenses summary by category for date range
     */
    @GetMapping("/expenses-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getExpensesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getExpensesSummary(start, end));
    }

    /**
     * Get revenue for specific date range
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Double> getRevenueByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getRevenueByDateRange(start, end));
    }

    /**
     * Get expenses for specific date range
     */
    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Double> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getExpensesByDateRange(start, end));
    }
}