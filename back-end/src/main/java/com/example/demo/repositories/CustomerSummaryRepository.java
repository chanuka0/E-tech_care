package com.example.demo.repositories;

import com.example.demo.entity.CustomerSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerSummaryRepository extends JpaRepository<CustomerSummary, Long> {

    /**
     * Find summary by customer ID
     */
    @Query("SELECT cs FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId")
    Optional<CustomerSummary> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * Check if summary exists for customer
     */
    @Query("SELECT CASE WHEN COUNT(cs) > 0 THEN true ELSE false END FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId")
    boolean existsByCustomerId(@Param("customerId") Long customerId);

    /**
     * Delete summary by customer ID
     */
    @Query("DELETE FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
}