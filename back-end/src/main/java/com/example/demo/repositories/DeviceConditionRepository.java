package com.example.demo.repositories;

import com.example.demo.entity.DeviceCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceConditionRepository extends JpaRepository<DeviceCondition, Long> {
    @Query("SELECT d FROM DeviceCondition d WHERE d.isActive = true ORDER BY d.conditionName")
    List<DeviceCondition> findAllActive();

    DeviceCondition findByConditionName(String conditionName);
}