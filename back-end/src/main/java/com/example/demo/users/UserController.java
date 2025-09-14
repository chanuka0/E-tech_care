package com.example.demo.users;

import com.example.demo.security.JwtService;
import com.example.demo.security.LoginRequest; // Import from security package
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/users")
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
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            log.error("Error registering user: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // ***** should comment this till add first admin
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        try {
            User registeredAdmin = userService.registerAdmin(user);
            log.info("Admin registered successfully: " + registeredAdmin.getUserName());
            return ResponseEntity.ok(registeredAdmin);
        } catch (Exception e) {
            log.error("Error registering admin: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile(@RequestParam String usernameOrEmail) {
        try {
            return userService.findByUsernameOrEmail(usernameOrEmail)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user profile", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch profile"));
        }
    }
}
