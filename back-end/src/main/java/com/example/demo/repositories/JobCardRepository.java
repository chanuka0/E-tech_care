package com.example.demo.repositories;


import com.example.demo.entity.JobCard;
import com.example.demo.entity.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {

    Optional<JobCard> findByJobNumber(String jobNumber);

    List<JobCard> findByStatus(JobStatus status);

    List<JobCard> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<JobCard> findByCustomerPhone(String phone);

    List<JobCard> findByDeviceType(String deviceType);


    @Query("SELECT j FROM JobCard j WHERE j.status = :status AND j.createdAt <= :threshold")
    List<JobCard> findPendingJobsOlderThan(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT j FROM JobCard j WHERE j.status = 'PENDING' AND j.createdAt <= :threshold")
    List<JobCard> findPendingJobsOlderThanDate(@Param("threshold") LocalDateTime threshold);


    Long countByStatus(JobStatus status);


    @Query("SELECT COUNT(j) FROM JobCard j WHERE j.createdAt BETWEEN :start AND :end")
    Long countJobsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT j FROM JobCard j WHERE j.customerName LIKE %:search% OR j.customerPhone LIKE %:search% OR j.jobNumber LIKE %:search%")
    List<JobCard> searchJobCards(@Param("search") String search);
}