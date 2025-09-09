package com.example.demo.job_card;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class job_card {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private int jobID;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private int customerNum;

    @Column(nullable = false)
    private int lapSerialNo;

    @Column(nullable = false)
    private String lapVer;

    @Column(nullable = false)
    private String jobTitle;
}
