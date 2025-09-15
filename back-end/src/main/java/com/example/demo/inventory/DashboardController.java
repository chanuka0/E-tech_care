package com.example.demo.inventory;

//import com.example.demo.dashboard.dto.DashboardSummaryResponse;
//import com.example.demo.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            DashboardSummaryResponse response = dashboardService.getDashboardSummary();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching dashboard summary", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
