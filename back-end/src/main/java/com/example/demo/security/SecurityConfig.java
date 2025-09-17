package com.example.demo.security;


import com.example.demo.users.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final UserService userService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(@Lazy UserService userService,
                          @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
                          @Lazy JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.userService = userService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/register/admin",
                                "/api/users/login",
                                "/api/users/login/user",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health"
                        ).permitAll()

                        // Admin-only endpoints
                        .requestMatchers(
//                                "/api/users/register/admin",
                                "/api/users/all",
                                "/api/laptop-brands/all",
                                "/api/laptop-brands",
                                "/api/laptop-brands/*"
                        ).hasRole("ADMIN")

                        // User endpoints (both admin and user can access)
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/laptop-brands/active",
                                "/api/job-cards",
                                "/api/job-cards/**",
                                "/api/pdf/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                );

//        http.headers(headers -> headers
//                .frameOptions().sameOrigin()
//        );

                // Special configuration for H2 console (if using H2 database)
//        http.headers(headers -> headers.frameOptions().sameOrigin());
        http.headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
 //              "http://localhost:4200",
  //             "http://localhost:8080",
                "http://localhost:5173"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

//import com.example.demo.users.UserService;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Lazy;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//import java.util.List;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
//public class SecurityConfig {
//
//    private final UserService userService;
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
//
//    public SecurityConfig(@Lazy UserService userService,
//                          @Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
//                          @Lazy JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
//        this.userService = userService;
//        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
//        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
//        return configuration.getAuthenticationManager();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder(12); // Increased strength for better security
//    }
//
//    @Bean
//    public AuthenticationProvider authenticationProvider() {
//        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//        authProvider.setUserDetailsService(userService);
//        authProvider.setPasswordEncoder(passwordEncoder());
//        return authProvider;
//    }
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//                // Configure session management for JWT
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                // Configure authorization rules
//                .authorizeHttpRequests(authz -> authz
//                        // Public endpoints - no authentication required
//                        .requestMatchers(
//                                "/api/users/register",
//                                "/api/users/register/admin",
//                                "/api/users/login",
//                                "/api/users/login/user",
//                                "/api/users/test",
//                                "/h2-console/**",        // If using H2 database
//                                "/swagger-ui/**",        // If using Swagger
//                                "/v3/api-docs/**",       // If using Swagger/OpenAPI
//                                "/actuator/health"       // If using Spring Actuator
//                        ).permitAll()
//
//                        // Admin-only endpoints
////                        .requestMatchers("/api/users/register/admin", "/api/users/all").hasRole("ADMIN")
//
//                        // Authenticated endpoints
//                        .requestMatchers("/api/users/profile").authenticated()
//
//                        // All other requests require authentication
//                        .anyRequest().authenticated()
//                )
//
//                // Add JWT authentication filter
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//
//                // Configure authentication provider
//                .authenticationProvider(authenticationProvider())
//
//                // Configure exception handling
//                .exceptionHandling(exceptions -> exceptions
//                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
//                );
//
//        // Special configuration for H2 console (if using H2 database)
////        http.headers(headers -> headers.frameOptions().sameOrigin());
//        http.headers(headers -> headers
//                .frameOptions(frameOptions -> frameOptions.sameOrigin())
//        );
//
//        return http.build();
//    }
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // Allow specific origins (update with your frontend URL)
//        configuration.setAllowedOrigins(Arrays.asList(
//                "http://localhost:3000"  // React default
////                "http://localhost:4200",  // Angular default
////                "http://localhost:8080",  // Vue.js default
////                "http://localhost:5173"   // Vite default
//        ));
//
//        // Or allow all origins (only for development)
//        // configuration.setAllowedOriginPatterns(Arrays.asList("*"));
//
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
//        configuration.setAllowedHeaders(Arrays.asList("*"));
//        configuration.setAllowCredentials(true);
//        configuration.setExposedHeaders(Arrays.asList("Authorization"));
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//}