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
                        // Public endpoints - Authentication endpoints
                        .requestMatchers(
                                "/api/auth/**",           // ADD THIS - allows /api/auth/login and /api/auth/register
                                "/api/users/register",
                                "/api/users/register/admin",
                                "/api/users/login",
                                "/api/users/login/user",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/api/expenses/**",
                                "/v3/api-docs/**",
                                "/actuator/health"
                        ).permitAll()

                        // Admin-only endpoints
                        .requestMatchers(
                                "/api/users/all",
                                "/api/laptop-brands/all",
                                "/api/laptop-brands",
                                "/api/laptop-brands/*"
                        ).hasRole("ADMIN")

                        // User endpoints (both admin and user can access)
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/laptop-brands/active",
                                "/api/jobcards",
                                "/api/jobcards/**",
                                "/api/invoices/**",
                                "/api/invoices",
                                "/api/inventory/**",
                                "/api/inventory",
//                                "/api/expenses/**",
                                "/api/damages/**",
                                "/api/reports/**",
                                "/api/faults",
                                "/api/brands",          // NEW
                                "/api/brands/**",       // NEW
                                "/api/models",          // NEW
                                "/api/models/**",       // NEW
                                "/api/processors",      // NEW
                                "/api/processors/**",   // NEW
                                "/api/device-conditions",    // NEW
                                "/api/device-conditions/**", // NEW
                                "/api/pdf/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                );

        // Special configuration for H2 console (if using H2 database)
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
                "http://localhost:4200",
                "http://localhost:8080",
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

//package com.example.demo.security;
//
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
//@EnableMethodSecurity(prePostEnabled = true)
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
//        return new BCryptPasswordEncoder(12);
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
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                .authorizeHttpRequests(authz -> authz
//                        // Public endpoints - Authentication endpoints
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/api/users/register",
//                                "/api/users/register/admin",
//                                "/api/users/login",
//                                "/api/users/login/user",
//                                "/h2-console/**",
//                                "/swagger-ui/**",
//                                "/v3/api-docs/**",
//                                "/actuator/health"
//                        ).permitAll()
//
//                        // Admin-only endpoints
//                        .requestMatchers(
//                                "/api/users/all",
//                                "/api/laptop-brands/all",
//                                "/api/laptop-brands",
//                                "/api/laptop-brands/*",
//                                "/api/inventory/*/adjust-stock"  // ADDED: Only admins can adjust stock
//                        ).hasRole("ADMIN")
//
//                        // User endpoints (both admin and user can access)
//                        .requestMatchers(
//                                "/api/users/profile",
//                                "/api/laptop-brands/active",
//                                "/api/jobcards",
//                                "/api/jobcards/**",
//                                "/api/invoices/**",
//                                "/api/invoices",
//                                "/api/inventory/**",  // All inventory endpoints for authenticated users
//                                "/api/inventory",
//                                "/api/expenses/**",
//                                "/api/damages/**",
//                                "/api/reports/**",
//                                "/api/faults",
//                                "/api/faults/**",
//                                "/api/brands",
//                                "/api/brands/**",
//                                "/api/models",
//                                "/api/models/**",
//                                "/api/processors",
//                                "/api/processors/**",
//                                "/api/device-conditions",
//                                "/api/device-conditions/**",
//                                "/api/pdf/**"
//                        ).authenticated()
//
//                        .anyRequest().authenticated()
//                )
//
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                .authenticationProvider(authenticationProvider())
//                .exceptionHandling(exceptions -> exceptions
//                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
//                );
//
//        // Special configuration for H2 console (if using H2 database)
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
//        configuration.setAllowedOriginPatterns(List.of("*")); // CHANGED: Allow all origins in development
//
//        configuration.setAllowedOrigins(Arrays.asList(
//                "http://localhost:3000",
//                "http://localhost:4200",
//                "http://localhost:8080",
//                "http://localhost:5173",
//                "http://localhost:5174"  // ADDED: Additional Vite port
//        ));
//
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
//        configuration.setAllowedHeaders(Arrays.asList("*"));
//        configuration.setAllowCredentials(true);
//        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
//        configuration.setMaxAge(3600L); // ADDED: Cache preflight for 1 hour
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//}