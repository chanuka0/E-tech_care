package com.example.demo.services;
//
//
//
////import com.etechcare.entity.Notification;
////import com.etechcare.entity.NotificationType;
////import com.etechcare.repository.NotificationRepository;
//import com.example.demo.entity.Notification;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.repositories.NotificationRepository;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class NotificationService {
//    private final NotificationRepository notificationRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//    private final ObjectMapper objectMapper;
//
//    public void sendNotification(NotificationType type, String message, Object payload) {
//        try {
//            Notification notification = new Notification();
//            notification.setType(type);
//            notification.setMessage(message);
//            notification.setPayload(objectMapper.writeValueAsString(payload));
//            notification.setIsRead(false);
//            notification.setCreatedAt(LocalDateTime.now());
//
//            Notification saved = notificationRepository.save(notification);
//
//            // Send via WebSocket
//            messagingTemplate.convertAndSend("/topic/notifications", saved);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    public List<Notification> getUnreadNotifications(Long userId) {
//        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
//    }
//
//    public void markAsRead(Long notificationId) {
//        Notification notification = notificationRepository.findById(notificationId)
//                .orElseThrow(() -> new RuntimeException("Notification not found"));
//        notification.setIsRead(true);
//        notificationRepository.save(notification);
//    }
//}


import com.example.demo.entity.Notification;
import com.example.demo.entity.NotificationType;
import com.example.demo.repositories.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;  // ← ADD THIS IMPORT
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void sendNotification(NotificationType type, String message, Object payload) {
        try {
            Notification notification = new Notification();
            notification.setType(type);
            notification.setMessage(message);
            notification.setPayload(objectMapper.writeValueAsString(payload));
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            Notification saved = notificationRepository.save(notification);

            // Send via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", saved);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}