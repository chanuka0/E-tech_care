package com.example.demo.job_card;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class jobService {

    @Autowired
    private jobRepository jobRepository;

    public String saveJob(jobCard jobCard) {
        jobRepository.save(jobCard);
        return "Job saved successfully!";
    }
}
