package com.example.demo.repositories;

import com.example.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {  // Changed to Long

    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    List<Customer> findByIsActiveTrueOrderByCustomerNameAsc();
    List<Customer> findByCustomerNameContainingIgnoreCaseAndIsActiveTrue(String customerName);
    List<Customer> findByPhoneNumberContainingAndIsActiveTrue(String phoneNumber);
    List<Customer> findAllByOrderByCreatedAtDesc();

    @Query("SELECT c FROM Customer c WHERE c.creditBalance > 0 AND c.isActive = true ORDER BY c.creditBalance DESC")
    List<Customer> findCustomersWithCredit();

    @Query("SELECT c FROM Customer c WHERE " +
            "(LOWER(c.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "c.phoneNumber LIKE CONCAT('%', :searchTerm, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND c.isActive = true " +
            "ORDER BY c.customerName ASC")
    List<Customer> searchCustomers(@Param("searchTerm") String searchTerm);
}