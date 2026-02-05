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

    public Customer createCustomer(Customer customer) {
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Customer with this email already exists");
        }

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

    public Optional<Customer> getCustomerById(Long customerId) {  // ✅ Changed to Long
        return customerRepository.findById(customerId);
    }

    public List<Customer> getAllActiveCustomers() {
        return customerRepository.findByIsActiveTrueOrderByCustomerNameAsc();
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Customer> searchCustomers(String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return getAllActiveCustomers();
        }
        return customerRepository.searchCustomers(searchTerm);
    }

    public Customer updateCustomer(Long customerId, Customer customerDetails) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        if (!customer.getEmail().equals(customerDetails.getEmail())) {
            if (customerRepository.findByEmail(customerDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Customer with this email already exists");
            }
        }

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

    public Customer addCredit(Long customerId, Double creditAmount) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setCreditBalance(customer.getCreditBalance() + creditAmount);
        customer.setUpdatedAt(LocalDateTime.now());
        Customer updated = customerRepository.save(customer);

        log.info("Credit added to customer {}: {} (New balance: {})",
                customer.getCustomerName(), creditAmount, customer.getCreditBalance());
        return updated;
    }

    public Customer deductCredit(Long customerId, Double creditAmount) {  // ✅ Changed to Long
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

    public Customer incrementServiceCount(Long customerId) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setTotalServiceCount(customer.getTotalServiceCount() + 1);
        customer.setLastVisit(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    public Customer updateLastVisit(Long customerId) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setLastVisit(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long customerId) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setIsActive(false);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        log.info("Customer deactivated: {} (ID: {})", customer.getCustomerName(), customerId);
    }

    public Customer restoreCustomer(Long customerId) {  // ✅ Changed to Long
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        customer.setIsActive(true);
        customer.setUpdatedAt(LocalDateTime.now());
        Customer restored = customerRepository.save(customer);

        log.info("Customer restored: {} (ID: {})", customer.getCustomerName(), customerId);
        return restored;
    }

    public List<Customer> getCustomersWithCredit() {
        return customerRepository.findCustomersWithCredit();
    }

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