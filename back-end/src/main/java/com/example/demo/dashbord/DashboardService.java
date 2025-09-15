//package com.example.demo.dashbord;
//
////import com.example.demo.dtos.DashboardStatsResponse;
////import com.example.demo.entities.JobStatus;
////import com.example.demo.repositories.JobCardRepository;
//import com.example.demo.job_card.JobCardRepository;
//import com.example.demo.job_card.JobStatus;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//
//@Service
//@RequiredArgsConstructor
//public class DashboardService {
//
//    private final JobCardRepository jobCardRepository;
//
//    public DashboardStatsResponse getDashboardStats() {
//        DashboardStatsResponse stats = new DashboardStatsResponse();
//
//        stats.setTotalJobCards(jobCardRepository.count());
//        stats.setPendingJobCards(jobCardRepository.findByStatus(JobStatus.PENDING).size());
//        stats.setInProgressJobCards(jobCardRepository.findByStatus(JobStatus.IN_PROGRESS).size());
//        stats.setCompletedJobCards(jobCardRepository.findByStatus(JobStatus.COMPLETED).size());
//        stats.setDeliveredJobCards(jobCardRepository.findByStatus(JobStatus.DELIVERED).size());
//
//        // Today's job cards
//        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
//        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
//        stats.setTodayJobCards(jobCardRepository.findByExpectedDeliveryDateBetween(startOfDay, endOfDay).size());
//
//        // One day service cards (you might need a custom query for this)
//        stats.setOneDayServiceCards(jobCardRepository.findAll().stream()
//                .mapToLong(jobCard -> jobCard.isOneDayService() ? 1 : 0).sum());
//
//        return stats;
//    }
//}
