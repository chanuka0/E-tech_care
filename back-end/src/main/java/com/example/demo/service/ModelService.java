//
//
//package com.example.demo.service;
//
//import com.example.demo.entity.Model;
//import com.example.demo.entity.Brand;
//import com.example.demo.repositories.ModelRepository;
//import com.example.demo.repositories.BrandRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ModelService {
//    private final ModelRepository modelRepository;
//    private final BrandRepository brandRepository;
//
//    @Transactional
//    public Model createModel(Model model) {
//        // Validate that brand exists and is active
//        Brand brand = brandRepository.findById(model.getBrand().getId())
//                .orElseThrow(() -> new RuntimeException("Brand not found"));
//
//        if (!brand.getIsActive()) {
//            throw new RuntimeException("Cannot add model to inactive brand");
//        }
//
//        // Check if model with same name already exists for this brand
//        Model existingModel = modelRepository.findByBrandIdAndModelName(
//                brand.getId(),
//                model.getModelName()
//        );
//
//        if (existingModel != null) {
//            throw new RuntimeException("A model with the name '" + model.getModelName() +
//                    "' already exists for brand '" + brand.getBrandName() + "'");
//        }
//
//        model.setIsActive(true);
//        model.setBrand(brand);
//        return modelRepository.save(model);
//    }
//
//    public List<Model> getAllActiveModels() {
//        return modelRepository.findAllActive();
//    }
//
//    public List<Model> getModelsByBrandId(Long brandId) {
//        return modelRepository.findByBrandId(brandId);
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
//
//        // If brand is being changed, validate the new brand
//        if (updates.getBrand() != null && !updates.getBrand().getId().equals(existing.getBrand().getId())) {
//            Brand brand = brandRepository.findById(updates.getBrand().getId())
//                    .orElseThrow(() -> new RuntimeException("Brand not found"));
//
//            if (!brand.getIsActive()) {
//                throw new RuntimeException("Cannot assign model to inactive brand");
//            }
//
//            // Check if model name already exists for the NEW brand
//            Model existingModelInNewBrand = modelRepository.findByBrandIdAndModelName(
//                    brand.getId(),
//                    updates.getModelName()
//            );
//
//            if (existingModelInNewBrand != null && !existingModelInNewBrand.getId().equals(id)) {
//                throw new RuntimeException("A model with the name '" + updates.getModelName() +
//                        "' already exists for brand '" + brand.getBrandName() + "'");
//            }
//
//            existing.setBrand(brand);
//        } else {
//            // Brand is NOT being changed, just check if model name is being changed
//            if (!updates.getModelName().equals(existing.getModelName())) {
//                Model existingModelWithSameName = modelRepository.findByBrandIdAndModelName(
//                        existing.getBrand().getId(),
//                        updates.getModelName()
//                );
//
//                if (existingModelWithSameName != null && !existingModelWithSameName.getId().equals(id)) {
//                    throw new RuntimeException("A model with the name '" + updates.getModelName() +
//                            "' already exists for brand '" + existing.getBrand().getBrandName() + "'");
//                }
//            }
//        }
//
//        existing.setModelName(updates.getModelName());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//
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
import com.example.demo.repositories.ModelNumberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;
    private final BrandRepository brandRepository;
    private final ModelNumberRepository modelNumberRepository;

    @Transactional
    public Model createModel(Model model) {
        // Validate that brand exists and is active
        Brand brand = brandRepository.findById(model.getBrand().getId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        if (!brand.getIsActive()) {
            throw new RuntimeException("Cannot add model to inactive brand");
        }

        // Check if model with same name already exists for this brand
        Model existingModel = modelRepository.findByBrandIdAndModelName(
                brand.getId(),
                model.getModelName()
        );

        if (existingModel != null) {
            throw new RuntimeException("A model with the name '" + model.getModelName() +
                    "' already exists for brand '" + brand.getBrandName() + "'");
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

            // Check if model name already exists for the NEW brand
            Model existingModelInNewBrand = modelRepository.findByBrandIdAndModelName(
                    brand.getId(),
                    updates.getModelName()
            );

            if (existingModelInNewBrand != null && !existingModelInNewBrand.getId().equals(id)) {
                throw new RuntimeException("A model with the name '" + updates.getModelName() +
                        "' already exists for brand '" + brand.getBrandName() + "'");
            }

            existing.setBrand(brand);
        } else {
            // Brand is NOT being changed, just check if model name is being changed
            if (!updates.getModelName().equals(existing.getModelName())) {
                Model existingModelWithSameName = modelRepository.findByBrandIdAndModelName(
                        existing.getBrand().getId(),
                        updates.getModelName()
                );

                if (existingModelWithSameName != null && !existingModelWithSameName.getId().equals(id)) {
                    throw new RuntimeException("A model with the name '" + updates.getModelName() +
                            "' already exists for brand '" + existing.getBrand().getBrandName() + "'");
                }
            }
        }

        existing.setModelName(updates.getModelName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());

        return modelRepository.save(existing);
    }

    /**
     * Check if a model is linked to any model numbers
     */
    public boolean isModelLinkedToModelNumbers(Long modelId) {
        long count = modelNumberRepository.countByModelId(modelId);
        return count > 0;
    }

    /**
     * Delete a model - performs hard delete if not linked to any model numbers,
     * otherwise just marks as inactive
     */
    @Transactional
    public void deleteModel(Long id) {
        Model model = getModelById(id);

        // Check if model is linked to any model numbers
        if (isModelLinkedToModelNumbers(id)) {
            // Model is linked - only mark as inactive (soft delete)
            model.setIsActive(false);
            modelRepository.save(model);
        } else {
            // Model is not linked - perform hard delete from database
            modelRepository.deleteById(id);
        }
    }

    /**
     * Check if a model can be permanently deleted
     */
    public boolean canPermanentlyDelete(Long modelId) {
        return !isModelLinkedToModelNumbers(modelId);
    }
}