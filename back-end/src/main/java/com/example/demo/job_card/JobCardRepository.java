package com.example.demo.job_card;


//import com.example.demo.entities.JobCard;
//import com.example.demo.entities.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, Long> {

    @Query("SELECT j FROM JobCard j ORDER BY j.id DESC")
    List<JobCard> findAllOrderByIdDesc();

    List<JobCard> findByStatus(JobStatus status);

//    List<JobCard> findByCreatedBy_Id(Integer userId);

    List<JobCard> findByCreatedBy_UserId(Integer userId);

    Optional<JobCard> findBySerialNumberIgnoreCase(String serialNumber);

    Optional<JobCard> findByJobCardNumber(String jobCardNumber);

    @Query("SELECT j FROM JobCard j WHERE j.expectedDeliveryDate BETWEEN :startDate AND :endDate")
    List<JobCard> findByExpectedDeliveryDateBetween(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT j FROM JobCard j WHERE j.customerName LIKE %:customerName% OR j.contactNumber LIKE %:contact%")
    List<JobCard> findByCustomerNameOrContact(@Param("customerName") String customerName,
                                              @Param("contact") String contact);

    @Query("SELECT MAX(CAST(SUBSTRING(j.jobCardNumber, 4) AS integer)) FROM JobCard j WHERE j.jobCardNumber LIKE 'JOB%'")
    Integer findMaxJobCardNumber();
}
