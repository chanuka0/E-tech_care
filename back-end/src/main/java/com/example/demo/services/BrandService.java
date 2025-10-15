package com.example.demo.services;


import com.example.demo.entity.Brand;
import com.example.demo.repositories.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    @Transactional
    public Brand createBrand(Brand brand) {
        // Check if brand already exists
        if (brandRepository.existsByName(brand.getName())) {
            throw new RuntimeException("Brand with name '" + brand.getName() + "' already exists");
        }
        return brandRepository.save(brand);
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    @Transactional
    public Brand updateBrand(Long id, Brand brandDetails) {
        Brand brand = getBrandById(id);
        brand.setName(brandDetails.getName());
        return brandRepository.save(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);
        brandRepository.delete(brand);
    }
}