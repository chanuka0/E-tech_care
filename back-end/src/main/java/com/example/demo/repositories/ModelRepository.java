package com.example.demo.repositories;


import com.example.demo.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    List<Model> findByBrandId(Long brandId);
    Boolean existsByNameAndBrandId(String name, Long brandId);
}