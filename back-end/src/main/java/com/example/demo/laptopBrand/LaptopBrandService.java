package com.example.demo.laptopBrand;

//import com.example.demo.dtos.LaptopBrandRequest;
//import com.example.demo.dtos.LaptopBrandResponse;
//import com.example.demo.entities.LaptopBrand;
//import com.example.demo.repositories.LaptopBrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaptopBrandService {

    private final LaptopBrandRepository laptopBrandRepository;

    public List<LaptopBrand.LaptopBrandResponse> getAllActiveBrands() {
        return laptopBrandRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LaptopBrand.LaptopBrandResponse> getAllBrands() {
        return laptopBrandRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LaptopBrand.LaptopBrandResponse createBrand(LaptopBrandRequest request) {
        if (laptopBrandRepository.existsByBrandNameIgnoreCase(request.getBrandName())) {
            throw new RuntimeException("Brand name already exists");
        }

        LaptopBrand brand = new LaptopBrand();
        brand.setBrandName(request.getBrandName());
        brand.setDescription(request.getDescription());

        LaptopBrand savedBrand = laptopBrandRepository.save(brand);
        return mapToResponse(savedBrand);
    }

    public LaptopBrand.LaptopBrandResponse updateBrand(Long id, LaptopBrandRequest request) {
        LaptopBrand brand = laptopBrandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        if (!brand.getBrandName().equalsIgnoreCase(request.getBrandName()) &&
                laptopBrandRepository.existsByBrandNameIgnoreCase(request.getBrandName())) {
            throw new RuntimeException("Brand name already exists");
        }

        brand.setBrandName(request.getBrandName());
        brand.setDescription(request.getDescription());
        brand.setUpdatedDate(LocalDateTime.now());

        LaptopBrand savedBrand = laptopBrandRepository.save(brand);
        return mapToResponse(savedBrand);
    }

    public void deleteBrand(Long id) {
        LaptopBrand brand = laptopBrandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        brand.setActive(false);
        brand.setUpdatedDate(LocalDateTime.now());
        laptopBrandRepository.save(brand);
    }

    private LaptopBrand.LaptopBrandResponse mapToResponse(LaptopBrand brand) {
        LaptopBrand.LaptopBrandResponse response = new LaptopBrand.LaptopBrandResponse();
        response.setId(brand.getId());
        response.setBrandName(brand.getBrandName());
        response.setDescription(brand.getDescription());
        response.setActive(brand.isActive());
        response.setCreatedDate(brand.getCreatedDate());
        return response;
    }
}