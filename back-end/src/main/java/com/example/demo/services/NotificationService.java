////package com.example.demo.services;
//////
//////
//////
////////import com.etechcare.entity.Notification;
////////import com.etechcare.entity.NotificationType;
////////import com.etechcare.repository.NotificationRepository;
//////import com.example.demo.entity.Notification;
//////import com.example.demo.entity.NotificationType;
//////import com.example.demo.repositories.NotificationRepository;
//////import com.fasterxml.jackson.databind.ObjectMapper;
//////import lombok.RequiredArgsConstructor;
//////import org.springframework.stereotype.Service;
//////import java.time.LocalDateTime;
//////import java.util.List;
//////
//////@Service
//////@RequiredArgsConstructor
//////public class NotificationService {
//////    private final NotificationRepository notificationRepository;
//////    private final SimpMessagingTemplate messagingTemplate;
//////    private final ObjectMapper objectMapper;
//////
//////    public void sendNotification(NotificationType type, String message, Object payload) {
//////        try {
//////            Notification notification = new Notification();
//////            notification.setType(type);
//////            notification.setMessage(message);
//////            notification.setPayload(objectMapper.writeValueAsString(payload));
//////            notification.setIsRead(false);
//////            notification.setCreatedAt(LocalDateTime.now());
//////
//////            Notification saved = notificationRepository.save(notification);
//////
//////            // Send via WebSocket
//////            messagingTemplate.convertAndSend("/topic/notifications", saved);
//////        } catch (Exception e) {
//////            e.printStackTrace();
//////        }
//////    }
//////
//////    public List<Notification> getUnreadNotifications(Long userId) {
//////        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
//////    }
//////
//////    public void markAsRead(Long notificationId) {
//////        Notification notification = notificationRepository.findById(notificationId)
//////                .orElseThrow(() -> new RuntimeException("Notification not found"));
//////        notification.setIsRead(true);
//////        notificationRepository.save(notification);
//////    }
//////}
////
////
////import com.example.demo.entity.Notification;
////import com.example.demo.entity.NotificationType;
////import com.example.demo.repositories.NotificationRepository;
////import com.fasterxml.jackson.databind.ObjectMapper;
////import lombok.RequiredArgsConstructor;
////import org.springframework.messaging.simp.SimpMessagingTemplate;  // ← ADD THIS IMPORT
////import org.springframework.stereotype.Service;
////import java.time.LocalDateTime;
////import java.util.List;
////
////@Service
////@RequiredArgsConstructor
////public class NotificationService {
////    private final NotificationRepository notificationRepository;
////    private final SimpMessagingTemplate messagingTemplate;
////    private final ObjectMapper objectMapper;
////
////    public void sendNotification(NotificationType type, String message, Object payload) {
////        try {
////            Notification notification = new Notification();
////            notification.setType(type);
////            notification.setMessage(message);
////            notification.setPayload(objectMapper.writeValueAsString(payload));
////            notification.setIsRead(false);
////            notification.setCreatedAt(LocalDateTime.now());
////
////            Notification saved = notificationRepository.save(notification);
////
////            // Send via WebSocket
////            messagingTemplate.convertAndSend("/topic/notifications", saved);
////        } catch (Exception e) {
////            e.printStackTrace();
////        }
////    }
////
////    public List<Notification> getUnreadNotifications(Long userId) {
////        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
////    }
////
////    public void markAsRead(Long notificationId) {
////        Notification notification = notificationRepository.findById(notificationId)
////                .orElseThrow(() -> new RuntimeException("Notification not found"));
////        notification.setIsRead(true);
////        notificationRepository.save(notification);
////    }
////}
//
//package com.example.demo.service;
//
//import com.example.demo.entity.Notification;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.repositories.NotificationRepository;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Log4j2
//@Service
//@RequiredArgsConstructor
//public class NotificationService {
//    private final NotificationRepository notificationRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//    private final ObjectMapper objectMapper;
//
//    /**
//     * Send a notification with userId
//     */
//    public void sendNotification(NotificationType type, String message, Object payload, Long userId) {
//        try {
//            Notification notification = new Notification();
//            notification.setType(type);
//            notification.setMessage(message);
//            notification.setPayload(objectMapper.writeValueAsString(payload));
//            notification.setIsRead(false);
//            notification.setUserId(userId);
//            notification.setCreatedAt(LocalDateTime.now());
//
//            Notification saved = notificationRepository.save(notification);
//            log.info("Notification saved: {} - {}", saved.getId(), saved.getMessage());
//
//            // Send via WebSocket to specific user if userId is provided
//            if (userId != null) {
//                messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
//            } else {
//                // Broadcast to all users
//                messagingTemplate.convertAndSend("/topic/notifications", saved);
//            }
//
//            log.info("Notification sent via WebSocket");
//        } catch (Exception e) {
//            log.error("Error sending notification", e);
//        }
//    }
//
//    /**
//     * Send a notification without userId (broadcast to all)
//     */
//    public void sendNotification(NotificationType type, String message, Object payload) {
//        sendNotification(type, message, payload, null);
//    }
//
//    /**
//     * Get all notifications for a user
//     */
//    public List<Notification> getAllNotifications(Long userId) {
//        if (userId == null) {
//            return notificationRepository.findAll();
//        }
//        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
//    }
//
//    /**
//     * Get unread notifications for a user
//     */
//    public List<Notification> getUnreadNotifications(Long userId) {
//        if (userId == null) {
//            return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(null, false);
//        }
//        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
//    }
//
//    /**
//     * Get unread notification count
//     */
//    public Long getUnreadCount(Long userId) {
//        return notificationRepository.countByUserIdAndIsRead(userId, false);
//    }
//
//    /**
//     * Mark a single notification as read
//     */
//    @Transactional
//    public void markAsRead(Long notificationId) {
//        Notification notification = notificationRepository.findById(notificationId)
//                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
//        notification.setIsRead(true);
//        notificationRepository.save(notification);
//        log.info("Notification {} marked as read", notificationId);
//    }
//
//    /**
//     * Mark all notifications as read for a user
//     */
//    @Transactional
//    public void markAllAsRead(Long userId) {
//        List<Notification> unreadNotifications = getUnreadNotifications(userId);
//        unreadNotifications.forEach(notification -> notification.setIsRead(true));
//        notificationRepository.saveAll(unreadNotifications);
//        log.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
//    }
//
//    /**
//     * Delete a notification
//     */
//    @Transactional
//    public void deleteNotification(Long notificationId) {
//        notificationRepository.deleteById(notificationId);
//        log.info("Deleted notification {}", notificationId);
//    }
//
//    /**
//     * Get recent notifications since a specific date
//     */
//    public List<Notification> getRecentNotifications(Long userId, LocalDateTime since) {
//        return notificationRepository.findRecentNotifications(userId, since);
//    }
//
//    /**
//     * Get notifications by type and read status
//     */
//    public List<Notification> getNotificationsByType(NotificationType type, Boolean isRead) {
//        return notificationRepository.findByTypeAndIsRead(type, isRead);
//    }
//
//    /**
//     * Get notification statistics
//     */
//    public Map<String, Object> getNotificationStats(Long userId) {
//        Map<String, Object> stats = new HashMap<>();
//
//        List<Notification> allNotifications = getAllNotifications(userId);
//        Long unreadCount = getUnreadCount(userId);
//
//        stats.put("total", allNotifications.size());
//        stats.put("unread", unreadCount);
//        stats.put("read", allNotifications.size() - unreadCount);
//
//        // Count by type
//        Map<String, Long> typeCount = new HashMap<>();
//        for (NotificationType type : NotificationType.values()) {
//            long count = allNotifications.stream()
//                    .filter(n -> n.getType() == type)
//                    .count();
//            typeCount.put(type.name(), count);
//        }
//        stats.put("byType", typeCount);
//
//        return stats;
//    }
//
//    /**
//     * Delete old notifications (cleanup job)
//     */
//    @Transactional
//    public void deleteOldNotifications(int daysOld) {
//        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
//        notificationRepository.deleteByCreatedAtBefore(cutoffDate);
//        log.info("Deleted notifications older than {} days", daysOld);
//    }
//}

package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.NotificationType;
import com.example.demo.repositories.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // Send notification to all users
    public void sendNotification(NotificationType type, String message, Object payload) {
        try {
            Notification notification = new Notification();
            notification.setType(type);
            notification.setMessage(message);
            notification.setPayload(objectMapper.writeValueAsString(payload));
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            Notification saved = notificationRepository.save(notification);

            // Send via WebSocket to all connected clients
            messagingTemplate.convertAndSend("/topic/notifications", saved);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get all unread notifications
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsReadOrderByCreatedAtDesc(false);
    }

    // Get count of unread notifications
    public Long getUnreadCount() {
        return notificationRepository.countByIsRead(false);
    }

    // Mark notification as read (affects all users)
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);

        // Broadcast the update to all clients
        messagingTemplate.convertAndSend("/topic/notifications/read", notificationId);
    }

    // Mark all notifications as read
    public void markAllAsRead() {
        List<Notification> unreadNotifications = notificationRepository.findByIsReadOrderByCreatedAtDesc(false);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        // Broadcast to all clients
        messagingTemplate.convertAndSend("/topic/notifications/read-all", true);
    }
}