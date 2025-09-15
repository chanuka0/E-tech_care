package com.example.demo.job_card;



//import com.example.demo.dtos.*;
//import com.example.demo.entities.*;
//import com.example.demo.repositories.*;
import com.example.demo.inventory.StockMovementRepository;
import com.example.demo.job_card.dto.JobCardResponse;
import com.example.demo.laptopBrand.LaptopBrand;
import com.example.demo.laptopBrand.LaptopBrandRepository;
import com.example.demo.users.User;
import com.example.demo.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCardService {

    private final JobCardRepository jobCardRepository;
    private final LaptopBrandRepository laptopBrandRepository;
    private final UserRepository userRepository;

    public List<JobCardResponse> getAllJobCards() {
        return jobCardRepository.findAllOrderByIdDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobCardResponse> getJobCardsByUser() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jobCardRepository.findByCreatedBy_UserId(user.getUserId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobCardResponse createJobCard(StockMovementRepository.EnhancedJobCardResponse.JobCardCreateRequest request) {
        // Validate serial number uniqueness
        if (jobCardRepository.findBySerialNumberIgnoreCase(request.getSerialNumber()).isPresent()) {
            throw new RuntimeException("Serial number already exists");
        }

        // Get laptop brand
        LaptopBrand brand = laptopBrandRepository.findById(request.getLaptopBrandId())
                .orElseThrow(() -> new RuntimeException("Laptop brand not found"));

        // Get current user
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobCard jobCard = new JobCard();
        jobCard.setJobCardNumber(generateJobCardNumber());
        jobCard.setCustomerName(request.getCustomerName());
        jobCard.setContactNumber(request.getContactNumber());
        jobCard.setSerialNumber(request.getSerialNumber());
        jobCard.setSpecialNote(request.getSpecialNote());
        jobCard.setWithCharger(request.isWithCharger());
        jobCard.setLaptopBrand(brand);
        jobCard.setOneDayService(request.isOneDayService());
        jobCard.setAdvanceGiven(request.isAdvanceGiven());
        jobCard.setAdvanceAmount(request.getAdvanceAmount());
        jobCard.setTotalAmount(request.getTotalAmount());
        jobCard.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        jobCard.setCreatedBy(user);

        JobCard savedJobCard = jobCardRepository.save(jobCard);
        return mapToResponse(savedJobCard);
    }

    public JobCardResponse updateJobCard(Long id, JobCardUpdateRequest request) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));

        // Get laptop brand if changed
        if (request.getLaptopBrandId() != null) {
            LaptopBrand brand = laptopBrandRepository.findById(request.getLaptopBrandId())
                    .orElseThrow(() -> new RuntimeException("Laptop brand not found"));
            jobCard.setLaptopBrand(brand);
        }

        if (request.getCustomerName() != null) jobCard.setCustomerName(request.getCustomerName());
        if (request.getContactNumber() != null) jobCard.setContactNumber(request.getContactNumber());
        if (request.getSpecialNote() != null) jobCard.setSpecialNote(request.getSpecialNote());
        jobCard.setWithCharger(request.isWithCharger());
        jobCard.setOneDayService(request.isOneDayService());
        jobCard.setAdvanceGiven(request.isAdvanceGiven());
        if (request.getAdvanceAmount() != null) jobCard.setAdvanceAmount(request.getAdvanceAmount());
        if (request.getTotalAmount() != null) jobCard.setTotalAmount(request.getTotalAmount());
        if (request.getStatus() != null) jobCard.setStatus(request.getStatus());
        if (request.getExpectedDeliveryDate() != null) jobCard.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        if (request.getActualDeliveryDate() != null) jobCard.setActualDeliveryDate(request.getActualDeliveryDate());

        JobCard savedJobCard = jobCardRepository.save(jobCard);
        return mapToResponse(savedJobCard);
    }

    public JobCardResponse getJobCard(Long id) {
        JobCard jobCard = jobCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
        return mapToResponse(jobCard);
    }

    public JobCardResponse getJobCardByNumber(String jobCardNumber) {
        JobCard jobCard = jobCardRepository.findByJobCardNumber(jobCardNumber)
                .orElseThrow(() -> new RuntimeException("Job card not found"));
        return mapToResponse(jobCard);
    }

    public List<JobCardResponse> searchJobCards(String customerName, String contact) {
        return jobCardRepository.findByCustomerNameOrContact(customerName, contact)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobCardResponse> getJobCardsByStatus(JobStatus status) {
        return jobCardRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String generateJobCardNumber() {
        Integer maxNumber = jobCardRepository.findMaxJobCardNumber();
        if (maxNumber == null) {
            maxNumber = 0;
        }
        return String.format("JOB%06d", maxNumber + 1);
    }

    private JobCardResponse mapToResponse(JobCard jobCard) {
        JobCardResponse response = new JobCardResponse();
        response.setId(jobCard.getId());
        response.setJobCardNumber(jobCard.getJobCardNumber());
        response.setCustomerName(jobCard.getCustomerName());
        response.setContactNumber(jobCard.getContactNumber());
        response.setSerialNumber(jobCard.getSerialNumber());
        response.setSpecialNote(jobCard.getSpecialNote());
        response.setWithCharger(jobCard.isWithCharger());
        response.setLaptopBrandName(jobCard.getLaptopBrand().getBrandName());
        response.setOneDayService(jobCard.isOneDayService());
        response.setAdvanceGiven(jobCard.isAdvanceGiven());
        response.setAdvanceAmount(jobCard.getAdvanceAmount());
        response.setTotalAmount(jobCard.getTotalAmount());
        response.setStatus(jobCard.getStatus());
        response.setStatusDisplayName(jobCard.getStatus().getDisplayName());
        response.setExpectedDeliveryDate(jobCard.getExpectedDeliveryDate());
        response.setActualDeliveryDate(jobCard.getActualDeliveryDate());
        response.setCreatedByUsername(jobCard.getCreatedBy().getUserName());
        response.setCreatedDate(jobCard.getCreatedDate());
        response.setUpdatedDate(jobCard.getUpdatedDate());
        return response;
    }
}
