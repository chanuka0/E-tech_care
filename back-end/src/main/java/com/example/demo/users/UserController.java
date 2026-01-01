
package com.example.demo.users;

import com.example.demo.security.JwtService;
import com.example.demo.security.LoginRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Log4j2
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private final UserService userService;
    @Autowired
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public UserController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            log.info("User registered successfully: " + registeredUser.getUserName());

            Map<String, Object> response = new HashMap<>();
            response.put("userId", registeredUser.getUserId());
            response.put("userName", registeredUser.getUserName());
            response.put("email", registeredUser.getEmail());
            response.put("roles", registeredUser.getRoles());
            response.put("message", "User registered successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error registering user: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/admin")
    //@PreAuthorize("hasRole('ROLE_ADMIN')") // ***** Uncomment this after creating first admin
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        try {
            User registeredAdmin = userService.registerAdmin(user);
            log.info("Admin registered successfully: " + registeredAdmin.getUserName());

            Map<String, Object> response = new HashMap<>();
            response.put("userId", registeredAdmin.getUserId());
            response.put("userName", registeredAdmin.getUserName());
            response.put("email", registeredAdmin.getEmail());
            response.put("roles", registeredAdmin.getRoles());
            response.put("message", "Admin registered successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error registering admin: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createUserByAdmin(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            log.info("User created by admin successfully: " + registeredUser.getUserName());

            Map<String, Object> response = new HashMap<>();
            response.put("userId", registeredUser.getUserId());
            response.put("userName", registeredUser.getUserName());
            response.put("email", registeredUser.getEmail());
            response.put("roles", registeredUser.getRoles());
            response.put("message", "User created successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating user by admin: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/create-admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createAdminByAdmin(@RequestBody User user) {
        try {
            User registeredAdmin = userService.registerAdmin(user);
            log.info("Admin created by admin successfully: " + registeredAdmin.getUserName());

            Map<String, Object> response = new HashMap<>();
            response.put("userId", registeredAdmin.getUserId());
            response.put("userName", registeredAdmin.getUserName());
            response.put("email", registeredAdmin.getEmail());
            response.put("roles", registeredAdmin.getRoles());
            response.put("message", "Admin created successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating admin: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // NEW: Delete user by userId (Admin can delete only users, not admins)
    @DeleteMapping("/admin/delete-user/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUserByAdmin(@PathVariable Integer userId) {
        try {
            userService.deleteUserById(userId);
            log.info("User deleted successfully by admin. UserId: " + userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting user: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting user", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete user"));
        }
    }

    // NEW: Delete user by username (Admin can delete only users, not admins)
    @DeleteMapping("/admin/delete-user/username/{username}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUserByUsername(@PathVariable String username) {
        try {
            userService.deleteUserByUsername(username);
            log.info("User deleted successfully by admin. Username: " + username);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            response.put("username", username);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting user: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting user", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete user"));
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsersAndAdmins() {
        try {
            List<User> users = userService.getAllUsers();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("userName", user.getUserName());
                userMap.put("email", user.getEmail());
                userMap.put("roles", user.getRoles());
                return userMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", userList.size());
            response.put("users", userList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all users", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/admin/users-only")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getUsersOnly() {
        try {
            List<User> users = userService.getUsersByRole("ROLE_USER");
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("userName", user.getUserName());
                userMap.put("email", user.getEmail());
                userMap.put("roles", user.getRoles());
                return userMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", userList.size());
            response.put("users", userList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching users only", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/admin/admins-only")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminsOnly() {
        try {
            List<User> admins = userService.getUsersByRole("ROLE_ADMIN");
            List<Map<String, Object>> adminList = admins.stream().map(admin -> {
                Map<String, Object> adminMap = new HashMap<>();
                adminMap.put("userId", admin.getUserId());
                adminMap.put("userName", admin.getUserName());
                adminMap.put("email", admin.getEmail());
                adminMap.put("roles", admin.getRoles());
                return adminMap;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("totalCount", adminList.size());
            response.put("admins", adminList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching admins only", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch admins"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            log.info("Authenticated user: " + loginRequest.getUsernameOrEmail());

            final UserDetails userDetails = userService.loadUserByUsername(loginRequest.getUsernameOrEmail());
            final String jwtToken = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("username", userDetails.getUsername());
            response.put("roles", userDetails.getAuthorities());
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed for user: " + loginRequest.getUsernameOrEmail(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid username/email or password",
                    "message", "Authentication failed"
            ));
        }
    }

    @PostMapping("/login/user")
    public ResponseEntity<?> loginUserWithUserObject(@RequestBody User user) {
        try {
            String usernameOrEmail = user.getUserName() != null ? user.getUserName() : user.getEmail();

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usernameOrEmail, user.getPassword()));

            log.info("Authenticated user: " + usernameOrEmail);
            final UserDetails userDetails = userService.loadUserByUsername(usernameOrEmail);
            final String jwtToken = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("username", userDetails.getUsername());
            response.put("roles", userDetails.getAuthorities());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Authentication failed"));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("userName", user.getUserName());
                userMap.put("email", user.getEmail());
                userMap.put("roles", user.getRoles());
                return userMap;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            log.info("Fetching profile for authenticated user: " + username);

            return userService.findByUsernameOrEmail(username)
                    .map(user -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("userId", user.getUserId());
                        response.put("userName", user.getUserName());
                        response.put("email", user.getEmail());
                        response.put("roles", user.getRoles());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user profile", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch profile"));
        }
    }

    @GetMapping("/profile/{usernameOrEmail}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getUserProfileByUsername(@PathVariable String usernameOrEmail) {
        try {
            return userService.findByUsernameOrEmail(usernameOrEmail)
                    .map(user -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("userId", user.getUserId());
                        response.put("userName", user.getUserName());
                        response.put("email", user.getEmail());
                        response.put("roles", user.getRoles());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user profile", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch profile"));
        }
    }
}