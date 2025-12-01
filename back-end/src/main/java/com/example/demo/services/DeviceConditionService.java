package com.example.demo.services;

import com.example.demo.entity.DeviceCondition;
import com.example.demo.repositories.DeviceConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceConditionService {
    private final DeviceConditionRepository deviceConditionRepository;

    @Transactional
    public DeviceCondition createDeviceCondition(DeviceCondition deviceCondition) {
        deviceCondition.setIsActive(true);
        return deviceConditionRepository.save(deviceCondition);
    }

    public List<DeviceCondition> getAllActiveDeviceConditions() {
        return deviceConditionRepository.findAllActive();
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
        return deviceConditionRepository.save(existing);
    }

    @Transactional
    public void deleteDeviceCondition(Long id) {
        DeviceCondition deviceCondition = getDeviceConditionById(id);
        deviceCondition.setIsActive(false);
        deviceConditionRepository.save(deviceCondition);
    }
}