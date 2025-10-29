//package com.example.demo.controller;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.ExpenseCategory;
//import com.example.demo.services.ExpenseService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/expenses")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class ExpenseController {
//    private final ExpenseService expenseService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
//        return ResponseEntity.ok(expenseService.createExpense(expense));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<Expense>> getAllExpenses() {
//        return ResponseEntity.ok(expenseService.getAllExpenses());
//    }
//
//    @GetMapping("/range")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<Expense>> getExpensesByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
//        return ResponseEntity.ok(expenseService.getExpensesByDateRange(start, end));
//    }
//
//    @PostMapping("/categories")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category) {
//        return ResponseEntity.ok(expenseService.createCategory(category));
//    }
//
//    @GetMapping("/categories")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
//        return ResponseEntity.ok(expenseService.getAllCategories());
//    }
//}
//package com.example.demo.controller;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.ExpenseCategory;
//import com.example.demo.services.ExpenseService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/expenses")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class ExpenseController {
//    private final ExpenseService expenseService;
//
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
//        return ResponseEntity.ok(expenseService.createExpense(expense));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Expense>> getAllExpenses() {
//        return ResponseEntity.ok(expenseService.getAllExpenses());
//    }
//
//    @GetMapping("/active")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Expense>> getAllActiveExpenses() {
//        return ResponseEntity.ok(expenseService.getAllActiveExpenses());
//    }
//
//    @GetMapping("/range")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Expense>> getExpensesByDateRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
//        return ResponseEntity.ok(expenseService.getExpensesByDateRange(start, end));
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
//        return ResponseEntity.ok(expenseService.getExpenseById(id));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expense) {
//        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
//        expenseService.deleteExpense(id);
//        return ResponseEntity.ok().build();
//    }
//
//    // Expense Category endpoints
//    @PostMapping("/categories")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ExpenseCategory> createCategory(@Valid @RequestBody ExpenseCategory category) {
//        return ResponseEntity.ok(expenseService.createCategory(category));
//    }
//
//    @GetMapping("/categories")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
//        return ResponseEntity.ok(expenseService.getAllCategories());
//    }
//
//    @GetMapping("/categories/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<ExpenseCategory> getCategoryById(@PathVariable Long id) {
//        return ResponseEntity.ok(expenseService.getCategoryById(id));
//    }
//
//    @PutMapping("/categories/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ExpenseCategory> updateCategory(@PathVariable Long id, @Valid @RequestBody ExpenseCategory category) {
//        return ResponseEntity.ok(expenseService.updateCategory(id, category));
//    }
//
//    @DeleteMapping("/categories/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
//        expenseService.deleteCategory(id);
//        return ResponseEntity.ok().build();
//    }
//}

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

import java.time.LocalDateTime;
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

    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Expense>> getAllExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(expenseService.getExpensesByDateRange(startDate, endDate));
        }
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

//    @GetMapping("/expenses/active")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<Expense>> getAllActiveExpenses() {
//        return ResponseEntity.ok(expenseService.getAllActiveExpenses());
//    }

    @GetMapping("/expenses/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(expenseService.getExpensesByDateRange(start, end));
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