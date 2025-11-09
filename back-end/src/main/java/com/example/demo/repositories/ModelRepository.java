package com.example.demo.repositories;

import com.example.demo.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    @Query("SELECT m FROM Model m WHERE m.isActive = true ORDER BY m.modelName")
    List<Model> findAllActive();

    Model findByModelName(String modelName);
}