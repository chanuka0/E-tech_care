package com.example.demo.repositories;

import com.example.demo.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    // Find all active service categories
    List<ServiceCategory> findByIsActiveTrue();

    // Find all inactive service categories
    List<ServiceCategory> findByIsActiveFalse();

    // Find by status
    List<ServiceCategory> findByIsActive(Boolean isActive);

    // Find by name (case-insensitive)
    Optional<ServiceCategory> findByNameIgnoreCase(String name);

    // Check if service category exists by name
    boolean existsByNameIgnoreCase(String name);

    // Check if service category exists by name excluding current ID
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    // NEW: Find by code (case-insensitive)
    Optional<ServiceCategory> findByCodeIgnoreCase(String code);

    // NEW: Check if code exists
    boolean existsByCodeIgnoreCase(String code);

    // NEW: Check if code exists excluding current ID
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    // Count by status
    Long countByIsActive(Boolean isActive);
}