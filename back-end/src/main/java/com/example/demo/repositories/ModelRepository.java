



package com.example.demo.repositories;

import com.example.demo.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {

    @Query("SELECT m FROM Model m WHERE m.isActive = true ORDER BY m.modelName")
    List<Model> findAllActive();

    @Query("SELECT m FROM Model m WHERE m.brand.id = :brandId AND m.isActive = true ORDER BY m.modelName")
    List<Model> findByBrandId(@Param("brandId") Long brandId);

    Model findByModelName(String modelName);

    @Query("SELECT m FROM Model m WHERE m.brand.id = :brandId AND m.modelName = :modelName")
    Model findByBrandIdAndModelName(@Param("brandId") Long brandId, @Param("modelName") String modelName);

    long countByBrandId(Long id);
}