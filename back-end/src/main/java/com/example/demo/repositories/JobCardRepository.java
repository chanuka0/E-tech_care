
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

    // Find by device barcode
    @Query("SELECT j FROM JobCard j WHERE j.deviceBarcode = :barcode")
    List<JobCard> findByDeviceBarcode(@Param("barcode") String barcode);

    // Find by device serial number (from JobCardSerial)
    @Query("SELECT DISTINCT j FROM JobCard j JOIN j.serials s WHERE s.serialValue = :serialNumber")
    List<JobCard> findByDeviceSerialNumber(@Param("serialNumber") String serialNumber);

    // Find job cards by service category
    @Query("SELECT DISTINCT j FROM JobCard j JOIN j.serviceCategories sc WHERE sc.id = :serviceCategoryId")
    List<JobCard> findByServiceCategoriesId(@Param("serviceCategoryId") Long serviceCategoryId);

    @Query("SELECT j FROM JobCard j WHERE j.status = :status AND j.createdAt <= :threshold")
    List<JobCard> findPendingJobsOlderThan(@Param("status") JobStatus status, @Param("threshold") LocalDateTime threshold);

    @Query("SELECT j FROM JobCard j WHERE j.status = 'PENDING' AND j.createdAt <= :threshold")
    List<JobCard> findPendingJobsOlderThanDate(@Param("threshold") LocalDateTime threshold);

    Long countByStatus(JobStatus status);

    @Query("SELECT COUNT(j) FROM JobCard j WHERE j.createdAt BETWEEN :start AND :end")
    Long countJobsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // UPDATED: Search includes device serial number and faults
    @Query("SELECT DISTINCT j FROM JobCard j " +
            "LEFT JOIN j.serials s " +
            "LEFT JOIN j.faults f " +
            "WHERE j.customerName LIKE %:search% " +
            "OR j.customerPhone LIKE %:search% " +
            "OR j.jobNumber LIKE %:search% " +
            "OR j.deviceBarcode LIKE %:search% " +
            "OR j.deviceType LIKE %:search% " +
            "OR j.faultDescription LIKE %:search% " +
            "OR s.serialValue LIKE %:search% " +
            "OR f.faultName LIKE %:search%")
    List<JobCard> searchJobCards(@Param("search") String search);

    // NEW: Find the maximum job number overall
    @Query("SELECT MAX(j.jobNumber) FROM JobCard j")
    Optional<String> findMaxJobNumber();

    // NEW: Find job numbers for today
    @Query("SELECT j.jobNumber FROM JobCard j WHERE j.createdAt >= :startOfDay ORDER BY j.jobNumber")
    List<String> findTodayJobNumbers(@Param("startOfDay") LocalDateTime startOfDay);

    // Existing method (if you have it)
    List<JobCard> findAllByOrderByCreatedAtAsc();

    // ✅ ADD THESE METHODS TO JobCardRepository.java

    /**
     * Find job cards by customer
     */
    @Query("SELECT j FROM JobCard j WHERE j.customer.id = :customerId ORDER BY j.createdAt DESC")
    List<JobCard> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * Find job cards by customer and status
     */
    @Query("SELECT j FROM JobCard j WHERE j.customer.id = :customerId AND j.status = :status ORDER BY j.createdAt DESC")
    List<JobCard> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") JobStatus status);

    /**
     * Count job cards for a customer
     */
    @Query("SELECT COUNT(j) FROM JobCard j WHERE j.customer.id = :customerId")
    Long countByCustomerId(@Param("customerId") Long customerId);

    /**
     * Find job cards created by regular customers
     */
    @Query("SELECT j FROM JobCard j WHERE j.isRegularCustomer = true ORDER BY j.createdAt DESC")
    List<JobCard> findAllRegularCustomerJobCards();

    /**
     * Get total service cost for a customer
     */
    @Query("SELECT COALESCE(SUM(j.totalServicePrice), 0) FROM JobCard j WHERE j.customer.id = :customerId")
    Double getTotalServiceCostForCustomer(@Param("customerId") Long customerId);
}