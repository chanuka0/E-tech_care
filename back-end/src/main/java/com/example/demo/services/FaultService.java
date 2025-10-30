package com.example.demo.services;

import com.example.demo.entity.Fault;
import com.example.demo.repositories.FaultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaultService {
    private final FaultRepository faultRepository;

    @Transactional
    public Fault createFault(Fault fault) {
        fault.setIsActive(true);
        return faultRepository.save(fault);
    }

    public List<Fault> getAllActiveFaults() {
        return faultRepository.findAllActive();
    }

    public Fault getFaultById(Long id) {
        return faultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fault not found"));
    }

    @Transactional
    public Fault updateFault(Long id, Fault updates) {
        Fault existing = getFaultById(id);
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