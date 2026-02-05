package com.example.demo.service;

import com.example.demo.entity.DeviceCondition;
import com.example.demo.entity.NotificationType;
import com.example.demo.entity.NotificationSeverity;
import com.example.demo.repositories.DeviceConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeviceConditionService {
    private final DeviceConditionRepository deviceConditionRepository;
    private final NotificationService notificationService;

    private Map<String, Object> createDeviceConditionPayload(DeviceCondition condition) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", condition.getId());
        payload.put("conditionName", condition.getConditionName());
        payload.put("description", condition.getDescription());
        payload.put("isActive", condition.getIsActive());
        payload.put("createdAt", condition.getCreatedAt());
        payload.put("updatedAt", condition.getUpdatedAt());
        return payload;
    }

    @Transactional
    public DeviceCondition createDeviceCondition(DeviceCondition deviceCondition) {
        deviceCondition.setIsActive(true);
        DeviceCondition saved = deviceConditionRepository.save(deviceCondition);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Device condition created: " + deviceCondition.getConditionName(),
                createDeviceConditionPayload(saved),
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    public List<DeviceCondition> getAllActiveDeviceConditions() {
        return deviceConditionRepository.findAllActive();
    }

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

        notificationService.sendNotification(
                NotificationType.JOB_UPDATED,
                "Device condition updated: " + existing.getConditionName(),
                createDeviceConditionPayload(saved),
                NotificationSeverity.INFO
        );

        return saved;
    }

    @Transactional
    public DeviceCondition activateDeviceCondition(Long id) {
        DeviceCondition deviceCondition = getDeviceConditionById(id);
        deviceCondition.setIsActive(true);
        DeviceCondition saved = deviceConditionRepository.save(deviceCondition);

        notificationService.sendNotification(
                NotificationType.STOCK_UPDATE,
                "Device condition activated: " + deviceCondition.getConditionName(),
                createDeviceConditionPayload(saved),
                NotificationSeverity.SUCCESS
        );

        return saved;
    }

    @Transactional
    public DeviceCondition deactivateDeviceCondition(Long id) {
        DeviceCondition deviceCondition = getDeviceConditionById(id);
        deviceCondition.setIsActive(false);
        DeviceCondition saved = deviceConditionRepository.save(deviceCondition);

        notificationService.sendNotification(
                NotificationType.ITEM_REMOVED,
                "Device condition deactivated: " + deviceCondition.getConditionName(),
                createDeviceConditionPayload(saved),
                NotificationSeverity.WARNING
        );

        return saved;
    }
}