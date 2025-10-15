package com.example.demo.services;

import com.example.demo.entity.Model;
import com.example.demo.repositories.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelService {

    private final ModelRepository modelRepository;

    @Transactional
    public Model createModel(Model model) {
        // Check if model already exists for this brand
        if (modelRepository.existsByNameAndBrandId(model.getName(), model.getBrandId())) {
            throw new RuntimeException("Model with name '" + model.getName() + "' already exists for this brand");
        }
        return modelRepository.save(model);
    }

    public List<Model> getAllModels() {
        return modelRepository.findAll();
    }

    public Model getModelById(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found with id: " + id));
    }

    public List<Model> getModelsByBrandId(Long brandId) {
        return modelRepository.findByBrandId(brandId);
    }

    @Transactional
    public Model updateModel(Long id, Model modelDetails) {
        Model model = getModelById(id);
        model.setName(modelDetails.getName());
        model.setBrandId(modelDetails.getBrandId());
        return modelRepository.save(model);
    }

    @Transactional
    public void deleteModel(Long id) {
        Model model = getModelById(id);
        modelRepository.delete(model);
    }
}
