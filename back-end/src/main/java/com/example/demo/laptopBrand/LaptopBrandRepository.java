package com.example.demo.laptopBrand;

//import com.example.demo.entities.LaptopBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaptopBrandRepository extends JpaRepository<LaptopBrand, Long> {
    List<LaptopBrand> findByActiveTrue();
    Optional<LaptopBrand> findByBrandNameIgnoreCase(String brandName);
    boolean existsByBrandNameIgnoreCase(String brandName);
}