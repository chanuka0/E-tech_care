//
//package com.example.demo.service;
//
//import com.example.demo.entity.Model;
//import com.example.demo.entity.Brand;
//import com.example.demo.repositories.ModelRepository;
//import com.example.demo.repositories.BrandRepository;
//import com.example.demo.repositories.ModelNumberRepository;
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
//    private final ModelNumberRepository modelNumberRepository;
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
//                model.getModelName().trim()
//        );
//
//        if (existingModel != null) {
//            throw new RuntimeException("A model with the name '" + model.getModelName() +
//                    "' already exists for brand '" + brand.getBrandName() + "'. " +
//                    "The same model name cannot be added to the same brand twice.");
//        }
//
//        model.setIsActive(true);
//        model.setBrand(brand);
//        model.setModelName(model.getModelName().trim());
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
//        // Trim the model name
//        String newModelName = updates.getModelName().trim();
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
//                    newModelName
//            );
//
//            if (existingModelInNewBrand != null && !existingModelInNewBrand.getId().equals(id)) {
//                throw new RuntimeException("A model with the name '" + newModelName +
//                        "' already exists for brand '" + brand.getBrandName() + "'. " +
//                        "The same model name cannot be added to the same brand twice.");
//            }
//
//            existing.setBrand(brand);
//        } else {
//            // Brand is NOT being changed, just check if model name is being changed
//            if (!newModelName.equals(existing.getModelName())) {
//                Model existingModelWithSameName = modelRepository.findByBrandIdAndModelName(
//                        existing.getBrand().getId(),
//                        newModelName
//                );
//
//                if (existingModelWithSameName != null && !existingModelWithSameName.getId().equals(id)) {
//                    throw new RuntimeException("A model with the name '" + newModelName +
//                            "' already exists for brand '" + existing.getBrand().getBrandName() + "'. " +
//                            "The same model name cannot be added to the same brand twice.");
//                }
//            }
//        }
//
//        existing.setModelName(newModelName);
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//
//        return modelRepository.save(existing);
//    }
//
//    /**
//     * Check if a model is linked to any model numbers
//     */
//    public boolean isModelLinkedToModelNumbers(Long modelId) {
//        long count = modelNumberRepository.countByModelId(modelId);
//        return count > 0;
//    }
//
//    /**
//     * Delete a model - only allows permanent deletion if not linked to any model numbers
//     * Throws an error if the model is linked to prevent deletion
//     */
//    @Transactional
//    public void deleteModel(Long id) {
//        Model model = getModelById(id);
//
//        // Check if model is linked to any model numbers
//        if (isModelLinkedToModelNumbers(id)) {
//            // Model is linked - throw error to prevent deletion
//            throw new RuntimeException("Cannot delete model '" + model.getModelName() +
//                    "' because it is linked to model numbers. Please delete all associated model numbers first.");
//        }
//
//        // Model is not linked - perform hard delete from database
//        modelRepository.deleteById(id);
//    }
//
//    /**
//     * Check if a model can be permanently deleted
//     */
//    public boolean canPermanentlyDelete(Long modelId) {
//        return !isModelLinkedToModelNumbers(modelId);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.Model;
import com.example.demo.entity.Brand;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
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
    private final NotificationService notificationService;

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
                model.getModelName().trim()
        );

        if (existingModel != null) {
            throw new RuntimeException("A model with the name '" + model.getModelName() +
                    "' already exists for brand '" + brand.getBrandName() + "'. " +
                    "The same model name cannot be added to the same brand twice.");
        }

        model.setIsActive(true);
        model.setBrand(brand);
        model.setModelName(model.getModelName().trim());
        Model saved = modelRepository.save(model);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Model created: " + model.getModelName() + " for brand " + model.getBrand().getBrandName(),
                saved,
                NotificationSeverity.SUCCESS
        );

        return saved;
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

        // Trim the model name
        String newModelName = updates.getModelName().trim();

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
                    newModelName
            );

            if (existingModelInNewBrand != null && !existingModelInNewBrand.getId().equals(id)) {
                throw new RuntimeException("A model with the name '" + newModelName +
                        "' already exists for brand '" + brand.getBrandName() + "'. " +
                        "The same model name cannot be added to the same brand twice.");
            }

            existing.setBrand(brand);
        } else {
            // Brand is NOT being changed, just check if model name is being changed
            if (!newModelName.equals(existing.getModelName())) {
                Model existingModelWithSameName = modelRepository.findByBrandIdAndModelName(
                        existing.getBrand().getId(),
                        newModelName
                );

                if (existingModelWithSameName != null && !existingModelWithSameName.getId().equals(id)) {
                    throw new RuntimeException("A model with the name '" + newModelName +
                            "' already exists for brand '" + existing.getBrand().getBrandName() + "'. " +
                            "The same model name cannot be added to the same brand twice.");
                }
            }
        }

        existing.setModelName(newModelName);
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        Model saved = modelRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Model updated: " + existing.getModelName(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    /**
     * Check if a model is linked to any model numbers
     */
    public boolean isModelLinkedToModelNumbers(Long modelId) {
        long count = modelNumberRepository.countByModelId(modelId);
        return count > 0;
    }

    /**
     * Delete a model - only allows permanent deletion if not linked to any model numbers
     * Throws an error if the model is linked to prevent deletion
     */
    @Transactional
    public void deleteModel(Long id) {
        Model model = getModelById(id);

        // Check if model is linked to any model numbers
        if (isModelLinkedToModelNumbers(id)) {
            // Model is linked - throw error to prevent deletion
            throw new RuntimeException("Cannot delete model '" + model.getModelName() +
                    "' because it is linked to model numbers. Please delete all associated model numbers first.");
        }

        // Model is not linked - perform hard delete from database
        modelRepository.deleteById(id);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Model deleted: " + model.getModelName(),
                model,
                NotificationSeverity.WARNING
        );
    }

    /**
     * Check if a model can be permanently deleted
     */
    public boolean canPermanentlyDelete(Long modelId) {
        return !isModelLinkedToModelNumbers(modelId);
    }
}