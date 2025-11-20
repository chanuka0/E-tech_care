//package com.example.demo.repositories;
//
//import com.example.demo.entity.InventorySerial;
//import com.example.demo.entity.SerialStatus;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface InventorySerialRepository extends JpaRepository<InventorySerial, Long> {
//    Optional<InventorySerial> findBySerialNumber(String serialNumber);
//
//    List<InventorySerial> findByInventoryItemId(Long itemId);
//
//    List<InventorySerial> findByInventoryItemIdAndStatus(Long itemId, SerialStatus status);
//
//    List<InventorySerial> findByStatus(SerialStatus status);
//
//    @Query("SELECT COUNT(s) FROM InventorySerial s WHERE s.inventoryItem.id = :itemId AND s.status = :status")
//    Long countByInventoryItemIdAndStatus(@Param("itemId") Long itemId, @Param("status") SerialStatus status);
//
//    Boolean existsBySerialNumber(String serialNumber);
//}

// src/main/java/com/example/demo/repositories/InventorySerialRepository.java
package com.example.demo.repositories;

import com.example.demo.entity.InventorySerial;
import com.example.demo.entity.SerialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventorySerialRepository extends JpaRepository<InventorySerial, Long> {
    Optional<InventorySerial> findBySerialNumber(String serialNumber);

    List<InventorySerial> findByInventoryItemId(Long itemId);

    List<InventorySerial> findByInventoryItemIdAndStatus(Long itemId, SerialStatus status);

    List<InventorySerial> findByStatus(SerialStatus status);

    @Query("SELECT COUNT(s) FROM InventorySerial s WHERE s.inventoryItem.id = :itemId AND s.status = :status")
    Long countByInventoryItemIdAndStatus(@Param("itemId") Long itemId, @Param("status") SerialStatus status);

    Boolean existsBySerialNumber(String serialNumber);

    // Find serials by reference (job card or invoice)
    List<InventorySerial> findByUsedInReferenceTypeAndUsedInReferenceId(String referenceType, Long referenceId);

    // Find USED serials by job card
    List<InventorySerial> findByUsedInReferenceTypeAndUsedInReferenceIdAndStatus(String referenceType, Long referenceId, SerialStatus status);
}