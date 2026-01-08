//
//package com.example.demo.service;
//
//import com.example.demo.entity.DeviceCondition;
//import com.example.demo.repositories.DeviceConditionRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class DeviceConditionService {
//    private final DeviceConditionRepository deviceConditionRepository;
//
//    @Transactional
//    public DeviceCondition createDeviceCondition(DeviceCondition deviceCondition) {
//        deviceCondition.setIsActive(true);
//        return deviceConditionRepository.save(deviceCondition);
//    }
//
//    // Get all active conditions (for regular users/dropdowns)
//    public List<DeviceCondition> getAllActiveDeviceConditions() {
//        return deviceConditionRepository.findAllActive();
//    }
//
//    // Get ALL conditions including inactive (for admin management)
//    public List<DeviceCondition> getAllDeviceConditions() {
//        return deviceConditionRepository.findAll();
//    }
//
//    public DeviceCondition getDeviceConditionById(Long id) {
//        return deviceConditionRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Device Condition not found"));
//    }
//
//    @Transactional
//    public DeviceCondition updateDeviceCondition(Long id, DeviceCondition updates) {
//        DeviceCondition existing = getDeviceConditionById(id);
//        existing.setConditionName(updates.getConditionName());
//        existing.setDescription(updates.getDescription());
//        existing.setIsActive(updates.getIsActive());
//        return deviceConditionRepository.save(existing);
//    }
//
//    @Transactional
//    public void deleteDeviceCondition(Long id) {
//        DeviceCondition deviceCondition = getDeviceConditionById(id);
//        // PERMANENT DELETION (instead of soft delete)
//        deviceConditionRepository.delete(deviceCondition);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.DeviceCondition;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.DeviceConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceConditionService {
    private final DeviceConditionRepository deviceConditionRepository;
    private final NotificationService notificationService;

    @Transactional
    public DeviceCondition createDeviceCondition(DeviceCondition deviceCondition) {
        deviceCondition.setIsActive(true);
        DeviceCondition saved = deviceConditionRepository.save(deviceCondition);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Device condition created: " + deviceCondition.getConditionName(),
                saved,
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    // Get all active conditions (for regular users/dropdowns)
    public List<DeviceCondition> getAllActiveDeviceConditions() {
        return deviceConditionRepository.findAllActive();
    }

    // Get ALL conditions including inactive (for admin management)
    public List<DeviceCondition> getAllDeviceConditions() {
        return deviceConditionRepository.findAll();
    }

    public DeviceCondition getDeviceConditionById(Long id) {
        return deviceConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device Condition not found"));
    }

    @Transactional
    public DeviceCondition updateDeviceCondition(Long id, DeviceCondition updates) {
        DeviceCondition existing = getDeviceConditionById(id);
        existing.setConditionName(updates.getConditionName());
        existing.setDescription(updates.getDescription());
        existing.setIsActive(updates.getIsActive());
        DeviceCondition saved = deviceConditionRepository.save(existing);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Device condition updated: " + existing.getConditionName(),
                saved,
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public void deleteDeviceCondition(Long id) {
        DeviceCondition deviceCondition = getDeviceConditionById(id);
        // PERMANENT DELETION (instead of soft delete)
        deviceConditionRepository.delete(deviceCondition);

        // ✅ ADD NOTIFICATION
        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Device condition deleted: " + deviceCondition.getConditionName(),
                deviceCondition,
                NotificationSeverity.WARNING
        );
    }
}