////
////package com.example.demo.service;
////
////import com.example.demo.entity.Expense;
////import com.example.demo.entity.ExpenseCategory;
////import com.example.demo.repositories.ExpenseCategoryRepository;
////import com.example.demo.repositories.ExpenseRepository;
////import lombok.RequiredArgsConstructor;
////import org.springframework.stereotype.Service;
////import org.springframework.transaction.annotation.Transactional;
////
////import java.time.LocalDate;
////import java.time.LocalDateTime;
////import java.time.LocalTime;
////import java.util.List;
////
////@Service
////@RequiredArgsConstructor
////public class ExpenseService {
////    private final ExpenseRepository expenseRepository;
////    private final ExpenseCategoryRepository categoryRepository;
////
////    @Transactional
////    public Expense createExpense(Expense expense) {
////        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty()) {
////            throw new IllegalArgumentException("Category is required");
////        }
////        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
////            throw new IllegalArgumentException("Amount must be greater than 0");
////        }
////        return expenseRepository.save(expense);
////    }
////
////    public List<Expense> getAllExpenses() {
////        return expenseRepository.findAll();
////    }
////
////    public Expense getExpenseById(Long id) {
////        return expenseRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Expense not found"));
////    }
////
////    /**
////     * Get expenses by date range (date only, ignoring time)
////     * @param startDate start date
////     * @param endDate end date
////     * @return list of expenses within the date range
////     */
////    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
////        // Convert LocalDate to LocalDateTime for the entire day
////        LocalDateTime startDateTime = startDate.atStartOfDay(); // 00:00:00
////        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX); // 23:59:59
////
////        return expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
////    }
////
////    @Transactional
////    public Expense updateExpense(Long id, Expense updates) {
////        Expense existing = getExpenseById(id);
////        if (updates.getCategory() != null && !updates.getCategory().trim().isEmpty()) {
////            existing.setCategory(updates.getCategory());
////        }
////        if (updates.getDescription() != null) {
////            existing.setDescription(updates.getDescription());
////        }
////        if (updates.getAmount() != null && updates.getAmount().signum() > 0) {
////            existing.setAmount(updates.getAmount());
////        }
////        return expenseRepository.save(existing);
////    }
////
////    @Transactional
////    public void deleteExpense(Long id) {
////        Expense expense = getExpenseById(id);
////        expenseRepository.delete(expense);
////    }
////
////    @Transactional
////    public ExpenseCategory createCategory(ExpenseCategory category) {
////        if (category.getName() == null || category.getName().trim().isEmpty()) {
////            throw new IllegalArgumentException("Category name is required");
////        }
////
////        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
////            throw new IllegalArgumentException("Category already exists");
////        }
////
////        return categoryRepository.save(category);
////    }
////
////    public List<ExpenseCategory> getAllCategories() {
////        return categoryRepository.findAll();
////    }
////
////    public ExpenseCategory getCategoryById(Long id) {
////        return categoryRepository.findById(id)
////                .orElseThrow(() -> new RuntimeException("Category not found"));
////    }
////
////    @Transactional
////    public ExpenseCategory updateCategory(Long id, ExpenseCategory updates) {
////        ExpenseCategory existing = getCategoryById(id);
////
////        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
////            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
////                throw new IllegalArgumentException("Category name already exists");
////            }
////            existing.setName(updates.getName());
////        }
////
////        if (updates.getDescription() != null) {
////            existing.setDescription(updates.getDescription());
////        }
////
////        if (updates.getIsActive() != null) {
////            existing.setIsActive(updates.getIsActive());
////        }
////
////        return categoryRepository.save(existing);
////    }
////
////    @Transactional
////    public void deleteCategory(Long id) {
////        ExpenseCategory category = getCategoryById(id);
////        categoryRepository.delete(category);
////    }
////}
//
//package com.example.demo.service;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.ExpenseCategory;
//import com.example.demo.repositories.ExpenseCategoryRepository;
//import com.example.demo.repositories.ExpenseRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ExpenseService {
//    private final ExpenseRepository expenseRepository;
//    private final ExpenseCategoryRepository categoryRepository;
//
//    @Transactional
//    public Expense createExpense(Expense expense) {
//        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty()) {
//            throw new IllegalArgumentException("Category is required");
//        }
//        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
//            throw new IllegalArgumentException("Amount must be greater than 0");
//        }
//        return expenseRepository.save(expense);
//    }
//
//    /**
//     * ✅ NEW: Auto-create expense from inventory purchase
//     */
//    @Transactional
//    public Expense createExpenseFromInventory(String itemName, String sku, Integer quantity, Double unitPrice, String reason) {
//        try {
//            if (unitPrice == null || unitPrice <= 0) {
//                System.out.println("⚠️ Cannot create expense - no purchase price for item: " + itemName);
//                return null;
//            }
//
//            Double totalAmount = unitPrice * quantity;
//
//            Expense expense = new Expense();
//            expense.setCategory("Inventory Purchase");
//            expense.setDescription("Item: " + itemName + " (SKU: " + sku + ") | Qty: " + quantity +
//                    " | Unit Price: Rs." + unitPrice + " | Reason: " + reason);
//            expense.setAmount(BigDecimal.valueOf(totalAmount));
//
//            Expense saved = expenseRepository.save(expense);
//
//            System.out.println("✅ Expense auto-created: #" + saved.getId() + " | Amount: Rs." + totalAmount +
//                    " | Item: " + itemName + " | Qty: " + quantity);
//            return saved;
//        } catch (Exception e) {
//            System.err.println("❌ Failed to auto-create expense: " + e.getMessage());
//            return null;
//        }
//    }
//
//    public List<Expense> getAllExpenses() {
//        return expenseRepository.findAll();
//    }
//
//    public Expense getExpenseById(Long id) {
//        return expenseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Expense not found"));
//    }
//
//    /**
//     * Get expenses by date range (date only, ignoring time)
//     * @param startDate start date
//     * @param endDate end date
//     * @return list of expenses within the date range
//     */
//    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
//        // Convert LocalDate to LocalDateTime for the entire day
//        LocalDateTime startDateTime = startDate.atStartOfDay(); // 00:00:00
//        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX); // 23:59:59
//
//        return expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
//    }
//
//    @Transactional
//    public Expense updateExpense(Long id, Expense updates) {
//        Expense existing = getExpenseById(id);
//        if (updates.getCategory() != null && !updates.getCategory().trim().isEmpty()) {
//            existing.setCategory(updates.getCategory());
//        }
//        if (updates.getDescription() != null) {
//            existing.setDescription(updates.getDescription());
//        }
//        if (updates.getAmount() != null && updates.getAmount().signum() > 0) {
//            existing.setAmount(updates.getAmount());
//        }
//        return expenseRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteExpense(Long id) {
//        Expense expense = getExpenseById(id);
//        expenseRepository.delete(expense);
//    }
//
//    @Transactional
//    public ExpenseCategory createCategory(ExpenseCategory category) {
//        if (category.getName() == null || category.getName().trim().isEmpty()) {
//            throw new IllegalArgumentException("Category name is required");
//        }
//
//        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
//            throw new IllegalArgumentException("Category already exists");
//        }
//
//        return categoryRepository.save(category);
//    }
//
//    public List<ExpenseCategory> getAllCategories() {
//        return categoryRepository.findAll();
//    }
//
//    public ExpenseCategory getCategoryById(Long id) {
//        return categoryRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Category not found"));
//    }
//
//    @Transactional
//    public ExpenseCategory updateCategory(Long id, ExpenseCategory updates) {
//        ExpenseCategory existing = getCategoryById(id);
//
//        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
//            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
//                throw new IllegalArgumentException("Category name already exists");
//            }
//            existing.setName(updates.getName());
//        }
//
//        if (updates.getDescription() != null) {
//            existing.setDescription(updates.getDescription());
//        }
//
//        if (updates.getIsActive() != null) {
//            existing.setIsActive(updates.getIsActive());
//        }
//
//        return categoryRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteCategory(Long id) {
//        ExpenseCategory category = getCategoryById(id);
//        categoryRepository.delete(category);
//    }
//}


