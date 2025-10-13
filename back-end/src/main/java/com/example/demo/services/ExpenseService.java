package com.example.demo.services;


import com.example.demo.entity.Expense;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.repositories.ExpenseCategoryRepository;
import com.example.demo.repositories.ExpenseRepository;
import com.example.demo.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;

    @Transactional
    public Expense createExpense(Expense expense) {
        expense.setCreatedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<Expense> getExpensesByDateRange(LocalDateTime start, LocalDateTime end) {
        return expenseRepository.findByExpenseDateBetween(start, end);
    }

    public Double getTotalExpenses(LocalDateTime start, LocalDateTime end) {
        Double total = expenseRepository.getTotalExpenses(start, end);
        return total != null ? total : 0.0;
    }

    @Transactional
    public ExpenseCategory createCategory(ExpenseCategory category) {
        return categoryRepository.save(category);
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
