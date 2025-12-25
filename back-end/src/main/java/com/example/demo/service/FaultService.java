//package com.example.demo.service;
//
//import com.example.demo.entity.Fault;
//import com.example.demo.repositories.FaultRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class FaultService {
//    private final FaultRepository faultRepository;
//
//    @Transactional
//    public Fault createFault(Fault fault) {
//        fault.setIsActive(true);
//        return faultRepository.save(fault);
//    }
//
//    public List<Fault> getAllActiveFaults() {
//        return faultRepository.findAllActive();
//    }
//
//    public Fault getFaultById(Long id) {
//        return faultRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Fault not found"));
//    }
//
//    @Transactional
//    public Fault updateFault(Long id, Fault updates) {
//        Fault existing = getFaultById(id);
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
//
//
//





package com.example.demo.service;

import com.example.demo.entity.Fault;
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

    @Transactional
    public Fault createFault(Fault fault) {
        // Check if fault name already exists
        Fault existingFault = faultRepository.findByFaultName(fault.getFaultName());
        if (existingFault != null) {
            throw new RuntimeException("Fault with name '" + fault.getFaultName() + "' already exists");
        }

        fault.setIsActive(true);
        return faultRepository.save(fault);
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
        return faultRepository.save(existing);
    }

    @Transactional
    public void deleteFault(Long id) {
        Fault fault = getFaultById(id);
        fault.setIsActive(false);
        faultRepository.save(fault);
    }
}