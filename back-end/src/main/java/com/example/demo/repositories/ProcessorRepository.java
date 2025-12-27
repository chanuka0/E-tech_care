//package com.example.demo.repositories;
//
//import com.example.demo.entity.Processor;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface ProcessorRepository extends JpaRepository<Processor, Long> {
//    @Query("SELECT p FROM Processor p WHERE p.isActive = true ORDER BY p.processorName")
//    List<Processor> findAllActive();
//
//    Processor findByProcessorName(String processorName);
//}



package com.example.demo.repositories;

import com.example.demo.entity.Processor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessorRepository extends JpaRepository<Processor, Long> {
    @Query("SELECT p FROM Processor p WHERE p.isActive = true ORDER BY p.processorName")
    List<Processor> findAllActive();

    @Query("SELECT p FROM Processor p ORDER BY p.processorName")
    List<Processor> findAllProcessors();

    Optional<Processor> findByProcessorName(String processorName);

    @Query("SELECT p FROM Processor p WHERE LOWER(p.processorName) = LOWER(:processorName)")
    Optional<Processor> findByProcessorNameIgnoreCase(@Param("processorName") String processorName);

    @Query("SELECT p FROM Processor p WHERE LOWER(p.processorName) = LOWER(:processorName) AND p.id != :id")
    Optional<Processor> findByProcessorNameIgnoreCaseAndIdNot(@Param("processorName") String processorName, @Param("id") Long id);
}