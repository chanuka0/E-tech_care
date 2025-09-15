package com.example.demo.inventory;


import com.example.demo.inventory.dto.JobCardItemRequest;
import com.example.demo.inventory.dto.JobCardItemResponse;
//import com.example.demo.inventory.repository.InventoryItemRepository;
//import com.example.demo.inventory.repository.JobCardItemRepository;
import com.example.demo.job_card.JobCard;
import com.example.demo.job_card.JobCardRepository;
//import com.example.demo.invoice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobCardItemService {

    private final JobCardItemRepository jobCardItemRepository;
    private final JobCardRepository jobCardRepository;
    private final InventoryItemRepository inventoryRepository;
    private final InvoiceRepository invoiceRepository;
    private final InventoryService inventoryService;

    @Transactional
    public void addItemToJobCard(Long jobCardId, JobCardItemRequest request) {
        log.info("Adding item to job card id: {}", jobCardId);

        JobCard jobCard = findJobCardById(jobCardId);
        InventoryItem inventoryItem = findInventoryItemById(request.getInventoryItemId());

        // Check if sufficient stock is available
        if (inventoryItem.getStockQuantity() < request.getQuantityUsed()) {
            throw new RuntimeException("Insufficient stock for item: " + inventoryItem.getName() +
                    ". Available: " + inventoryItem.getStockQuantity() +
                    ", Required: " + request.getQuantityUsed());
        }

        // Create job card item
        JobCardItem jobCardItem = new JobCardItem();
        jobCardItem.setJobCard(jobCard);
        jobCardItem.setInventoryItem(inventoryItem);
        jobCardItem.setQuantityUsed(request.getQuantityUsed());
        jobCardItem.setUnitPrice(request.getUnitPrice());
        jobCardItem.setNotes(request.getNotes());

        jobCardItemRepository.save(jobCardItem);

        // Reduce stock
        inventoryService.reduceStock(request.getInventoryItemId(),
                request.getQuantityUsed(),
                "Used in job card: " + jobCard.getJobCardNumber(),
                jobCard.getJobCardNumber());

        log.info("Item added to job card successfully");
    }

    @Transactional
    public void addItemsToJobCard(Long jobCardId, List<JobCardItemRequest> requests) {
        log.info("Adding {} items to job card id: {}", requests.size(), jobCardId);

        for (JobCardItemRequest request : requests) {
            addItemToJobCard(jobCardId, request);
        }

        log.info("All items added to job card successfully");
    }

    @Transactional
    public void removeItemFromJobCard(Long jobCardId, Long itemId) {
        log.info("Removing item {} from job card id: {}", itemId, jobCardId);

        JobCardItem jobCardItem = jobCardItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Job card item not found"));

        if (!jobCardItem.getJobCard().getId().equals(jobCardId)) {
            throw new RuntimeException("Item does not belong to this job card");
        }

        // Return stock
        InventoryItem inventoryItem = jobCardItem.getInventoryItem();
        inventoryItem.setStockQuantity(inventoryItem.getStockQuantity() + jobCardItem.getQuantityUsed());
        inventoryRepository.save(inventoryItem);

        // Remove the item
        jobCardItemRepository.delete(jobCardItem);

        log.info("Item removed from job card successfully");
    }

    public DashboardService.EnhancedJobCardResponse getEnhancedJobCard(Long jobCardId) {
        log.debug("Fetching enhanced job card with id: {}", jobCardId);

        JobCard jobCard = findJobCardById(jobCardId);
        List<JobCardItem> items = jobCardItemRepository.findByJobCard_Id(jobCardId);

        DashboardService.EnhancedJobCardResponse response = new DashboardService.EnhancedJobCardResponse();
        // Copy basic job card fields (you'll need to implement this mapping)
        mapBasicJobCardFields(jobCard, response);

        // Add enhanced fields
        List<JobCardItemResponse> itemResponses = items.stream()
                .map(this::mapToJobCardItemResponse)
                .collect(Collectors.toList());
        response.setItems(itemResponses);

        // Calculate totals
        BigDecimal itemsTotal = items.stream()
                .map(JobCardItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setItemsTotal(itemsTotal);
        response.setGrandTotal(itemsTotal.add(response.getServiceCharge()));

        // Check if invoice exists
        boolean hasInvoice = invoiceRepository.findByJobCard_Id(jobCardId).isPresent();
        response.setHasInvoice(hasInvoice);
        if (hasInvoice) {
            response.setInvoiceId(invoiceRepository.findByJobCard_Id(jobCardId).get().getId());
        }

        return response;
    }

    public List<JobCardItemResponse> getItemsForJobCard(Long jobCardId) {
        log.debug("Fetching items for job card id: {}", jobCardId);

        return jobCardItemRepository.findByJobCard_Id(jobCardId)
                .stream()
                .map(this::mapToJobCardItemResponse)
                .collect(Collectors.toList());
    }

    // Private helper methods
    private JobCard findJobCardById(Long jobCardId) {
        return jobCardRepository.findById(jobCardId)
                .orElseThrow(() -> new RuntimeException("Job card not found with id: " + jobCardId));
    }

    private InventoryItem findInventoryItemById(Long itemId) {
        return inventoryRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + itemId));
    }

    private void mapBasicJobCardFields(JobCard jobCard, DashboardService.EnhancedJobCardResponse response) {
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
    }

    private JobCardItemResponse mapToJobCardItemResponse(JobCardItem item) {
        JobCardItemResponse response = new JobCardItemResponse();
        response.setId(item.getId());
        response.setInventoryItemId(item.getInventoryItem().getItemId());
        response.setInventoryItemName(item.getInventoryItem().getName());
        response.setQuantityUsed(item.getQuantityUsed());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        response.setNotes(item.getNotes());
        response.setAddedDate(item.getAddedDate());
        return response;
    }
}