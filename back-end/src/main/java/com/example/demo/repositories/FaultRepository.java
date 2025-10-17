package com.example.demo.repositories;

import com.example.demo.entity.Fault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultRepository extends JpaRepository<Fault, Long> {
    @Query("SELECT f FROM Fault f WHERE f.isActive = true ORDER BY f.faultName")
    List<Fault> findAllActive();

    Fault findByFaultName(String faultName);
}