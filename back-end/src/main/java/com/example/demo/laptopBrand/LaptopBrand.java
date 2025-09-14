package com.example.demo.laptopBrand;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "laptop_brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LaptopBrand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customer name cannot be blank") // Rejects null and ""
    @Column(unique = true, nullable = false)
    private String brandName;

    @Column(length = 500)
    private String description;

    private boolean active = true;

    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime updatedDate = LocalDateTime.now();

    @Data
    public static class LaptopBrandResponse {
        private Long id;
        private String brandName;
        private String description;
        private boolean active;
        private LocalDateTime createdDate;
    }
}