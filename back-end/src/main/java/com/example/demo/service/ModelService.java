//package com.example.demo.service;
//
//import com.example.demo.entity.Model;
//import com.example.demo.repositories.ModelRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ModelService {
//    private final ModelRepository modelRepository;
//
//    @Transactional
//    public Model createModel(Model model) {
//        model.setIsActive(true);
//        return modelRepository.save(model);
//    }
//
//    public List<Model> getAllActiveModels() {
//        return modelRepository.findAllActive();
//    }
//
//    public Model getModelById(Long id) {
//        return modelRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Model not found"));
//    }
//
//    @Transactional
//    public Model updateModel(Long id, Model updates) {
//        Model existing = getModelById(id);
//        existing.setModelName(updates.getModelName());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//        return modelRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteModel(Long id) {
//        Model model = getModelById(id);
//        model.setIsActive(false);
//        modelRepository.save(model);
//    }
//}




package com.example.demo.service;

import com.example.demo.entity.Model;
import com.example.demo.entity.Brand;
import com.example.demo.repositories.ModelRepository;
import com.example.demo.repositories.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;
    private final BrandRepository brandRepository;

    @Transactional
    public Model createModel(Model model) {
        // Validate that brand exists and is active
        Brand brand = brandRepository.findById(model.getBrand().getId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        if (!brand.getIsActive()) {
            throw new RuntimeException("Cannot add model to inactive brand");
        }

        model.setIsActive(true);
        model.setBrand(brand);
        return modelRepository.save(model);
    }

    public List<Model> getAllActiveModels() {
        return modelRepository.findAllActive();
    }

    public List<Model> getModelsByBrandId(Long brandId) {
        return modelRepository.findByBrandId(brandId);
    }

    public Model getModelById(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));
    }

    @Transactional
    public Model updateModel(Long id, Model updates) {
        Model existing = getModelById(id);

        // If brand is being changed, validate the new brand
        if (updates.getBrand() != null && !updates.getBrand().getId().equals(existing.getBrand().getId())) {
            Brand brand = brandRepository.findById(updates.getBrand().getId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));

            if (!brand.getIsActive()) {
                throw new RuntimeException("Cannot assign model to inactive brand");
            }
            existing.setBrand(brand);
        }

        existing.setModelName(updates.getModelName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());

        return modelRepository.save(existing);
    }

    @Transactional
    public void deleteModel(Long id) {
        Model model = getModelById(id);
        model.setIsActive(false);
        modelRepository.save(model);
    }
}