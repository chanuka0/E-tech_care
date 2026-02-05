package com.example.demo.service;

import com.example.demo.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * DELETE ALL NOTIFICATIONS DAILY AT 11:59 PM
     * Cron: "0 59 23 * * *" = 11:59 PM every day
     */
    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void deleteAllNotificationsDaily() {
        try {
            long count = notificationRepository.count();

            if (count > 0) {
                notificationRepository.deleteAll();

                // Notify frontend clients to clear their notifications
                messagingTemplate.convertAndSend("/topic/notifications/clear-all", true);

                System.out.println("═══════════════════════════════════════════════════════════");
                System.out.println("🗑️  DAILY NOTIFICATION CLEANUP [11:59 PM]");
                System.out.println("    Deleted: " + count + " notifications");
                System.out.println("    Time: " + LocalDateTime.now().format(TIME_FORMATTER));
                System.out.println("═══════════════════════════════════════════════════════════");
            } else {
                System.out.println("ℹ️  [11:59 PM] No notifications to delete at " + LocalDateTime.now().format(TIME_FORMATTER));
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR during daily notification cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * TESTING ONLY: Delete notifications every minute
     * UNCOMMENT THIS FOR TESTING, THEN COMMENT OUT AFTER TESTING!
     */
//     @Scheduled(cron = "0 * * * * *")
//     @Transactional
//     public void testDeleteNotifications() {
//         System.out.println("🧪 TEST: Deleting notifications at " + LocalDateTime.now().format(TIME_FORMATTER));
//         deleteAllNotificationsDaily();
//     }
}