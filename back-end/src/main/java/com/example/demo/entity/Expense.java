package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ExpenseCategory category;

    private Double amount;
    private String description;
    private LocalDateTime expenseDate;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Long createdBy;
    private LocalDateTime createdAt;
}
