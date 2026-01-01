
package com.example.demo.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        if(userRepository.findByUsername(user.getUserName()).isPresent()) {
            throw new RuntimeException("User name already exists");
        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User email already exists");
        }
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.addRole("ROLE_USER");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User registerAdmin(User user) {
        if(userRepository.findByUsername(user.getUserName()).isPresent()) {
            throw new RuntimeException("User name already exists");
        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User email already exists");
        }
        user.addRole("ROLE_ADMIN");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // NEW: Delete user by ID (Only if user has ROLE_USER)
    public void deleteUserById(Integer userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User user = userOptional.get();

        // Check if user has ROLE_ADMIN
        if (user.getRoles().contains("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot delete admin users. Admin deletion is not allowed.");
        }

        // Only delete if user has ROLE_USER
        if (user.getRoles().contains("ROLE_USER")) {
            userRepository.deleteById(userId);
        } else {
            throw new RuntimeException("User does not have ROLE_USER");
        }
    }

    // NEW: Delete user by username (Only if user has ROLE_USER)
    public void deleteUserByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with username: " + username);
        }

        User user = userOptional.get();

        // Check if user has ROLE_ADMIN
        if (user.getRoles().contains("ROLE_ADMIN")) {
            throw new RuntimeException("Cannot delete admin users. Admin deletion is not allowed.");
        }

        // Only delete if user has ROLE_USER
        if (user.getRoles().contains("ROLE_USER")) {
            userRepository.delete(user);
        } else {
            throw new RuntimeException("User does not have ROLE_USER");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findByUsername(usernameOrEmail);

        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(usernameOrEmail);
        }

        User user = userOptional
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

        return new org.springframework.security.core.userdetails.User(
                user.getUserName(),
                user.getPassword(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        for(String role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        return authorities;
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> user = userRepository.findByUsername(usernameOrEmail);
        if (user.isEmpty()) {
            user = userRepository.findByEmail(usernameOrEmail);
        }
        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }
}