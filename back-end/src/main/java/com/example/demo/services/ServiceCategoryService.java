package com.example.demo.services;

import com.example.demo.entity.ServiceCategory;
import com.example.demo.repositories.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCategoryService {
    private final ServiceCategoryRepository serviceCategoryRepository;

    @Transactional
    public ServiceCategory createServiceCategory(ServiceCategory serviceCategory) {
        if (serviceCategory.getName() == null || serviceCategory.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Service category name is required");
        }

        if (serviceCategoryRepository.existsByNameIgnoreCase(serviceCategory.getName())) {
            throw new IllegalArgumentException("Service category already exists with this name");
        }

        return serviceCategoryRepository.save(serviceCategory);
    }

    public List<ServiceCategory> getAllServiceCategories() {
        return serviceCategoryRepository.findAll();
    }

    public List<ServiceCategory> getActiveServiceCategories() {
        return serviceCategoryRepository.findByIsActiveTrue();
    }

    public ServiceCategory getServiceCategoryById(Long id) {
        return serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service category not found with ID: " + id));
    }

    @Transactional
    public ServiceCategory updateServiceCategory(Long id, ServiceCategory updates) {
        ServiceCategory existing = getServiceCategoryById(id);

        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
            if (serviceCategoryRepository.existsByNameIgnoreCaseAndIdNot(updates.getName(), id)) {
                throw new IllegalArgumentException("Service category name already exists");
            }
            existing.setName(updates.getName());
        }

        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }

        if (updates.getIsActive() != null) {
            existing.setIsActive(updates.getIsActive());
        }

        return serviceCategoryRepository.save(existing);
    }

    @Transactional
    public void deleteServiceCategory(Long id) {
        ServiceCategory serviceCategory = getServiceCategoryById(id);
        serviceCategoryRepository.delete(serviceCategory);
    }

    @Transactional
    public ServiceCategory toggleServiceCategory(Long id) {
        ServiceCategory serviceCategory = getServiceCategoryById(id);
        serviceCategory.setIsActive(!serviceCategory.getIsActive());
        return serviceCategoryRepository.save(serviceCategory);
    }
}