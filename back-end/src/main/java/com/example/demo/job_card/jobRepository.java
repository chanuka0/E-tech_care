package com.example.demo.job_card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface jobRepository extends JpaRepository<jobCard,Integer> {

}
