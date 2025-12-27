//
//
//
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
//        // Check for duplicate brand name
//        Brand existingBrand = brandRepository.findByBrandName(brand.getBrandName());
//        if (existingBrand != null) {
//            throw new RuntimeException("Brand name already exists: '" + brand.getBrandName() + "'");
//        }
//
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
//                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
//    }
//
//    @Transactional
//    public Brand updateBrand(Long id, Brand updates) {
//        Brand existing = getBrandById(id);
//
//        // Check if brand name is being changed and if new name already exists
//        if (!existing.getBrandName().equals(updates.getBrandName())) {
//            Brand brandWithSameName = brandRepository.findByBrandName(updates.getBrandName());
//            if (brandWithSameName != null && !brandWithSameName.getId().equals(id)) {
//                throw new RuntimeException("Brand name already exists: '" + updates.getBrandName() + "'");
//            }
//        }
//
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
import com.example.demo.repositories.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;

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

    public List<Map<String, Object>> getAllBrandsWithModelCount() {
        List<Brand> brands = brandRepository.findAllActive();
        return brands.stream().map(brand -> {
            Map<String, Object> brandData = new HashMap<>();
            brandData.put("id", brand.getId());
            brandData.put("brandName", brand.getBrandName());
            brandData.put("description", brand.getDescription());
            brandData.put("isActive", brand.getIsActive());
            brandData.put("createdAt", brand.getCreatedAt());
            brandData.put("updatedAt", brand.getUpdatedAt());
            brandData.put("modelCount", modelRepository.countByBrandId(brand.getId()));
            return brandData;
        }).collect(java.util.stream.Collectors.toList());
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

        // Check if brand is linked to any models
        long modelCount = modelRepository.countByBrandId(id);

        if (modelCount > 0) {
            throw new RuntimeException("Cannot delete brand '" + brand.getBrandName() +
                    "'. It is linked to " + modelCount + " model(s). Please remove or reassign the models first.");
        }

        // If no models are linked, permanently delete the brand
        brandRepository.delete(brand);
    }
}