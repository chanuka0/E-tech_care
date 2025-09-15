package com.example.demo.inventory;
//import com.example.demo.inventory.*;
//import com.example.demo.inventory.dto.*;
//import com.example.demo.inventory.repository.*;
import com.example.demo.inventory.dto.StockAlertResponse;
import com.example.demo.users.User;
import com.example.demo.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryItemRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockAlertRepository stockAlertRepository;
    private final UserRepository userRepository;

    public List<InventoryItemResponse> getAllActiveItems() {
        log.debug("Fetching all active inventory items");
        return inventoryRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryItemResponse> getItemsByCategory(ItemCategory category) {
        log.debug("Fetching items by category: {}", category);
        return inventoryRepository.findByCategoryAndIsActiveTrueOrderByNameAsc(category)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InventoryItemResponse getItemById(Long itemId) {
        log.debug("Fetching inventory item with id: {}", itemId);
        InventoryItem item = findInventoryItemById(itemId);
        return mapToResponse(item);
    }

    public List<InventoryItemResponse> searchItems(String searchTerm) {
        log.debug("Searching inventory items with term: {}", searchTerm);
        if (!StringUtils.hasText(searchTerm)) {
            return getAllActiveItems();
        }
        return inventoryRepository.searchItems(searchTerm)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryItemResponse createItem(InventoryItemCreateRequest request) {
        log.info("Creating new inventory item: {}", request.getName());

        validateCreateRequest(request);

        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPurchasePrice(request.getPurchasePrice());
        item.setSellingPrice(request.getSellingPrice());
        item.setStockQuantity(request.getStockQuantity());
        item.setThresholdLevel(request.getThresholdLevel());
        item.setCategory(request.getCategory());
        item.setSupplier(request.getSupplier());
        item.setSku(request.getSku());

        InventoryItem savedItem = inventoryRepository.save(item);

        // Create initial stock movement record
        createStockMovement(savedItem, StockMovement.MovementType.STOCK_IN,
                request.getStockQuantity(), 0, "Initial stock");

        log.info("Inventory item created successfully with id: {}", savedItem.getItemId());
        return mapToResponse(savedItem);
    }

    @Transactional
    public InventoryItemResponse updateItem(Long itemId, InventoryItemUpdateRequest request) {
        log.info("Updating inventory item with id: {}", itemId);

        InventoryItem item = findInventoryItemById(itemId);
        Integer previousStock = item.getStockQuantity();

        updateItemFields(item, request);
        InventoryItem savedItem = inventoryRepository.save(item);

        // Create stock movement if quantity changed
        if (request.getStockQuantity() != null && !request.getStockQuantity().equals(previousStock)) {
            createStockMovement(savedItem, StockMovement.MovementType.ADJUSTMENT,
                    Math.abs(savedItem.getStockQuantity() - previousStock),
                    previousStock, "Manual stock adjustment");
        }

        // Check and create stock alerts
        checkAndCreateStockAlert(savedItem);

        log.info("Inventory item updated successfully: {}", savedItem.getName());
        return mapToResponse(savedItem);
    }

    @Transactional
    public void updateStock(StockUpdateRequest request) {
        log.info("Updating stock for item id: {} with quantity: {}",
                request.getItemId(), request.getQuantity());

        InventoryItem item = findInventoryItemById(request.getItemId());
        Integer previousStock = item.getStockQuantity();
        Integer newStock;

        switch (request.getUpdateType()) {
            case ADD -> newStock = previousStock + request.getQuantity();
            case SUBTRACT -> newStock = Math.max(0, previousStock - request.getQuantity());
            case SET -> newStock = request.getQuantity();
            default -> throw new IllegalArgumentException("Invalid stock update type");
        }

        item.setStockQuantity(newStock);
        inventoryRepository.save(item);

        // Create stock movement record
        StockMovement.MovementType movementType = request.getUpdateType() == StockUpdateRequest.StockUpdateType.ADD
                ? StockMovement.MovementType.STOCK_IN : StockMovement.MovementType.STOCK_OUT;

        createStockMovement(item, movementType, request.getQuantity(),
                previousStock, request.getReason());

        // Check and create stock alerts
        checkAndCreateStockAlert(item);

        log.info("Stock updated for item: {} from {} to {}", item.getName(), previousStock, newStock);
    }

    @Transactional
    public void reduceStock(Long itemId, Integer quantity, String reason, String referenceNumber) {
        log.debug("Reducing stock for item id: {} by quantity: {}", itemId, quantity);

        InventoryItem item = findInventoryItemById(itemId);

        if (item.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for item: " + item.getName() +
                    ". Available: " + item.getStockQuantity() + ", Required: " + quantity);
        }

        Integer previousStock = item.getStockQuantity();
        item.setStockQuantity(previousStock - quantity);
        inventoryRepository.save(item);

        // Create stock movement record
        createStockMovement(item, StockMovement.MovementType.STOCK_OUT, quantity,
                previousStock, reason, referenceNumber);

        // Check and create stock alerts
        checkAndCreateStockAlert(item);

        log.info("Stock reduced for item: {} from {} to {}", item.getName(), previousStock, item.getStockQuantity());
    }

    public List<InventoryItemResponse> getLowStockItems() {
        log.debug("Fetching low stock items");
        return inventoryRepository.findLowStockItems()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryItemResponse> getOutOfStockItems() {
        log.debug("Fetching out of stock items");
        return inventoryRepository.findOutOfStockItems()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StockAlertResponse> getActiveAlerts() {
        log.debug("Fetching active stock alerts");
        return stockAlertRepository.findByIsResolvedFalseOrderByCreatedDateDesc()
                .stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveAlert(Long alertId) {
        log.info("Resolving stock alert with id: {}", alertId);

        StockAlert alert = stockAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Stock alert not found"));

        alert.setIsResolved(true);
        alert.setResolvedDate(LocalDateTime.now());
        stockAlertRepository.save(alert);

        log.info("Stock alert resolved successfully: {}", alertId);
    }

    // Private helper methods
    private void validateCreateRequest(InventoryItemCreateRequest request) {
        if (StringUtils.hasText(request.getSku()) &&
                inventoryRepository.findBySkuIgnoreCaseAndIsActiveTrue(request.getSku()).isPresent()) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }
    }

    private InventoryItem findInventoryItemById(Long itemId) {
        return inventoryRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + itemId));
    }

    private void updateItemFields(InventoryItem item, InventoryItemUpdateRequest request) {
        if (StringUtils.hasText(request.getName())) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getPurchasePrice() != null) {
            item.setPurchasePrice(request.getPurchasePrice());
        }
        if (request.getSellingPrice() != null) {
            item.setSellingPrice(request.getSellingPrice());
        }
        if (request.getStockQuantity() != null) {
            item.setStockQuantity(request.getStockQuantity());
        }
        if (request.getThresholdLevel() != null) {
            item.setThresholdLevel(request.getThresholdLevel());
        }
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }
        if (request.getSupplier() != null) {
            item.setSupplier(request.getSupplier());
        }
        if (request.getSku() != null) {
            item.setSku(request.getSku());
        }
        if (request.getIsActive() != null) {
            item.setIsActive(request.getIsActive());
        }
    }

    private void createStockMovement(InventoryItem item, StockMovement.MovementType movementType,
                                     Integer quantity, Integer previousStock, String reason) {
        createStockMovement(item, movementType, quantity, previousStock, reason, null);
    }

    private void createStockMovement(InventoryItem item, StockMovement.MovementType movementType,
                                     Integer quantity, Integer previousStock, String reason, String referenceNumber) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(currentUsername).orElse(null);

            StockMovement movement = new StockMovement();
            movement.setInventoryItem(item);
            movement.setMovementType(movementType);
            movement.setQuantity(quantity);
            movement.setPreviousStock(previousStock);
            movement.setNewStock(item.getStockQuantity());
            movement.setReason(reason);
            movement.setReferenceNumber(referenceNumber);
            movement.setCreatedBy(user);

            stockMovementRepository.save(movement);
        } catch (Exception e) {
            log.warn("Could not create stock movement record: {}", e.getMessage());
        }
    }

    private void checkAndCreateStockAlert(InventoryItem item) {
        // Check if there's already an unresolved alert for this item
        List<StockAlert> existingAlerts = stockAlertRepository.findByInventoryItem_ItemIdAndIsResolvedFalse(item.getItemId());

        if (item.isOutOfStock()) {
            if (existingAlerts.stream().noneMatch(alert -> alert.getAlertLevel() == StockAlert.AlertLevel.OUT_OF_STOCK)) {
                createStockAlert(item, StockAlert.AlertLevel.OUT_OF_STOCK);
            }
        } else if (item.isLowStock()) {
            if (existingAlerts.stream().noneMatch(alert -> alert.getAlertLevel() == StockAlert.AlertLevel.LOW_STOCK)) {
                createStockAlert(item, StockAlert.AlertLevel.LOW_STOCK);
            }
        } else {
            // Resolve existing alerts if stock is now above threshold
            existingAlerts.forEach(alert -> {
                alert.setIsResolved(true);
                alert.setResolvedDate(LocalDateTime.now());
                stockAlertRepository.save(alert);
            });
        }
    }

    private void createStockAlert(InventoryItem item, StockAlert.AlertLevel alertLevel) {
        StockAlert alert = new StockAlert();
        alert.setInventoryItem(item);
        alert.setCurrentStock(item.getStockQuantity());
        alert.setThresholdLevel(item.getThresholdLevel());
        alert.setAlertLevel(alertLevel);
        stockAlertRepository.save(alert);

        log.info("Created {} alert for item: {}", alertLevel, item.getName());
    }

    private InventoryItemResponse mapToResponse(InventoryItem item) {
        InventoryItemResponse response = new InventoryItemResponse();
        response.setItemId(item.getItemId());
        response.setName(item.getName());
        response.setDescription(item.getDescription());
        response.setPurchasePrice(item.getPurchasePrice());
        response.setSellingPrice(item.getSellingPrice());
        response.setStockQuantity(item.getStockQuantity());
        response.setThresholdLevel(item.getThresholdLevel());
        response.setCategory(item.getCategory());
        response.setCategoryDisplayName(item.getCategory().getDisplayName());
        response.setSupplier(item.getSupplier());
        response.setSku(item.getSku());
        response.setIsActive(item.getIsActive());
        response.setIsLowStock(item.isLowStock());
        response.setIsOutOfStock(item.isOutOfStock());
        response.setCreatedDate(item.getCreatedDate());
        response.setUpdatedDate(item.getUpdatedDate());
        return response;
    }

    private StockAlertResponse mapToAlertResponse(StockAlert alert) {
        StockAlertResponse response = new StockAlertResponse();
        response.setId(alert.getId());
        response.setInventoryItemId(alert.getInventoryItem().getItemId());
        response.setInventoryItemName(alert.getInventoryItem().getName());
        response.setCurrentStock(alert.getCurrentStock());
        response.setThresholdLevel(alert.getThresholdLevel());
        response.setAlertLevel(alert.getAlertLevel());
        response.setAlertLevelDisplayName(alert.getAlertLevel().getDisplayName());
        response.setIsResolved(alert.getIsResolved());
        response.setCreatedDate(alert.getCreatedDate());
        response.setResolvedDate(alert.getResolvedDate());
        return response;
    }
}