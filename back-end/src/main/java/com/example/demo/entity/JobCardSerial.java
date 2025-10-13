package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_card_serials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCardSerial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_card_id")
    private JobCard jobCard;

    private String serialType; // IMEI, SERIAL_NUMBER, MODEL_NUMBER
    private String serialValue;
}