package com.example.demo.security;


import com.example.demo.users.UserService;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
//import com.example.Wedding_cake_shop.services.user.UserRepository;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserService userService;
    private final JwtService JwtService;

    public JwtAuthenticationFilter(JwtService jwtService,@Lazy UserService userService) {
        this.JwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, @Nonnull HttpServletResponse response,@Nonnull FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = JwtService.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userService.loadUserByUsername(username);
                if (JwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}

//package com.example.demo.security;
//
//import com.example.demo.users.UserService;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Lazy;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    @Autowired
//    private JwtService jwtService;
//
//    @Autowired
//    @Lazy
//    private UserService userService;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        System.out.println("=== JWT Filter Debug ===");
//        System.out.println("Request URI: " + request.getRequestURI());
//        System.out.println("Request Method: " + request.getMethod());
//
//        // CRITICAL: Get Authorization header
//        final String authHeader = request.getHeader("Authorization");
//        System.out.println("Authorization Header: " + authHeader);
//
//        final String jwt;
//        final String username;
//
//        // Check if header exists and starts with "Bearer "
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            System.out.println("No valid Authorization header found");
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        // Extract JWT token (remove "Bearer " prefix)
//        jwt = authHeader.substring(7);
//        System.out.println("Extracted JWT: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
//
//        try {
//            // Extract username from token
//            username = jwtService.extractUsername(jwt);
//            System.out.println("Extracted username: " + username);
//
//            // If username is valid and no authentication exists in context
//            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                UserDetails userDetails = this.userService.loadUserByUsername(username);
//                System.out.println("Loaded user details: " + userDetails.getUsername());
//
//                // Validate token
//                if (jwtService.isTokenValid(jwt, userDetails)) {
//                    System.out.println("Token is valid!");
//
//                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                            userDetails,
//                            null,
//                            userDetails.getAuthorities()
//                    );
//
//                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                    SecurityContextHolder.getContext().setAuthentication(authToken);
//                    System.out.println("Authentication set in SecurityContext");
//                } else {
//                    System.out.println("Token validation failed!");
//                }
//            }
//        } catch (Exception e) {
//            System.out.println("JWT Filter Error: " + e.getMessage());
//            e.printStackTrace();
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}