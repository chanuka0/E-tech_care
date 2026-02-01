package com.example.demo.service;


import com.example.demo.entity.Customer;
import com.example.demo.repositories.CustomerRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Log4j2
@Service
@Transactional
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // Create new customer
    public Customer createCustomer(Customer customer) {
        // Validate email is unique
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Customer with this email already exists");
        }

        // Validate phone is unique
        if (customerRepository.findByPhoneNumber(customer.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Customer with this phone number already exists");
        }

        customer.setIsActive(true);
        customer.setCreditBalance(0.0);
        customer.setTotalServiceCount(0);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer saved = customerRepository.save(customer);
        log.info("New customer created: {} (ID: {})", customer.getCustomerName(), saved.getCustomerId());
        return saved;
    }

    // Get customer by ID
    public Optional<Customer> getCustomerById(Integer customerId) {
        return customerRepository.findById(customerId);
    }

    // Get all active customers
    public List<Customer> getAllActiveCustomers() {
        return customerRepository.findByIsActiveTrueOrderByCustomerNameAsc();
    }

    // Get all customers (active and inactive)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAllByOrderByCreatedAtDesc();
    }

    // Search customers
    public List<Customer> searchCustomers(String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return getAllActiveCustomers();
        }
        return customerRepository.searchCustomers(searchTerm);
    }

    // Update customer
    public Customer updateCustomer(Integer customerId, Customer customerDetails) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        // Check if email is being changed and is unique
        if (!customer.getEmail().equals(customerDetails.getEmail())) {
            if (customerRepository.findByEmail(customerDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Customer with this email already exists");
            }
        }

        // Check if phone is being changed and is unique
        if (!customer.getPhoneNumber().equals(customerDetails.getPhoneNumber())) {
            if (customerRepository.findByPhoneNumber(customerDetails.getPhoneNumber()).isPresent()) {
                throw new RuntimeException("Customer with this phone number already exists");
            }
        }

        customer.setCustomerName(customerDetails.getCustomerName());
        customer.setPhoneNumber(customerDetails.getPhoneNumber());
        customer.setEmail(customerDetails.getEmail());
        customer.setAddress(customerDetails.getAddress());
        customer.setNotes(customerDetails.getNotes());
        customer.setUpdatedAt(LocalDateTime.now());

        Customer updated = customerRepository.save(customer);
        log.info("Customer updated: {} (ID: {})", customer.getCustomerName(), customerId);
        return updated;
    }

    // Add credit to customer
    public Customer addCredit(Integer customerId, Double creditAmount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setCreditBalance(customer.getCreditBalance() + creditAmount);
        customer.setUpdatedAt(LocalDateTime.now());
        Customer updated = customerRepository.save(customer);

        log.info("Credit added to customer {}: {} (New balance: {})",
                customer.getCustomerName(), creditAmount, customer.getCreditBalance());
        return updated;
    }

    // Deduct credit from customer
    public Customer deductCredit(Integer customerId, Double creditAmount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        if (customer.getCreditBalance() < creditAmount) {
            throw new RuntimeException("Insufficient credit balance");
        }

        customer.setCreditBalance(customer.getCreditBalance() - creditAmount);
        customer.setUpdatedAt(LocalDateTime.now());
        Customer updated = customerRepository.save(customer);

        log.info("Credit deducted from customer {}: {} (New balance: {})",
                customer.getCustomerName(), creditAmount, customer.getCreditBalance());
        return updated;
    }

    // Update service count
    public Customer incrementServiceCount(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setTotalServiceCount(customer.getTotalServiceCount() + 1);
        customer.setLastVisit(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    // Update last visit
    public Customer updateLastVisit(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setLastVisit(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    // Delete customer (soft delete - deactivate)
    public void deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setIsActive(false);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        log.info("Customer deactivated: {} (ID: {})", customer.getCustomerName(), customerId);
    }

    // Restore customer
    public Customer restoreCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setIsActive(true);
        customer.setUpdatedAt(LocalDateTime.now());
        Customer restored = customerRepository.save(customer);

        log.info("Customer restored: {} (ID: {})", customer.getCustomerName(), customerId);
        return restored;
    }

    // Get customers with credit balance
    public List<Customer> getCustomersWithCredit() {
        return customerRepository.findCustomersWithCredit();
    }

    // Get customer stats
    public int getTotalActiveCustomers() {
        return getAllActiveCustomers().size();
    }

    public int getTotalCustomers() {
        return (int) customerRepository.count();
    }

    public Double getTotalCreditInSystem() {
        List<Customer> customers = getAllCustomers();
        return customers.stream()
                .mapToDouble(Customer::getCreditBalance)
                .sum();
    }
}