package com.example.demo.repositories;

import com.example.demo.entity.UsedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsedItemRepository extends JpaRepository<UsedItem, Long> {
    List<UsedItem> findByJobCardId(Long jobCardId);
}
