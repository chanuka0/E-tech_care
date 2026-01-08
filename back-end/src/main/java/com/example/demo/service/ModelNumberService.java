//package com.example.demo.service;
//
//import com.example.demo.entity.ModelNumber;
//import com.example.demo.entity.Model;
//import com.example.demo.repositories.ModelNumberRepository;
//import com.example.demo.repositories.ModelRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//public class ModelNumberService {
//    private final ModelNumberRepository modelNumberRepository;
//    private final ModelRepository modelRepository;
//
//    @Transactional
//    public ModelNumber createModelNumber(ModelNumber modelNumber) {
//        // Validate that model exists
//        Model model = modelRepository.findById(modelNumber.getModel().getId())
//                .orElseThrow(() -> new RuntimeException("Model not found"));
//
//        if (!model.getIsActive()) {
//            throw new RuntimeException("Cannot add model number to inactive model");
//        }
//
//        // Check if this model number already exists for this specific model
//        Optional<ModelNumber> existing = modelNumberRepository.findByModelNumberAndModelId(
//                modelNumber.getModelNumber().trim(),
//                model.getId()
//        );
//
//        if (existing.isPresent()) {
//            throw new RuntimeException("Model number '" + modelNumber.getModelNumber() +
//                    "' already exists for model '" + model.getModelName() + "'. " +
//                    "The same model number cannot be added to the same model twice.");
//        }
//
//        modelNumber.setIsActive(true);
//        modelNumber.setModel(model);
//        return modelNumberRepository.save(modelNumber);
//    }
//
//    public List<ModelNumber> getAllActiveModelNumbers() {
//        return modelNumberRepository.findAllActive();
//    }
//
//    public List<ModelNumber> getModelNumbersByModelId(Long modelId) {
//        return modelNumberRepository.findByModelId(modelId);
//    }
//
//    public ModelNumber getModelNumberById(Long id) {
//        return modelNumberRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Model number not found"));
//    }
//
//    @Transactional
//    public ModelNumber updateModelNumber(Long id, ModelNumber updates) {
//        ModelNumber existing = getModelNumberById(id);
//
//        // If model is being changed, validate the new model
//        if (updates.getModel() != null && !updates.getModel().getId().equals(existing.getModel().getId())) {
//            Model model = modelRepository.findById(updates.getModel().getId())
//                    .orElseThrow(() -> new RuntimeException("Model not found"));
//
//            if (!model.getIsActive()) {
//                throw new RuntimeException("Cannot assign model number to inactive model");
//            }
//
//            // Check if this model number already exists for the NEW model
//            Optional<ModelNumber> duplicate = modelNumberRepository.findByModelNumberAndModelId(
//                    updates.getModelNumber().trim(),
//                    model.getId()
//            );
//
//            if (duplicate.isPresent()) {
//                throw new RuntimeException("Model number '" + updates.getModelNumber() +
//                        "' already exists for model '" + model.getModelName() + "'. " +
//                        "The same model number cannot be added to the same model twice.");
//            }
//
//            existing.setModel(model);
//        } else {
//            // Model is not changing, but model number might be changing
//            // Check if the new model number + existing model combination already exists (excluding current record)
//            Optional<ModelNumber> duplicate = modelNumberRepository.findByModelNumberAndModelIdExcludingId(
//                    updates.getModelNumber().trim(),
//                    existing.getModel().getId(),
//                    id
//            );
//
//            if (duplicate.isPresent()) {
//                throw new RuntimeException("Model number '" + updates.getModelNumber() +
//                        "' already exists for model '" + existing.getModel().getModelName() + "'. " +
//                        "The same model number cannot be added to the same model twice.");
//            }
//        }
//
//        existing.setModelNumber(updates.getModelNumber().trim());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//
//        return modelNumberRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteModelNumber(Long id) {
//        ModelNumber modelNumber = getModelNumberById(id);
//        // Hard delete - actually remove from database
//        modelNumberRepository.delete(modelNumber);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.ModelNumber;
import com.example.demo.entity.Model;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.ModelNumberRepository;
import com.example.demo.repositories.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ModelNumberService {
    private final ModelNumberRepository modelNumberRepository;
    private final ModelRepository modelRepository;
    private final NotificationService notificationService;

    @Transactional
    public ModelNumber createModelNumber(ModelNumber modelNumber) {
        // Validate that model exists
        Model model = modelRepository.findById(modelNumber.getModel().getId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        if (!model.getIsActive()) {
            throw new RuntimeException("Cannot add model number to inactive model");
        }

        // Check if this model number already exists for this specific model
        Optional<ModelNumber> existing = modelNumberRepository.findByModelNumberAndModelId(
                modelNumber.getModelNumber().trim(),
                model.getId()
        );

        if (existing.isPresent()) {
            throw new RuntimeException("Model number '" + modelNumber.getModelNumber() +
                    "' already exists for model '" + model.getModelName() + "'. " +
                    "The same model number cannot be added to the same model twice.");
        }

        modelNumber.setIsActive(true);
        modelNumber.setModel(model);
        ModelNumber saved = modelNumberRepository.save(modelNumber);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Model number created: " + modelNumber.getModelNumber() + " for model " + model.getModelName(),
                saved,
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    public List<ModelNumber> getAllActiveModelNumbers() {
        return modelNumberRepository.findAllActive();
    }

    public List<ModelNumber> getModelNumbersByModelId(Long modelId) {
        return modelNumberRepository.findByModelId(modelId);
    }

    public ModelNumber getModelNumberById(Long id) {
        return modelNumberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model number not found"));
    }

    @Transactional
    public ModelNumber updateModelNumber(Long id, ModelNumber updates) {
        ModelNumber existing = getModelNumberById(id);

        // If model is being changed, validate the new model
        if (updates.getModel() != null && !updates.getModel().getId().equals(existing.getModel().getId())) {
            Model model = modelRepository.findById(updates.getModel().getId())
                    .orElseThrow(() -> new RuntimeException("Model not found"));

            if (!model.getIsActive()) {
                throw new RuntimeException("Cannot assign model number to inactive model");
            }

            // Check if this model number already exists for the NEW model
            Optional<ModelNumber> duplicate = modelNumberRepository.findByModelNumberAndModelId(
                    updates.getModelNumber().trim(),
                    model.getId()
            );

            if (duplicate.isPresent()) {
                throw new RuntimeException("Model number '" + updates.getModelNumber() +
                        "' already exists for model '" + model.getModelName() + "'. " +
                        "The same model number cannot be added to the same model twice.");
            }

            existing.setModel(model);
        } else {
            // Model is not changing, but model number might be changing
            // Check if the new model number + existing model combination already exists (excluding current record)
            Optional<ModelNumber> duplicate = modelNumberRepository.findByModelNumberAndModelIdExcludingId(
                    updates.getModelNumber().trim(),
                    existing.getModel().getId(),
                    id
            );

            if (duplicate.isPresent()) {
                throw new RuntimeException("Model number '" + updates.getModelNumber() +
                        "' already exists for model '" + existing.getModel().getModelName() + "'. " +
                        "The same model number cannot be added to the same model twice.");
            }
        }

        existing.setModelNumber(updates.getModelNumber().trim());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        ModelNumber saved = modelNumberRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Model number updated: " + existing.getModelNumber(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteModelNumber(Long id) {
        ModelNumber modelNumber = getModelNumberById(id);
        // Hard delete - actually remove from database
        modelNumberRepository.delete(modelNumber);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Model number deleted: " + modelNumber.getModelNumber(),
                modelNumber,
                NotificationSeverity.WARNING
        );
    }
}