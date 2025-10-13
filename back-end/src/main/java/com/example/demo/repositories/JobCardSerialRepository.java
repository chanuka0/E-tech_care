package com.example.demo.repositories;

import com.example.demo.entity.JobCardSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobCardSerialRepository extends JpaRepository<JobCardSerial, Long> {
    List<JobCardSerial> findByJobCardId(Long jobCardId);
    List<JobCardSerial> findBySerialValue(String serialValue);
}