//
//// ============================================================
//// FILE 1: ExpenseService.java (Updated with Enhanced Features)
//// ============================================================
//
//package com.example.demo.service;
//
//import com.example.demo.entity.Expense;
//import com.example.demo.entity.ExpenseCategory;
//import com.example.demo.repositories.ExpenseCategoryRepository;
//import com.example.demo.repositories.ExpenseRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ExpenseService {
//    private final ExpenseRepository expenseRepository;
//    private final ExpenseCategoryRepository categoryRepository;
//
//    @Transactional
//    public Expense createExpense(Expense expense) {
//        if (expense.getCategory() == null || expense.getCategory().trim().isEmpty()) {
//            throw new IllegalArgumentException("Category is required");
//        }
//        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
//            throw new IllegalArgumentException("Amount must be greater than 0");
//        }
//        return expenseRepository.save(expense);
//    }
//
//    /**
//     * ✅ AUTO-CREATE EXPENSE FROM INVENTORY PURCHASE
//     * Called automatically when inventory is added or created
//     *
//     * @param itemName Name of the inventory item
//     * @param sku SKU of the item
//     * @param quantity Quantity purchased
//     * @param unitPrice Purchase price per unit
//     * @param reason Reason for purchase (e.g., "Initial stock", "Stock addition")
//     * @return Created expense or null if no purchase price
//     */
//    @Transactional
//    public Expense createExpenseFromInventory(String itemName, String sku, Integer quantity,
//                                              Double unitPrice, String reason) {
//        try {
//            // Skip if no valid purchase price
//            if (unitPrice == null || unitPrice <= 0) {
//                System.out.println("⚠️ Cannot create expense - no purchase price for item: " + itemName);
//                return null;
//            }
//
//            Double totalAmount = unitPrice * quantity;
//
//            Expense expense = new Expense();
//            expense.setCategory("Inventory Purchase");
//
//            // Create detailed description with all relevant info
//            expense.setDescription(
//                    String.format("Item: %s (SKU: %s) | Qty: %d | Unit Price: Rs.%.2f | Reason: %s",
//                            itemName, sku, quantity, unitPrice, reason)
//            );
//
//            expense.setAmount(BigDecimal.valueOf(totalAmount));
//
//            // Save the expense
//            Expense saved = expenseRepository.save(expense);
//
//            // Log success
//            System.out.println(String.format(
//                    "✅ Expense auto-created: #%d | Amount: Rs.%.2f | Item: %s | Qty: %d",
//                    saved.getId(), totalAmount, itemName, quantity
//            ));
//
//            return saved;
//
//        } catch (Exception e) {
//            // Don't throw exception - just log and return null
//            // This prevents inventory operations from failing if expense creation fails
//            System.err.println("❌ Failed to auto-create expense: " + e.getMessage());
//            e.printStackTrace();
//            return null;
//        }
//    }
//
//    /**
//     * Get all expenses (ordered by creation date descending)
//     */
//    public List<Expense> getAllExpenses() {
//        return expenseRepository.findAll();
//    }
//
//    /**
//     * Get expense by ID
//     */
//    public Expense getExpenseById(Long id) {
//        return expenseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
//    }
//
//    /**
//     * Get expenses by date range (date only, ignoring time)
//     * @param startDate start date
//     * @param endDate end date
//     * @return list of expenses within the date range
//     */
//    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
//        // Convert LocalDate to LocalDateTime for the entire day
//        LocalDateTime startDateTime = startDate.atStartOfDay(); // 00:00:00
//        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX); // 23:59:59
//
//        return expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
//    }
//
//    /**
//     * Get expenses by category
//     */
//    public List<Expense> getExpensesByCategory(String category) {
//        return expenseRepository.findByCategory(category);
//    }
//
//    /**
//     * Get total expenses for a date range
//     */
//    public Double getTotalExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
//        LocalDateTime startDateTime = startDate.atStartOfDay();
//        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
//
//        Double total = expenseRepository.getTotalExpenses(startDateTime, endDateTime);
//        return total != null ? total : 0.0;
//    }
//
//    /**
//     * Update existing expense
//     */
//    @Transactional
//    public Expense updateExpense(Long id, Expense updates) {
//        Expense existing = getExpenseById(id);
//
//        if (updates.getCategory() != null && !updates.getCategory().trim().isEmpty()) {
//            existing.setCategory(updates.getCategory());
//        }
//        if (updates.getDescription() != null) {
//            existing.setDescription(updates.getDescription());
//        }
//        if (updates.getAmount() != null && updates.getAmount().signum() > 0) {
//            existing.setAmount(updates.getAmount());
//        }
//
//        return expenseRepository.save(existing);
//    }
//
//    /**
//     * Delete expense
//     */
//    @Transactional
//    public void deleteExpense(Long id) {
//        Expense expense = getExpenseById(id);
//        expenseRepository.delete(expense);
//    }
//
//    // ========== CATEGORY MANAGEMENT ==========
//
//    @Transactional
//    public ExpenseCategory createCategory(ExpenseCategory category) {
//        if (category.getName() == null || category.getName().trim().isEmpty()) {
//            throw new IllegalArgumentException("Category name is required");
//        }
//
//        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
//            throw new IllegalArgumentException("Category already exists: " + category.getName());
//        }
//
//        return categoryRepository.save(category);
//    }
//
//    public List<ExpenseCategory> getAllCategories() {
//        return categoryRepository.findAll();
//    }
//
//    public ExpenseCategory getCategoryById(Long id) {
//        return categoryRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
//    }
//
//    @Transactional
//    public ExpenseCategory updateCategory(Long id, ExpenseCategory updates) {
//        ExpenseCategory existing = getCategoryById(id);
//
//        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
//            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
//                throw new IllegalArgumentException("Category name already exists: " + updates.getName());
//            }
//            existing.setName(updates.getName());
//        }
//
//        if (updates.getDescription() != null) {
//            existing.setDescription(updates.getDescription());
//        }
//
//        if (updates.getIsActive() != null) {
//            existing.setIsActive(updates.getIsActive());
//        }
//
//        return categoryRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteCategory(Long id) {
//        ExpenseCategory category = getCategoryById(id);
//        categoryRepository.delete(category);
//    }
//}
//

