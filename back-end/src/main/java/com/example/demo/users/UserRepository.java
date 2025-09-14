package com.example.demo.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Find user by username (case-insensitive for better UX)
    @Query("SELECT u FROM User u WHERE LOWER(u.userName) = LOWER(:username)")
    Optional<User> findByUsername(@Param("username") String username);


    // Find user by email (case-insensitive for better UX)
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(@Param("email") String email);

    // Additional useful method: find by username or email in one query
    @Query("SELECT u FROM User u WHERE LOWER(u.userName) = LOWER(:usernameOrEmail) OR LOWER(u.email) = LOWER(:usernameOrEmail)")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    // Check if username exists (useful for validation)
    boolean existsByUserName(String userName);

    // Check if email exists (useful for validation)
    boolean existsByEmail(String email);

    // Find users by role (if you need this functionality)
    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles")
    List<User> findByRole(@Param("role") String role);


    // Find active users (if you have an 'active' field)
    // List<User> findByActiveTrue();

    // Find users created within a date range (if you have createdDate field)
    // @Query("SELECT u FROM User u WHERE u.createdDate BETWEEN :startDate AND :endDate")
    // List<User> findByCreatedDateBetween(@Param("startDate") LocalDateTime startDate, @Param("startDate") LocalDateTime endDate);
}