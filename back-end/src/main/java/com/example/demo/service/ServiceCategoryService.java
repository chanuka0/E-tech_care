//
//
//package com.example.demo.service;
//
//import com.example.demo.entity.ServiceCategory;
//import com.example.demo.repositories.ServiceCategoryRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import com.example.demo.service.NotificationService;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.entity.NotificationSeverity;
//
//@Service
//@RequiredArgsConstructor
//@Transactional
//public class ServiceCategoryService {
//    private final ServiceCategoryRepository serviceCategoryRepository;
//    private final NotificationService notificationService;
//
//    /**
//     * Generate code from service category name
//     * Example: "Screen Replacement" -> "SCREEN_REPLACEMENT"
//     */
//    private String generateCodeFromName(String name) {
//        return name
//                .toUpperCase()
//                .replaceAll(" ", "_")
//                .replaceAll("[^A-Z0-9_]", "");
//    }
//
//    /**
//     * Get all service categories
//     */
//    public List<ServiceCategory> getAllServiceCategories() {
//        return serviceCategoryRepository.findAll();
//    }
//
//    /**
//     * Get service categories by status
//     */
//    public List<ServiceCategory> getServiceCategoriesByStatus(Boolean status) {
//        if (status == null) {
//            throw new IllegalArgumentException("Status cannot be null");
//        }
//        return serviceCategoryRepository.findByIsActive(status);
//    }
//
//    /**
//     * Get only active service categories
//     */
//    public List<ServiceCategory> getActiveServiceCategories() {
//        return serviceCategoryRepository.findByIsActiveTrue();
//    }
//
//    /**
//     * Get only inactive service categories
//     */
//    public List<ServiceCategory> getInactiveServiceCategories() {
//        return serviceCategoryRepository.findByIsActiveFalse();
//    }
//
//    /**
//     * Get service category by ID
//     */
//    public ServiceCategory getServiceCategoryById(Long id) {
//        return serviceCategoryRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Service category not found with ID: " + id));
//    }
//
//    /**
//     * Create new service category
//     */
//    public ServiceCategory createServiceCategory(ServiceCategory serviceCategory) {
//        // Validate name is not blank
//        if (serviceCategory.getName() == null || serviceCategory.getName().isBlank()) {
//            throw new IllegalArgumentException("Service category name cannot be blank");
//        }
//
//        // Check for duplicate name
//        if (serviceCategoryRepository.existsByNameIgnoreCase(serviceCategory.getName())) {
//            throw new IllegalArgumentException("Service category with name '" + serviceCategory.getName() + "' already exists");
//        }
//
//        // Validate service price
//        if (serviceCategory.getServicePrice() == null || serviceCategory.getServicePrice() <= 0) {
//            throw new IllegalArgumentException("Service price must be greater than 0");
//        }
//
//        // AUTO-GENERATE CODE from name if not provided
//        if (serviceCategory.getCode() == null || serviceCategory.getCode().isBlank()) {
//            String generatedCode = generateCodeFromName(serviceCategory.getName());
//            serviceCategory.setCode(generatedCode);
//        }
//
//        // Check for duplicate code
//        if (serviceCategoryRepository.existsByCodeIgnoreCase(serviceCategory.getCode())) {
//            throw new IllegalArgumentException("Service category with code '" + serviceCategory.getCode() + "' already exists");
//        }
//
//        // Set default values
//        if (serviceCategory.getIsActive() == null) {
//            serviceCategory.setIsActive(true);
//        }
//
//        return serviceCategoryRepository.save(serviceCategory);
//    }
//
//    /**
//     * Update service category
//     */
//    public ServiceCategory updateServiceCategory(Long id, ServiceCategory updates) {
//        ServiceCategory existing = getServiceCategoryById(id);
//
//        // Update name if provided and valid
//        if (updates.getName() != null && !updates.getName().isBlank()) {
//            // Check for duplicate name (excluding current ID)
//            if (!existing.getName().equalsIgnoreCase(updates.getName()) &&
//                    serviceCategoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
//                throw new IllegalArgumentException("Service category with name '" + updates.getName() + "' already exists");
//            }
//            existing.setName(updates.getName());
//
//            // Re-generate code based on new name if code wasn't explicitly updated
//            if (updates.getCode() == null || updates.getCode().isBlank()) {
//                String generatedCode = generateCodeFromName(updates.getName());
//                existing.setCode(generatedCode);
//            }
//        }
//
//        // Update code if provided
//        if (updates.getCode() != null && !updates.getCode().isBlank()) {
//            if (!existing.getCode().equalsIgnoreCase(updates.getCode()) &&
//                    serviceCategoryRepository.existsByCodeIgnoreCaseAndIdNot(updates.getCode(), id)) {
//                throw new IllegalArgumentException("Service category with code '" + updates.getCode() + "' already exists");
//            }
//            existing.setCode(updates.getCode());
//        }
//
//        // Update description if provided
//        if (updates.getDescription() != null) {
//            existing.setDescription(updates.getDescription());
//        }
//
//        // Update service price if provided and valid
//        if (updates.getServicePrice() != null) {
//            if (updates.getServicePrice() <= 0) {
//                throw new IllegalArgumentException("Service price must be greater than 0");
//            }
//            existing.setServicePrice(updates.getServicePrice());
//        }
//
//        // Update active status if provided
//        if (updates.getIsActive() != null) {
//            existing.setIsActive(updates.getIsActive());
//        }
//
//        return serviceCategoryRepository.save(existing);
//    }
//
//    /**
//     * Toggle service category active status
//     */
//    public ServiceCategory toggleServiceCategory(Long id) {
//        ServiceCategory existing = getServiceCategoryById(id);
//        existing.setIsActive(!existing.getIsActive());
//        return serviceCategoryRepository.save(existing);
//    }
//
//    /**
//     * Delete service category
//     */
//    public void deleteServiceCategory(Long id) {
//        if (!serviceCategoryRepository.existsById(id)) {
//            throw new RuntimeException("Service category not found with ID: " + id);
//        }
//        serviceCategoryRepository.deleteById(id);
//    }
//
//    /**
//     * Get count of service categories by status
//     */
//    public Long getServiceCategoryCountByStatus(Boolean status) {
//        return serviceCategoryRepository.countByIsActive(status);
//    }
//}
package com.example.demo.service;

