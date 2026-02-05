package com.example.demo.service;

import com.example.demo.entity.Expense;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.ExpenseCategoryRepository;
import com.example.demo.repositories.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final NotificationService notificationService;

    private Map<String, Object> createExpensePayload(Expense expense) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", expense.getId());
        payload.put("category", expense.getCategory());
        payload.put("description", expense.getDescription());
        payload.put("amount", expense.getAmount());
        payload.put("autoCreated", expense.getAutoCreated());
        payload.put("sourceType", expense.getSourceType());
        payload.put("createdAt", expense.getCreatedAt());
        return payload;
    }

    private Map<String, Object> createCategoryPayload(ExpenseCategory category) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", category.getId());
        payload.put("name", category.getName());
        payload.put("description", category.getDescription());
        payload.put("isActive", category.getIsActive());
        payload.put("createdAt", category.getCreatedAt());
//        payload.put("updatedAt", category.getUpdatedAt());
        return payload;
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        Expense saved = expenseRepository.save(expense);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Expense created: " + expense.getCategory() + " | Amount: Rs." + expense.getAmount(),
                createExpensePayload(saved),
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    @Transactional
    public Expense createExpenseFromInventory(String itemName, String sku, Integer quantity,
                                              Double unitPrice, String reason) {
        try {
            if (unitPrice == null || unitPrice <= 0) {
                System.out.println("⚠️ Cannot create expense - no purchase price for item: " + itemName);
                return null;
            }

            if (quantity == null || quantity <= 0) {
                System.out.println("⚠️ Cannot create expense - invalid quantity for item: " + itemName);
                return null;
            }

            Double totalAmount = unitPrice * quantity;

            Expense expense = new Expense();
            expense.setCategory("Inventory Purchase");

            String description = String.format(
                    "Item: %s (SKU: %s) | Qty: %d | Unit Price: Rs.%.2f | Reason: %s",
                    itemName, sku, quantity, unitPrice, reason
            );
            expense.setDescription(description);
            expense.setAmount(BigDecimal.valueOf(totalAmount));
            expense.setAutoCreated(true);
            expense.setSourceType("INVENTORY_PURCHASE");

            Expense saved = expenseRepository.save(expense);

            System.out.println("✅ [EXPENSE AUTO-CREATED]");
            System.out.println("   Expense ID: #" + saved.getId());
            System.out.println("   Item: " + itemName + " (SKU: " + sku + ")");
            System.out.println("   Quantity: " + quantity);
            System.out.println("   Unit Price: Rs." + unitPrice);
            System.out.println("   Total Amount: Rs." + totalAmount);
            System.out.println("   Category: Inventory Purchase");
            System.out.println("   Created At: " + saved.getCreatedAt());

            return saved;

        } catch (Exception e) {
            System.err.println("❌ Failed to auto-create expense for item: " + itemName);
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAllOrderByCreatedAtDesc();
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
    }

    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        System.out.println("🔍 Fetching expenses from " + startDateTime + " to " + endDateTime);
        List<Expense> expenses = expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        System.out.println("📊 Found " + expenses.size() + " expenses in date range");

        return expenses;
    }

    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }

    public Double getTotalExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Double total = expenseRepository.getTotalExpenses(startDateTime, endDateTime);
        return total != null ? total : 0.0;
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

        Expense saved = expenseRepository.save(existing);

        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Expense updated: " + existing.getCategory() + " | Amount: Rs." + existing.getAmount(),
                createExpensePayload(saved),
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = getExpenseById(id);
        Map<String, Object> payload = createExpensePayload(expense);

        expenseRepository.delete(expense);

        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Expense deleted: " + expense.getCategory() + " | Amount: Rs." + expense.getAmount(),
                payload,
                NotificationSeverity.WARNING
        );
    }

    @Transactional
    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category already exists: " + category.getName());
        }

        ExpenseCategory saved = categoryRepository.save(category);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Expense category created: " + category.getName(),
                createCategoryPayload(saved),
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public ExpenseCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    @Transactional
    public ExpenseCategory updateCategory(Long id, ExpenseCategory updates) {
        ExpenseCategory existing = getCategoryById(id);

        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
                throw new IllegalArgumentException("Category name already exists: " + updates.getName());
            }
            existing.setName(updates.getName());
        }

        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }

        if (updates.getIsActive() != null) {
            existing.setIsActive(updates.getIsActive());
        }

        ExpenseCategory saved = categoryRepository.save(existing);

        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Expense category updated: " + existing.getName(),
                createCategoryPayload(saved),
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteCategory(Long id) {
        ExpenseCategory category = getCategoryById(id);
        Map<String, Object> payload = createCategoryPayload(category);

        categoryRepository.delete(category);

        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Expense category deleted: " + category.getName(),
                payload,
                NotificationSeverity.WARNING
        );
    }
}