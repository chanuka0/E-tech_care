package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.service.CustomerService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Log4j2
@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://16.16.203.25"})
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Create new customer - Both user and admin can create
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        try {
            log.info("Creating new customer: {}", customer.getCustomerName());
            Customer newCustomer = customerService.createCustomer(customer);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Customer created successfully");
            response.put("customer", toCustomerResponse(newCustomer));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error creating customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating customer", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create customer"));
        }
    }

    // Get all active customers
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllActiveCustomers() {
        try {
            List<Customer> customers = customerService.getAllActiveCustomers();
            List<Map<String, Object>> customerList = customers.stream()
                    .map(this::toCustomerResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", customerList.size());
            response.put("customers", customerList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching customers", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customers"));
        }
    }

    // Get all customers (active and inactive) - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<Customer> customers = customerService.getAllCustomers();
            List<Map<String, Object>> customerList = customers.stream()
                    .map(this::toCustomerResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", customerList.size());
            response.put("customers", customerList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all customers", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customers"));
        }
    }

    // Search customers
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchCustomers(@RequestParam(required = false) String query) {
        try {
            List<Customer> customers = customerService.searchCustomers(query);
            List<Map<String, Object>> customerList = customers.stream()
                    .map(this::toCustomerResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", customerList.size());
            response.put("customers", customerList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching customers", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to search customers"));
        }
    }

    // Get customer by ID
    @GetMapping("/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomerById(@PathVariable Long customerId) {
        try {
            return customerService.getCustomerById(customerId)
                    .map(customer -> ResponseEntity.ok(toCustomerResponse(customer)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching customer", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customer"));
        }
    }

    // Update customer
    @PutMapping("/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long customerId,
            @RequestBody Customer customerDetails) {
        try {
            log.info("Updating customer: {}", customerId);
            Customer updated = customerService.updateCustomer(customerId, customerDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Customer updated successfully");
            response.put("customer", toCustomerResponse(updated));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating customer", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update customer"));
        }
    }

    // Add credit to customer
    @PostMapping("/{customerId}/add-credit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addCredit(
            @PathVariable Long customerId,
            @RequestBody Map<String, Double> request) {
        try {
            Double amount = request.get("amount");
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than 0"));
            }

            log.info("Adding credit to customer {}: {}", customerId, amount);
            Customer updated = customerService.addCredit(customerId, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Credit added successfully");
            response.put("customer", toCustomerResponse(updated));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error adding credit: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error adding credit", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add credit"));
        }
    }

    // Deduct credit from customer
    @PostMapping("/{customerId}/deduct-credit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deductCredit(
            @PathVariable Long customerId,
            @RequestBody Map<String, Double> request) {
        try {
            Double amount = request.get("amount");
            if (amount == null || amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than 0"));
            }

            log.info("Deducting credit from customer {}: {}", customerId, amount);
            Customer updated = customerService.deductCredit(customerId, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Credit deducted successfully");
            response.put("customer", toCustomerResponse(updated));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deducting credit: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deducting credit", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to deduct credit"));
        }
    }

    // Delete customer (soft delete)
    @DeleteMapping("/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long customerId) {
        try {
            log.info("Deleting customer: {}", customerId);
            customerService.deleteCustomer(customerId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Customer deleted successfully");
            response.put("customerId", customerId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting customer", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete customer"));
        }
    }

    // Restore customer - Admin only
    @PostMapping("/{customerId}/restore")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> restoreCustomer(@PathVariable Long customerId) {
        try {
            log.info("Restoring customer: {}", customerId);
            Customer restored = customerService.restoreCustomer(customerId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Customer restored successfully");
            response.put("customer", toCustomerResponse(restored));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error restoring customer: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error restoring customer", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to restore customer"));
        }
    }

    // Get customers with credit
    @GetMapping("/with-credit/list")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCustomersWithCredit() {
        try {
            List<Customer> customers = customerService.getCustomersWithCredit();
            List<Map<String, Object>> customerList = customers.stream()
                    .map(this::toCustomerResponse)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", customerList.size());
            response.put("customers", customerList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching customers with credit", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch customers"));
        }
    }

    // Get customer statistics - Admin only
    @GetMapping("/stats/overview")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getCustomerStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalActiveCustomers", customerService.getTotalActiveCustomers());
            stats.put("totalCustomers", customerService.getTotalCustomers());
            stats.put("totalCreditInSystem", customerService.getTotalCreditInSystem());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching customer statistics", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    // Helper method to convert Customer to response map
    private Map<String, Object> toCustomerResponse(Customer customer) {
        Map<String, Object> response = new HashMap<>();
        response.put("customerId", customer.getCustomerId());
        response.put("customerName", customer.getCustomerName());
        response.put("phoneNumber", customer.getPhoneNumber());
        response.put("email", customer.getEmail());
        response.put("address", customer.getAddress());
        response.put("creditBalance", customer.getCreditBalance());
        response.put("totalServiceCount", customer.getTotalServiceCount());
        response.put("isActive", customer.getIsActive());
        response.put("notes", customer.getNotes());
        response.put("createdAt", customer.getCreatedAt());
        response.put("updatedAt", customer.getUpdatedAt());
        response.put("lastVisit", customer.getLastVisit());
        return response;
    }
}