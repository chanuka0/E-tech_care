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
        model.setIsActive(true);
        return modelRepository.save(model);
    }

    public List<Model> getAllActiveModels() {
        return modelRepository.findAllActive();
    }

    public Model getModelById(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Model not found"));
    }

    @Transactional
    public Model updateModel(Long id, Model updates) {
        Model existing = getModelById(id);
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