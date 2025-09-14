//package com.example.demo.dashbord;
//
//import com.example.demo.dtos.DashboardStatsResponse;
//import com.example.demo.services.DashboardService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@Log4j2
//@RestController
//@RequestMapping("/api/dashboard")
//@RequiredArgsConstructor
//public class DashboardController {
//
//    private final DashboardService dashboardService;
//
//    @GetMapping("/stats")
//    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
//        try {
//            return ResponseEntity.ok(dashboardService.getDashboardStats());
//        } catch (Exception e) {
//            log.error("Error fetching dashboard stats", e);
//            return ResponseEntity.badRequest().build();
//        }
//    }
//}
