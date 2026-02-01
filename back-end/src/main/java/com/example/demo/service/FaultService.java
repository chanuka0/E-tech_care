//
//package com.example.demo.service;
//
//import com.example.demo.entity.Fault;
//import com.example.demo.repositories.FaultRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.dao.DataIntegrityViolationException;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.util.List;
//import com.example.demo.service.NotificationService;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.entity.NotificationSeverity;
//
//@Service
//@RequiredArgsConstructor
//public class FaultService {
//    private final FaultRepository faultRepository;
//    private final NotificationService notificationService;
//
//    @Transactional
//    public Fault createFault(Fault fault) {
//        // Check if fault name already exists
//        Fault existingFault = faultRepository.findByFaultName(fault.getFaultName());
//        if (existingFault != null) {
//            throw new RuntimeException("Fault with name '" + fault.getFaultName() + "' already exists");
//        }
//
//        fault.setIsActive(true);
//        return faultRepository.save(fault);
//    }
//
//    public List<Fault> getAllActiveFaults() {
//        return faultRepository.findAllActive();
//    }
//
//    public List<Fault> getAllFaults() {
//        return faultRepository.findAll();
//    }
//
//    public Fault getFaultById(Long id) {
//        return faultRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Fault not found with id: " + id));
//    }
//
//    @Transactional
//    public Fault updateFault(Long id, Fault updates) {
//        Fault existing = getFaultById(id);
//
//        // Check if fault name is being changed and if it already exists (excluding current fault)
//        if (!existing.getFaultName().equals(updates.getFaultName())) {
//            Fault duplicateFault = faultRepository.findByFaultName(updates.getFaultName());
//            if (duplicateFault != null && !duplicateFault.getId().equals(id)) {
//                throw new RuntimeException("Fault with name '" + updates.getFaultName() + "' already exists");
//            }
//        }
//
//        existing.setFaultName(updates.getFaultName());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//        return faultRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteFault(Long id) {
//        Fault fault = getFaultById(id);
//        fault.setIsActive(false);
//        faultRepository.save(fault);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.Fault;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.FaultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaultService {
    private final FaultRepository faultRepository;
    private final NotificationService notificationService;

    @Transactional
    public Fault createFault(Fault fault) {
        // Check if fault name already exists
        Fault existingFault = faultRepository.findByFaultName(fault.getFaultName());
        if (existingFault != null) {
            throw new RuntimeException("Fault with name '" + fault.getFaultName() + "' already exists");
        }

        fault.setIsActive(true);
        Fault saved = faultRepository.save(fault);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Fault created: " + fault.getFaultName(),
                saved,
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

        // Check if fault name is being changed and if it already exists (excluding current fault)
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

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Fault updated: " + existing.getFaultName(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteFault(Long id) {
        Fault fault = getFaultById(id);
        fault.setIsActive(false);
        faultRepository.save(fault);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Fault deactivated: " + fault.getFaultName(),
                fault,
                NotificationSeverity.WARNING
        );
    }
}