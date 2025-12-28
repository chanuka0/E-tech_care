//package com.example.demo.controller;
//
//import com.example.demo.entity.DeviceCondition;
//import com.example.demo.service.DeviceConditionService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/device-conditions")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class DeviceConditionController {
//    private final DeviceConditionService deviceConditionService;
//
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<DeviceCondition> createDeviceCondition(@RequestBody DeviceCondition deviceCondition) {
//        return ResponseEntity.ok(deviceConditionService.createDeviceCondition(deviceCondition));
//    }
//
//    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<List<DeviceCondition>> getAllDeviceConditions() {
//        return ResponseEntity.ok(deviceConditionService.getAllActiveDeviceConditions());
//    }
//
//    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
//    public ResponseEntity<DeviceCondition> getDeviceConditionById(@PathVariable Long id) {
//        return ResponseEntity.ok(deviceConditionService.getDeviceConditionById(id));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<DeviceCondition> updateDeviceCondition(@PathVariable Long id, @RequestBody DeviceCondition deviceCondition) {
//        return ResponseEntity.ok(deviceConditionService.updateDeviceCondition(id, deviceCondition));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<Void> deleteDeviceCondition(@PathVariable Long id) {
//        deviceConditionService.deleteDeviceCondition(id);
//        return ResponseEntity.ok().build();
//    }
//}



package com.example.demo.controller;

import com.example.demo.entity.DeviceCondition;
import com.example.demo.service.DeviceConditionService;
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

    // Modified to return ALL conditions for admin management
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DeviceCondition>> getAllDeviceConditions() {
        // Return ALL conditions (active and inactive) for management interface
        return ResponseEntity.ok(deviceConditionService.getAllDeviceConditions());
    }

    // New endpoint for getting only active conditions (for dropdowns in job cards, etc.)
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<DeviceCondition>> getActiveDeviceConditions() {
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

    // Performs PERMANENT deletion
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDeviceCondition(@PathVariable Long id) {
        deviceConditionService.deleteDeviceCondition(id);
        return ResponseEntity.ok().build();
    }
}