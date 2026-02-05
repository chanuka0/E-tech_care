package com.example.demo.service;

import com.example.demo.entity.Fault;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.FaultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FaultService {
    private final FaultRepository faultRepository;
    private final NotificationService notificationService;

    private Map<String, Object> createFaultPayload(Fault fault) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", fault.getId());
        payload.put("faultName", fault.getFaultName());
        payload.put("description", fault.getDescription());
        payload.put("isActive", fault.getIsActive());
        payload.put("createdAt", fault.getCreatedAt());
        payload.put("updatedAt", fault.getUpdatedAt());
        return payload;
    }

    @Transactional
    public Fault createFault(Fault fault) {
        Fault existingFault = faultRepository.findByFaultName(fault.getFaultName());
        if (existingFault != null) {
            throw new RuntimeException("Fault with name '" + fault.getFaultName() + "' already exists");
        }

        fault.setIsActive(true);
        Fault saved = faultRepository.save(fault);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Fault created: " + fault.getFaultName(),
                createFaultPayload(saved),
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    public List<Fault> getAllActiveFaults() {
        return faultRepository.findAllActive();
    }

    public List<Fault> getAllFaults() {
        return faultRepository.findAll();
    }

    public Fault getFaultById(Long id) {
        return faultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fault not found with id: " + id));
    }

    @Transactional
    public Fault updateFault(Long id, Fault updates) {
        Fault existing = getFaultById(id);

        if (!existing.getFaultName().equals(updates.getFaultName())) {
            Fault duplicateFault = faultRepository.findByFaultName(updates.getFaultName());
            if (duplicateFault != null && !duplicateFault.getId().equals(id)) {
                throw new RuntimeException("Fault with name '" + updates.getFaultName() + "' already exists");
            }
        }

        existing.setFaultName(updates.getFaultName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        Fault saved = faultRepository.save(existing);

        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Fault updated: " + existing.getFaultName(),
                createFaultPayload(saved),
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteFault(Long id) {
        Fault fault = getFaultById(id);

        Map<String, Object> payload = createFaultPayload(fault);

        fault.setIsActive(false);
        faultRepository.save(fault);

        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Fault deactivated: " + fault.getFaultName(),
                payload,
                NotificationSeverity.WARNING
        );
    }
}