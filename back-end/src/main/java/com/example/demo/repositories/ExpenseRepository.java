

package com.example.demo.repositories;

import com.example.demo.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find expenses created between start and end date
     * Uses createdAt field (not expenseDate)
     */
//    List<Expense> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT e FROM Expense e WHERE e.createdAt >= :startDateTime AND e.createdAt <= :endDateTime")
    List<Expense> findByCreatedAtBetween(@Param("startDateTime") LocalDateTime startDateTime,
                                         @Param("endDateTime") LocalDateTime endDateTime);
    /**
     * Find expenses by category name (String, not Long ID)
     */
    List<Expense> findByCategory(String category);

    /**
     * Find expenses by category and date range
     */
    @Query("SELECT e FROM Expense e WHERE e.category = :category AND e.createdAt BETWEEN :start AND :end")
    List<Expense> findByCategoryAndDateRange(
            @Param("category") String category,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Get total expenses amount for a date range
     * Used for dashboard and reports
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.createdAt BETWEEN :start AND :end")
    Double getTotalExpensesByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Legacy method - same as getTotalExpensesByDateRange
     * Kept for compatibility with ReportService
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.createdAt BETWEEN :start AND :end")
    Double getTotalExpenses(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Get total expenses by category for a date range
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.category = :category AND e.createdAt BETWEEN :start AND :end")
    Double getTotalByCategory(
            @Param("category") String category,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Count expenses in a date range
     */
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.createdAt BETWEEN :start AND :end")
    Long countExpensesByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Count expenses by category
     */
    Long countByCategory(String category);

    /**
     * Find all expenses ordered by creation date (newest first)
     */
    @Query("SELECT e FROM Expense e ORDER BY e.createdAt DESC")
    List<Expense> findAllOrderByCreatedAtDesc();

    /**
     * Get summary data: category name and total amount for date range
     */
    @Query("SELECT e.category as category, COALESCE(SUM(e.amount), 0) as total FROM Expense e " +
            "WHERE e.createdAt BETWEEN :start AND :end " +
            "GROUP BY e.category ORDER BY total DESC")
    List<Object[]> getExpensesSummaryByCategory(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /**
     * Get all distinct categories
     */
    @Query("SELECT DISTINCT e.category FROM Expense e ORDER BY e.category")
    List<String> findAllDistinctCategories();
}