//package com.example.demo.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "notifications")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Notification {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "type", length = 50, nullable = false)
//    private NotificationType type;
//
//    @Column(name = "message", length = 500)
//    private String message;
//
//    @Column(name = "payload", columnDefinition = "LONGTEXT")
//    private String payload;
//
//    @Column(name = "is_read", nullable = false)
//    private Boolean isRead = false;
//
//    // REMOVED: userId field - notifications are global now
//
//    @Column(name = "created_at", nullable = false)
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        if (isRead == null) {
//            isRead = false;
//        }
//    }
//}

package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_is_read", columnList = "is_read"),
        @Index(name = "idx_type", columnList = "type"),
        @Index(name = "idx_created_at_is_read", columnList = "created_at,is_read")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private NotificationType type;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "payload", columnDefinition = "LONGTEXT")
    private String payload;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // ✅ NEW: Notification severity level for visual styling
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private NotificationSeverity severity = NotificationSeverity.INFO;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
        if (severity == null) {
            severity = NotificationSeverity.INFO;
        }
    }
}