


package com.example.demo.repositories;

import com.example.demo.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    @Query("SELECT b FROM Brand b WHERE b.isActive = true ORDER BY b.brandName")
    List<Brand> findAllActive();

    @Query("SELECT b FROM Brand b WHERE LOWER(b.brandName) = LOWER(:brandName)")
    Brand findByBrandName(String brandName);

    Optional<Brand> findByIdAndIsActiveTrue(Long id);
}