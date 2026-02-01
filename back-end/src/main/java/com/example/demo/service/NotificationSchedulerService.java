package com.example.demo.service;

import com.example.demo.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * ✅ NOTIFICATION SCHEDULER SERVICE
 *
 * Only deletes all notifications daily at 11:59 PM
 */
@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {

    private final NotificationRepository notificationRepository;

    /**
     * ✅ DELETE ALL NOTIFICATIONS DAILY AT 11:59 PM
     *
     * Cron: "0 59 23 * * *" = 11:59 PM every day
     */
    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void deleteAllNotificationsDaily() {
        try {
            long count = notificationRepository.count();

            if (count > 0) {
                notificationRepository.deleteAll();
                System.out.println("═══════════════════════════════════════════════════════════");
                System.out.println("🗑️  DAILY NOTIFICATION CLEANUP [11:59 PM]");
                System.out.println("    Deleted: " + count + " notifications");
                System.out.println("    Time: " + LocalDateTime.now());
                System.out.println("═══════════════════════════════════════════════════════════");
            } else {
                System.out.println("ℹ️  [11:59 PM] No notifications to delete at " + LocalDateTime.now());
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR during daily notification cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }
}