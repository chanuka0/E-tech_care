package com.example.demo.controller;

import com.example.demo.entity.DeviceCondition;
import com.example.demo.services.DeviceConditionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device-conditions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeviceConditionController {
    private final DeviceConditionService deviceConditionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeviceCondition> createDeviceCondition(@RequestBody DeviceCondition deviceCondition) {
        return ResponseEntity.ok(deviceConditionService.createDeviceCondition(deviceCondition));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DeviceCondition>> getAllDeviceConditions() {
        return ResponseEntity.ok(deviceConditionService.getAllActiveDeviceConditions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<DeviceCondition> getDeviceConditionById(@PathVariable Long id) {
        return ResponseEntity.ok(deviceConditionService.getDeviceConditionById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeviceCondition> updateDeviceCondition(@PathVariable Long id, @RequestBody DeviceCondition deviceCondition) {
        return ResponseEntity.ok(deviceConditionService.updateDeviceCondition(id, deviceCondition));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDeviceCondition(@PathVariable Long id) {
        deviceConditionService.deleteDeviceCondition(id);
        return ResponseEntity.ok().build();
    }
}