package com.example.demo.service;

import com.example.demo.entity.Expense;
import com.example.demo.entity.ExpenseCategory;
import com.example.demo.repositories.ExpenseCategoryRepository;
import com.example.demo.repositories.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    /**
     * ✅ AUTO-CREATE EXPENSE FROM INVENTORY PURCHASE
     * Called automatically when inventory is added or stock is increased
     *
     * @param itemName Name of the inventory item
     * @param sku SKU of the item
     * @param quantity Quantity purchased
     * @param unitPrice Purchase price per unit
     * @param reason Reason for purchase (e.g., "Initial stock", "Stock addition")
     * @return Created expense or null if no purchase price
     */
    @Transactional
    public Expense createExpenseFromInventory(String itemName, String sku, Integer quantity,
                                              Double unitPrice, String reason) {
        try {
            // Skip if no valid purchase price
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

            // Create detailed description
            String description = String.format(
                    "Item: %s (SKU: %s) | Qty: %d | Unit Price: Rs.%.2f | Reason: %s",
                    itemName, sku, quantity, unitPrice, reason
            );
            expense.setDescription(description);
            expense.setAmount(BigDecimal.valueOf(totalAmount));
            expense.setAutoCreated(true);
            expense.setSourceType("INVENTORY_PURCHASE");

            // Save to database
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

    /**
     * Get all expenses (ordered by creation date descending)
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAllOrderByCreatedAtDesc();
    }

    /**
     * Get expense by ID
     */
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
    }

    /**
     * Get expenses by date range (date only, ignoring time)
     * @param startDate start date
     * @param endDate end date
     * @return list of expenses within the date range
     */
    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();           // 00:00:00
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);           // 23:59:59

        System.out.println("🔍 Fetching expenses from " + startDateTime + " to " + endDateTime);
        List<Expense> expenses = expenseRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        System.out.println("📊 Found " + expenses.size() + " expenses in date range");

        return expenses;
    }

    /**
     * Get expenses by category
     */
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }

    /**
     * Get total expenses for a date range
     */
    public Double getTotalExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Double total = expenseRepository.getTotalExpenses(startDateTime, endDateTime);
        return total != null ? total : 0.0;
    }

    /**
     * Update existing expense
     */
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

    /**
     * Delete expense
     */
    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = getExpenseById(id);
        expenseRepository.delete(expense);
    }

    // ========== CATEGORY MANAGEMENT ==========

    @Transactional
    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category already exists: " + category.getName());
        }

        return categoryRepository.save(category);
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

        return categoryRepository.save(existing);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ExpenseCategory category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}