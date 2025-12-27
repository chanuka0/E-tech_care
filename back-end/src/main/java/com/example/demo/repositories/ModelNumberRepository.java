//package com.example.demo.repositories;
//
//import com.example.demo.entity.ModelNumber;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//
//@Repository
//public interface ModelNumberRepository extends JpaRepository<ModelNumber, Long> {
//
//    @Query("SELECT mn FROM ModelNumber mn WHERE mn.isActive = true ORDER BY mn.modelNumber")
//    List<ModelNumber> findAllActive();
//
//    @Query("SELECT mn FROM ModelNumber mn WHERE mn.model.id = :modelId AND mn.isActive = true ORDER BY mn.modelNumber")
//    List<ModelNumber> findByModelId(@Param("modelId") Long modelId);
//
//    @Query("SELECT mn FROM ModelNumber mn WHERE mn.model.brand.id = :brandId AND mn.isActive = true ORDER BY mn.modelNumber")
//    List<ModelNumber> findByBrandId(@Param("brandId") Long brandId);
//
//    List<ModelNumber> findByModelNumberContainingIgnoreCase(String modelNumber);
//
//    long countByModelId(Long modelId);
//}





package com.example.demo.repositories;

import com.example.demo.entity.ModelNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModelNumberRepository extends JpaRepository<ModelNumber, Long> {

    @Query("SELECT mn FROM ModelNumber mn WHERE mn.isActive = true ORDER BY mn.modelNumber")
    List<ModelNumber> findAllActive();

    @Query("SELECT mn FROM ModelNumber mn WHERE mn.model.id = :modelId AND mn.isActive = true ORDER BY mn.modelNumber")
    List<ModelNumber> findByModelId(@Param("modelId") Long modelId);

    @Query("SELECT mn FROM ModelNumber mn WHERE mn.model.brand.id = :brandId AND mn.isActive = true ORDER BY mn.modelNumber")
    List<ModelNumber> findByBrandId(@Param("brandId") Long brandId);

    List<ModelNumber> findByModelNumberContainingIgnoreCase(String modelNumber);

    long countByModelId(Long modelId);

    // Check if model number already exists for a specific model
    @Query("SELECT mn FROM ModelNumber mn WHERE mn.modelNumber = :modelNumber AND mn.model.id = :modelId")
    Optional<ModelNumber> findByModelNumberAndModelId(@Param("modelNumber") String modelNumber, @Param("modelId") Long modelId);

    // Check if exists excluding a specific ID (for updates)
    @Query("SELECT mn FROM ModelNumber mn WHERE mn.modelNumber = :modelNumber AND mn.model.id = :modelId AND mn.id != :excludeId")
    Optional<ModelNumber> findByModelNumberAndModelIdExcludingId(@Param("modelNumber") String modelNumber, @Param("modelId") Long modelId, @Param("excludeId") Long excludeId);
}