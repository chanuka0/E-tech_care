
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