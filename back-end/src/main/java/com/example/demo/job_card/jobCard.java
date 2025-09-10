package com.example.demo.job_card;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class jobCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int jobID;

   @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private int customerNo;

    @Column(nullable = false)
    private int lapSerialNo;

    @Column(nullable = false)
    private String lapVertion;

    @Column()
    private String jobTitle;

    @Column()
    private String specialNote;

    @Column(nullable = false)
    private int Advance;
}
