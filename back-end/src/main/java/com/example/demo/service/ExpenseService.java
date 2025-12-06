
package com.example.demo.service;

import com.example.demo.entity.Expense;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.repositories.ExpenseCategoryRepository;
import com.example.demo.repositories.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;

    @Transactional
    public Expense createExpense(Expense expense) {
        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    /**
     * Get expenses by date range (date only, ignoring time)
     * @param startDate start date
     * @param endDate end date
     * @return list of expenses within the date range
     */
    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        // Convert LocalDate to LocalDateTime for the entire day
        LocalDateTime startDateTime = startDate.atStartOfDay(); // 00:00:00
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX); // 23:59:59

        return expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense updates) {
        Expense existing = getExpenseById(id);
        if (updates.getCategory() != null && !updates.getCategory().trim().isEmpty()) {
            existing.setCategory(updates.getCategory());
        }
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }
        if (updates.getAmount() != null && updates.getAmount().signum() > 0) {
            existing.setAmount(updates.getAmount());
        }
        return expenseRepository.save(existing);
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = getExpenseById(id);
        expenseRepository.delete(expense);
    }

    @Transactional
    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category already exists");
        }

        return categoryRepository.save(category);
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public ExpenseCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Transactional
    public ExpenseCategory updateCategory(Long id, ExpenseCategory updates) {
        ExpenseCategory existing = getCategoryById(id);

        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
                throw new IllegalArgumentException("Category name already exists");
            }
            existing.setName(updates.getName());
        }

        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }

        if (updates.getIsActive() != null) {
            existing.setIsActive(updates.getIsActive());
        }

        return categoryRepository.save(existing);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ExpenseCategory category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}