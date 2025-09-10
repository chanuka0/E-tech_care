package com.example.demo.job_card;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
public class jobController {
    @Autowired
    private jobService jobService;

    // Save a new job
   @PostMapping("/add")
    public String addJob(@RequestBody jobCard jobCard) {
        return jobService.saveJob(jobCard);
    }

    // Test endpoint
   @GetMapping("/test")
    public String test() {
        return "Job API working!";
    }
}
