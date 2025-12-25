//package com.example.demo.service;
//
//import com.example.demo.entity.Brand;
//import com.example.demo.repositories.BrandRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class BrandService {
//    private final BrandRepository brandRepository;
//
//    @Transactional
//    public Brand createBrand(Brand brand) {
//        brand.setIsActive(true);
//        return brandRepository.save(brand);
//    }
//
//    public List<Brand> getAllActiveBrands() {
//        return brandRepository.findAllActive();
//    }
//
//    public Brand getBrandById(Long id) {
//        return brandRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Brand not found"));
//    }
//
//    @Transactional
//    public Brand updateBrand(Long id, Brand updates) {
//        Brand existing = getBrandById(id);
//        existing.setBrandName(updates.getBrandName());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//        return brandRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteBrand(Long id) {
//        Brand brand = getBrandById(id);
//        brand.setIsActive(false);
//        brandRepository.save(brand);
//    }
//}




package com.example.demo.service;

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
        // Check for duplicate brand name
        Brand existingBrand = brandRepository.findByBrandName(brand.getBrandName());
        if (existingBrand != null) {
            throw new RuntimeException("Brand name already exists: '" + brand.getBrandName() + "'");
        }

        brand.setIsActive(true);
        return brandRepository.save(brand);
    }

    public List<Brand> getAllActiveBrands() {
        return brandRepository.findAllActive();
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    @Transactional
    public Brand updateBrand(Long id, Brand updates) {
        Brand existing = getBrandById(id);

        // Check if brand name is being changed and if new name already exists
        if (!existing.getBrandName().equals(updates.getBrandName())) {
            Brand brandWithSameName = brandRepository.findByBrandName(updates.getBrandName());
            if (brandWithSameName != null && !brandWithSameName.getId().equals(id)) {
                throw new RuntimeException("Brand name already exists: '" + updates.getBrandName() + "'");
            }
        }

        existing.setBrandName(updates.getBrandName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        return brandRepository.save(existing);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);
        brand.setIsActive(false);
        brandRepository.save(brand);
    }
}