import com.example.demo.entity.ServiceCategory;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceCategoryService {
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final NotificationService notificationService;

    /**
     * Generate code from service category name
     * Example: "Screen Replacement" -> "SCREEN_REPLACEMENT"
     */
    private String generateCodeFromName(String name) {
        return name
                .toUpperCase()
                .replaceAll(" ", "_")
                .replaceAll("[^A-Z0-9_]", "");
    }

    /**
     * Get all service categories
     */
    public List<ServiceCategory> getAllServiceCategories() {
        return serviceCategoryRepository.findAll();
    }

    /**
     * Get service categories by status
     */
    public List<ServiceCategory> getServiceCategoriesByStatus(Boolean status) {
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        return serviceCategoryRepository.findByIsActive(status);
    }

    /**
     * Get only active service categories
     */
    public List<ServiceCategory> getActiveServiceCategories() {
        return serviceCategoryRepository.findByIsActiveTrue();
    }

    /**
     * Get only inactive service categories
     */
    public List<ServiceCategory> getInactiveServiceCategories() {
        return serviceCategoryRepository.findByIsActiveFalse();
    }

    /**
     * Get service category by ID
     */
    public ServiceCategory getServiceCategoryById(Long id) {
        return serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service category not found with ID: " + id));
    }

    /**
     * Create new service category
     */
    public ServiceCategory createServiceCategory(ServiceCategory serviceCategory) {
        // Validate name is not blank
        if (serviceCategory.getName() == null || serviceCategory.getName().isBlank()) {
            throw new IllegalArgumentException("Service category name cannot be blank");
        }

        // Check for duplicate name
        if (serviceCategoryRepository.existsByNameIgnoreCase(serviceCategory.getName())) {
            throw new IllegalArgumentException("Service category with name '" + serviceCategory.getName() + "' already exists");
        }

        // Validate service price
        if (serviceCategory.getServicePrice() == null || serviceCategory.getServicePrice() <= 0) {
            throw new IllegalArgumentException("Service price must be greater than 0");
        }

        // AUTO-GENERATE CODE from name if not provided
        if (serviceCategory.getCode() == null || serviceCategory.getCode().isBlank()) {
            String generatedCode = generateCodeFromName(serviceCategory.getName());
            serviceCategory.setCode(generatedCode);
        }

        // Check for duplicate code
        if (serviceCategoryRepository.existsByCodeIgnoreCase(serviceCategory.getCode())) {
            throw new IllegalArgumentException("Service category with code '" + serviceCategory.getCode() + "' already exists");
        }

        // Set default values
        if (serviceCategory.getIsActive() == null) {
            serviceCategory.setIsActive(true);
        }

        ServiceCategory saved = serviceCategoryRepository.save(serviceCategory);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Service category created: " + serviceCategory.getName() + " (Rs." + serviceCategory.getServicePrice() + ")",
                saved,
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    /**
     * Update service category
     */
    public ServiceCategory updateServiceCategory(Long id, ServiceCategory updates) {
        ServiceCategory existing = getServiceCategoryById(id);

        // Update name if provided and valid
        if (updates.getName() != null && !updates.getName().isBlank()) {
            // Check for duplicate name (excluding current ID)
            if (!existing.getName().equalsIgnoreCase(updates.getName()) &&
                    serviceCategoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
                throw new IllegalArgumentException("Service category with name '" + updates.getName() + "' already exists");
            }
            existing.setName(updates.getName());

            // Re-generate code based on new name if code wasn't explicitly updated
            if (updates.getCode() == null || updates.getCode().isBlank()) {
                String generatedCode = generateCodeFromName(updates.getName());
                existing.setCode(generatedCode);
            }
        }

        // Update code if provided
        if (updates.getCode() != null && !updates.getCode().isBlank()) {
            if (!existing.getCode().equalsIgnoreCase(updates.getCode()) &&
                    serviceCategoryRepository.existsByCodeIgnoreCaseAndIdNot(updates.getCode(), id)) {
                throw new IllegalArgumentException("Service category with code '" + updates.getCode() + "' already exists");
            }
            existing.setCode(updates.getCode());
        }

        // Update description if provided
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }

        // Update service price if provided and valid
        if (updates.getServicePrice() != null) {
            if (updates.getServicePrice() <= 0) {
                throw new IllegalArgumentException("Service price must be greater than 0");
            }
            existing.setServicePrice(updates.getServicePrice());
        }

        // Update active status if provided
        if (updates.getIsActive() != null) {
            existing.setIsActive(updates.getIsActive());
        }

        ServiceCategory saved = serviceCategoryRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Service category updated: " + existing.getName(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    /**
     * Toggle service category active status
     */
    public ServiceCategory toggleServiceCategory(Long id) {
        ServiceCategory existing = getServiceCategoryById(id);
        existing.setIsActive(!existing.getIsActive());
        ServiceCategory saved = serviceCategoryRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Service category toggled: " + existing.getName() + " - Status: " + (existing.getIsActive() ? "ACTIVE" : "INACTIVE"),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    /**
     * Delete service category
     */
    public void deleteServiceCategory(Long id) {
        ServiceCategory category = getServiceCategoryById(id);

        if (!serviceCategoryRepository.existsById(id)) {
            throw new RuntimeException("Service category not found with ID: " + id);
        }

        serviceCategoryRepository.deleteById(id);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Service category deleted: " + category.getName(),
                category,
                NotificationSeverity.WARNING
        );
    }

    /**
     * Get count of service categories by status
     */
    public Long getServiceCategoryCountByStatus(Boolean status) {
        return serviceCategoryRepository.countByIsActive(status);
    }
}