package com.example.demo.service;

import com.example.demo.entity.ModelNumber;
import com.example.demo.entity.Model;
import com.example.demo.repositories.ModelNumberRepository;
import com.example.demo.repositories.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelNumberService {
    private final ModelNumberRepository modelNumberRepository;
    private final ModelRepository modelRepository;

    @Transactional
    public ModelNumber createModelNumber(ModelNumber modelNumber) {
        // Validate that model exists
        Model model = modelRepository.findById(modelNumber.getModel().getId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        if (!model.getIsActive()) {
            throw new RuntimeException("Cannot add model number to inactive model");
        }

        modelNumber.setIsActive(true);
        modelNumber.setModel(model);
        return modelNumberRepository.save(modelNumber);
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
            existing.setModel(model);
        }

        existing.setModelNumber(updates.getModelNumber());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());

        return modelNumberRepository.save(existing);
    }

    @Transactional
    public void deleteModelNumber(Long id) {
        ModelNumber modelNumber = getModelNumberById(id);
        modelNumber.setIsActive(false);
        modelNumberRepository.save(modelNumber);
    }
}