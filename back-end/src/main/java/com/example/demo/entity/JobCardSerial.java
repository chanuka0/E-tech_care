//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "job_card_serials")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class JobCardSerial {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "job_card_id")
//    private JobCard jobCard;
//
//    private String serialType; // IMEI, SERIAL_NUMBER, MODEL_NUMBER
//    private String serialValue;
//}

package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_card_id", nullable = false)
    @JsonIgnore  // Prevents infinite loop in JSON serialization
    private JobCard jobCard;

    private String serialType; // IMEI, SERIAL_NUMBER, MODEL_NUMBER
    private String serialValue;

    // Constructor without jobCard (useful for creating new serials)
    public JobCardSerial(String serialType, String serialValue) {
        this.serialType = serialType;
        this.serialValue = serialValue;
    }
}