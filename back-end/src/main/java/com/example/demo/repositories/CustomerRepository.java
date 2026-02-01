package com.example.demo.repositories;

import com.example.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    // Find by email
    Optional<Customer> findByEmail(String email);

    // Find by phone number
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    // Find all active customers
    List<Customer> findByIsActiveTrueOrderByCustomerNameAsc();

    // Find by customer name (like search)
    List<Customer> findByCustomerNameContainingIgnoreCaseAndIsActiveTrue(String customerName);

    // Find by phone number (like search)
    List<Customer> findByPhoneNumberContainingAndIsActiveTrue(String phoneNumber);

    // Find all customers (both active and inactive)
    List<Customer> findAllByOrderByCreatedAtDesc();

    // Custom query to find customers by credit balance > 0
    @Query("SELECT c FROM Customer c WHERE c.creditBalance > 0 AND c.isActive = true ORDER BY c.creditBalance DESC")
    List<Customer> findCustomersWithCredit();

    // Search customers by name or phone or email
    @Query("SELECT c FROM Customer c WHERE " +
            "(LOWER(c.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "c.phoneNumber LIKE CONCAT('%', :searchTerm, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND c.isActive = true " +
            "ORDER BY c.customerName ASC")
    List<Customer> searchCustomers(@Param("searchTerm") String searchTerm);
}