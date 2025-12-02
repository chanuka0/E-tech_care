package com.example.demo.service;

import com.example.demo.entity.Processor;
import com.example.demo.repositories.ProcessorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcessorService {
    private final ProcessorRepository processorRepository;

    @Transactional
    public Processor createProcessor(Processor processor) {
        processor.setIsActive(true);
        return processorRepository.save(processor);
    }

    public List<Processor> getAllActiveProcessors() {
        return processorRepository.findAllActive();
    }

    public Processor getProcessorById(Long id) {
        return processorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Processor not found"));
    }

    @Transactional
    public Processor updateProcessor(Long id, Processor updates) {
        Processor existing = getProcessorById(id);
        existing.setProcessorName(updates.getProcessorName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        return processorRepository.save(existing);
    }

    @Transactional
    public void deleteProcessor(Long id) {
        Processor processor = getProcessorById(id);
        processor.setIsActive(false);
        processorRepository.save(processor);
    }
}