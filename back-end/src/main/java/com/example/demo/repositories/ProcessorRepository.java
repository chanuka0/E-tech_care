package com.example.demo.repositories;

import com.example.demo.entity.Processor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessorRepository extends JpaRepository<Processor, Long> {
    @Query("SELECT p FROM Processor p WHERE p.isActive = true ORDER BY p.processorName")
    List<Processor> findAllActive();

    Processor findByProcessorName(String processorName);
}