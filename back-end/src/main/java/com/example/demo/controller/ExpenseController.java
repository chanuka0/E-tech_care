
package com.example.demo.controller;

import com.example.demo.entity.Expense;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.services.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {
    private final ExpenseService expenseService;

    // ========== EXPENSE ENDPOINTS ==========

    @PostMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.createExpense(expense));
    }

    /**
     * Get all expenses with optional date filtering
     * If startDate and endDate are provided, returns expenses within that date range (date only, no time)
     * If not provided, returns all expenses
     *
     * @param startDate optional start date (format: yyyy-MM-dd)
     * @param endDate optional end date (format: yyyy-MM-dd)
     * @return list of expenses
     */
    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Expense>> getAllExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // If both dates are provided, filter by date range
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(expenseService.getExpensesByDateRange(startDate, endDate));
        }

        // Otherwise, return all expenses
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/expenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PutMapping("/expenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @DeleteMapping("/expenses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }

    // ========== EXPENSE CATEGORY ENDPOINTS ==========

    @PostMapping("/expense-categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExpenseCategory> createCategory(@Valid @RequestBody ExpenseCategory category) {
        return ResponseEntity.ok(expenseService.createCategory(category));
    }

    @GetMapping("/expense-categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        return ResponseEntity.ok(expenseService.getAllCategories());
    }

    @GetMapping("/expense-categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ExpenseCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getCategoryById(id));
    }

    @PutMapping("/expense-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExpenseCategory> updateCategory(@PathVariable Long id, @Valid @RequestBody ExpenseCategory category) {
        return ResponseEntity.ok(expenseService.updateCategory(id, category));
    }

    @DeleteMapping("/expense-categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        expenseService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}