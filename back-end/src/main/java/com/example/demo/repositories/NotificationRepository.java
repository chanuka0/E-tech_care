//package com.example.demo.repositories;
//
//
//import com.example.demo.entity.Notification;
//import com.example.demo.entity.NotificationType;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Repository
//public interface NotificationRepository extends JpaRepository<Notification, Long> {
//    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);
//
//    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
//
//    List<Notification> findByTypeAndIsRead(NotificationType type, Boolean isRead);
//
//    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
//    List<Notification> findRecentNotifications(@Param("userId") Long userId, @Param("since") LocalDateTime since);
//
//    Long countByUserIdAndIsRead(Long userId, Boolean isRead);
//
//    void deleteByCreatedAtBefore(LocalDateTime date);
//}

package com.example.demo.repositories;

import com.example.demo.entity.Notification;
import com.example.demo.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications ordered by newest first
    List<Notification> findAllByOrderByCreatedAtDesc();

    // Get unread notifications
    List<Notification> findByIsReadOrderByCreatedAtDesc(Boolean isRead);

    // Get notifications by type
    List<Notification> findByTypeAndIsReadOrderByCreatedAtDesc(NotificationType type, Boolean isRead);

    // Get recent notifications (last X hours/days)
    @Query("SELECT n FROM Notification n WHERE n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("since") LocalDateTime since);

    // Count unread notifications
    Long countByIsRead(Boolean isRead);

    // Delete old notifications
    void deleteByCreatedAtBefore(LocalDateTime date);
}