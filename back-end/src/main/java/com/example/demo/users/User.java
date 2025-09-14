package com.example.demo.users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(nullable = false)
    private String userName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    public User() {
    }

    // Constructor for registration
    public User(String userName, String email, String password  ) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.roles = new HashSet<>();
    }

    public void addRole(String role) {this.roles.add(role);}

    public boolean hasRole(String role) {return this.roles.contains(role);}

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + userName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", roles='" + roles + '\'' +
                '}';
    }
}
