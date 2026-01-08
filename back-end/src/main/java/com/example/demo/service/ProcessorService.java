//
//package com.example.demo.service;
//
//import com.example.demo.entity.Processor;
//import com.example.demo.repositories.ProcessorRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//public class ProcessorService {
//    private final ProcessorRepository processorRepository;
//
//    @Transactional
//    public Processor createProcessor(Processor processor) {
//        // Check for duplicate processor name (case-insensitive)
//        Optional<Processor> existingProcessor = processorRepository
//                .findByProcessorNameIgnoreCase(processor.getProcessorName().trim());
//
//        if (existingProcessor.isPresent()) {
//            throw new RuntimeException(
//                    "A processor with the name '" + processor.getProcessorName() + "' already exists. Please use a different name."
//            );
//        }
//
//        processor.setIsActive(true);
//        return processorRepository.save(processor);
//    }
//
//    public List<Processor> getAllActiveProcessors() {
//        return processorRepository.findAllActive();
//    }
//
//    public List<Processor> getAllProcessors() {
//        return processorRepository.findAllProcessors();
//    }
//
//    public Processor getProcessorById(Long id) {
//        return processorRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Processor not found with id: " + id));
//    }
//
//    @Transactional
//    public Processor updateProcessor(Long id, Processor updates) {
//        Processor existing = getProcessorById(id);
//
//        // Check if the new name conflicts with another processor (case-insensitive)
//        if (!existing.getProcessorName().equalsIgnoreCase(updates.getProcessorName().trim())) {
//            Optional<Processor> duplicateProcessor = processorRepository
//                    .findByProcessorNameIgnoreCaseAndIdNot(updates.getProcessorName().trim(), id);
//
//            if (duplicateProcessor.isPresent()) {
//                throw new RuntimeException(
//                        "A processor with the name '" + updates.getProcessorName() + "' already exists. Please use a different name."
//                );
//            }
//        }
//
//        existing.setProcessorName(updates.getProcessorName().trim());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//        return processorRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteProcessor(Long id) {
//        // Check if processor exists
//        Processor processor = getProcessorById(id);
//
//        // Permanently delete from database
//        processorRepository.deleteById(id);
//    }
//
//    // Alternative method for soft delete (if needed in future)
//    @Transactional
//    public void softDeleteProcessor(Long id) {
//        Processor processor = getProcessorById(id);
//        processor.setIsActive(false);
//        processorRepository.save(processor);
//    }
//}
package com.example.demo.service;

import com.example.demo.entity.Processor;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.ProcessorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProcessorService {
    private final ProcessorRepository processorRepository;
    private final NotificationService notificationService;

    @Transactional
    public Processor createProcessor(Processor processor) {
        // Check for duplicate processor name (case-insensitive)
        Optional<Processor> existingProcessor = processorRepository
                .findByProcessorNameIgnoreCase(processor.getProcessorName().trim());

        if (existingProcessor.isPresent()) {
            throw new RuntimeException(
                    "A processor with the name '" + processor.getProcessorName() + "' already exists. Please use a different name."
            );
        }

        processor.setIsActive(true);
        Processor saved = processorRepository.save(processor);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Processor created: " + processor.getProcessorName(),
                saved,
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    public List<Processor> getAllActiveProcessors() {
        return processorRepository.findAllActive();
    }

    public List<Processor> getAllProcessors() {
        return processorRepository.findAllProcessors();
    }

    public Processor getProcessorById(Long id) {
        return processorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Processor not found with id: " + id));
    }

    @Transactional
    public Processor updateProcessor(Long id, Processor updates) {
        Processor existing = getProcessorById(id);

        // Check if the new name conflicts with another processor (case-insensitive)
        if (!existing.getProcessorName().equalsIgnoreCase(updates.getProcessorName().trim())) {
            Optional<Processor> duplicateProcessor = processorRepository
                    .findByProcessorNameIgnoreCaseAndIdNot(updates.getProcessorName().trim(), id);

            if (duplicateProcessor.isPresent()) {
                throw new RuntimeException(
                        "A processor with the name '" + updates.getProcessorName() + "' already exists. Please use a different name."
                );
            }
        }

        existing.setProcessorName(updates.getProcessorName().trim());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        Processor saved = processorRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Processor updated: " + existing.getProcessorName(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteProcessor(Long id) {
        // Check if processor exists
        Processor processor = getProcessorById(id);

        // Permanently delete from database
        processorRepository.deleteById(id);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Processor deleted: " + processor.getProcessorName(),
                processor,
                NotificationSeverity.WARNING
        );
    }

    // Alternative method for soft delete (if needed in future)
    @Transactional
    public void softDeleteProcessor(Long id) {
        Processor processor = getProcessorById(id);
        processor.setIsActive(false);
        Processor saved = processorRepository.save(processor);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Processor deactivated: " + processor.getProcessorName(),
                saved,
                NotificationSeverity.WARNING
        );
    }
}