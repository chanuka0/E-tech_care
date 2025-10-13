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
    List<Expense> findByExpenseDateBetween(LocalDateTime start, LocalDateTime end);

    List<Expense> findByCategoryId(Long categoryId);

    List<Expense> findByCreatedBy(Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.expenseDate BETWEEN :start AND :end")
    Double getTotalExpenses(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e WHERE e.expenseDate BETWEEN :start AND :end GROUP BY e.category.name")
    List<Object[]> getExpensesByCategory(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.expenseDate BETWEEN :start AND :end")
    Long countExpensesByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}