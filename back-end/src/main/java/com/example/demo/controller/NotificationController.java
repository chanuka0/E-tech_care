//package com.example.demo.controller;
//
//import com.example.demo.entity.Notification;
//import com.example.demo.entity.NotificationType;
//import com.example.demo.service.NotificationService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Log4j2
//@RestController
//@RequestMapping("/api/notifications")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
//public class NotificationController {
//
//    private final NotificationService notificationService;
//
//    /**
//     * Get all notifications for the current authenticated user
//     * GET http://localhost:8081/api/notifications
//     */
//    @GetMapping
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getAllNotifications(@RequestParam(required = false) Long userId) {
//        try {
//            // If userId is not provided, use it from parameter, otherwise get from token
//            if (userId == null) {
//                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//                log.info("Fetching notifications for user from token: {}", auth.getName());
//                // For now, we'll return all notifications if userId is not provided
//                // You may want to link users to their IDs properly
//            }
//
//            List<Notification> notifications = notificationService.getAllNotifications(userId);
//            log.info("Found {} notifications", notifications.size());
//            return ResponseEntity.ok(notifications);
//        } catch (Exception e) {
//            log.error("Error fetching notifications", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Get unread notifications for a user
//     * GET http://localhost:8081/api/notifications/unread?userId=1
//     */
//    @GetMapping("/unread")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getUnreadNotifications(@RequestParam(required = false) Long userId) {
//        try {
//            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
//            log.info("Found {} unread notifications for user {}", notifications.size(), userId);
//            return ResponseEntity.ok(notifications);
//        } catch (Exception e) {
//            log.error("Error fetching unread notifications", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Get unread notification count
//     * GET http://localhost:8081/api/notifications/unread/count?userId=1
//     */
//    @GetMapping("/unread/count")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getUnreadCount(@RequestParam(required = false) Long userId) {
//        try {
//            Long count = notificationService.getUnreadCount(userId);
//            Map<String, Object> response = new HashMap<>();
//            response.put("count", count);
//            response.put("userId", userId);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            log.error("Error fetching unread count", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Mark a notification as read
//     * PUT http://localhost:8081/api/notifications/{id}/read
//     */
//    @PutMapping("/{id}/read")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
//        try {
//            notificationService.markAsRead(id);
//            log.info("Marked notification {} as read", id);
//            return ResponseEntity.ok(Map.of("message", "Notification marked as read", "id", id));
//        } catch (Exception e) {
//            log.error("Error marking notification as read", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Mark all notifications as read for a user
//     * PUT http://localhost:8081/api/notifications/read-all?userId=1
//     */
//    @PutMapping("/read-all")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> markAllAsRead(@RequestParam(required = false) Long userId) {
//        try {
//            notificationService.markAllAsRead(userId);
//            log.info("Marked all notifications as read for user {}", userId);
//            return ResponseEntity.ok(Map.of("message", "All notifications marked as read", "userId", userId));
//        } catch (Exception e) {
//            log.error("Error marking all notifications as read", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Delete a notification
//     * DELETE http://localhost:8081/api/notifications/{id}
//     */
//    @DeleteMapping("/{id}")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
//        try {
//            notificationService.deleteNotification(id);
//            log.info("Deleted notification {}", id);
//            return ResponseEntity.ok(Map.of("message", "Notification deleted", "id", id));
//        } catch (Exception e) {
//            log.error("Error deleting notification", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Get recent notifications (last 24 hours)
//     * GET http://localhost:8081/api/notifications/recent?userId=1
//     */
//    @GetMapping("/recent")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getRecentNotifications(@RequestParam(required = false) Long userId) {
//        try {
//            LocalDateTime since = LocalDateTime.now().minusHours(24);
//            List<Notification> notifications = notificationService.getRecentNotifications(userId, since);
//            log.info("Found {} recent notifications for user {}", notifications.size(), userId);
//            return ResponseEntity.ok(notifications);
//        } catch (Exception e) {
//            log.error("Error fetching recent notifications", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Create a test notification (for testing purposes)
//     * POST http://localhost:8081/api/notifications/test
//     * Body: {"type": "LOW_STOCK", "message": "Test notification", "userId": 1}
//     */
//    @PostMapping("/test")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> createTestNotification(@RequestBody Map<String, Object> request) {
//        try {
//            NotificationType type = NotificationType.valueOf((String) request.get("type"));
//            String message = (String) request.get("message");
//            Long userId = request.get("userId") != null ?
//                    Long.valueOf(request.get("userId").toString()) : null;
//
//            Map<String, Object> payload = new HashMap<>();
//            payload.put("test", true);
//            payload.put("timestamp", LocalDateTime.now().toString());
//
//            notificationService.sendNotification(type, message, payload, userId);
//
//            log.info("Created test notification: {} - {}", type, message);
//            return ResponseEntity.ok(Map.of(
//                    "message", "Test notification created",
//                    "type", type,
//                    "content", message
//            ));
//        } catch (Exception e) {
//            log.error("Error creating test notification", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Get notifications by type
//     * GET http://localhost:8081/api/notifications/by-type?type=LOW_STOCK&isRead=false
//     */
//    @GetMapping("/by-type")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getNotificationsByType(
//            @RequestParam NotificationType type,
//            @RequestParam(required = false, defaultValue = "false") Boolean isRead) {
//        try {
//            List<Notification> notifications = notificationService.getNotificationsByType(type, isRead);
//            log.info("Found {} notifications of type {} (read={})", notifications.size(), type, isRead);
//            return ResponseEntity.ok(notifications);
//        } catch (Exception e) {
//            log.error("Error fetching notifications by type", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    /**
//     * Get notification statistics
//     * GET http://localhost:8081/api/notifications/stats?userId=1
//     */
//    @GetMapping("/stats")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<?> getNotificationStats(@RequestParam(required = false) Long userId) {
//        try {
//            Map<String, Object> stats = notificationService.getNotificationStats(userId);
//            log.info("Fetched notification stats for user {}", userId);
//            return ResponseEntity.ok(stats);
//        } catch (Exception e) {
//            log.error("Error fetching notification stats", e);
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//}


package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    // Get unread count
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.getUnreadCount());
        return ResponseEntity.ok(response);
    }

    // Mark specific notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }
}