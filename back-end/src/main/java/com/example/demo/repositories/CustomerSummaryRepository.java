
package com.example.demo.repositories;

import com.example.demo.entity.CustomerSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerSummaryRepository extends JpaRepository<CustomerSummary, Long> {

    /**
     * Find summary by customer ID - Fixed to handle duplicates
     */
    @Query(value = "SELECT * FROM customer_summaries WHERE customer_id = :customerId ORDER BY last_updated DESC LIMIT 1", nativeQuery = true)
    Optional<CustomerSummary> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * Find all summaries for a customer
     */
    @Query("SELECT cs FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId ORDER BY cs.lastUpdated DESC")
    List<CustomerSummary> findAllByCustomerId(@Param("customerId") Long customerId);

    /**
     * Check if summary exists for customer
     */
    @Query("SELECT CASE WHEN COUNT(cs) > 0 THEN true ELSE false END FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId")
    boolean existsByCustomerId(@Param("customerId") Long customerId);

    /**
     * Delete all summaries by customer ID
     */
    @Modifying
    @Query("DELETE FROM CustomerSummary cs WHERE cs.customer.customerId = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
}