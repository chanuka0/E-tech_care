
package com.example.demo.security;

import com.example.demo.users.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
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
                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ Add this first
                        // Public endpoints - Authentication only
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/register/admin",
                                "/api/users/login",
                                "/api/users/login/user",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/ws/**"  // WebSocket (should validate JWT internally)
                        ).permitAll()

                        // Admin-only endpoints
                        .requestMatchers(
                                "/api/users/all",
                                "/api/users/admin/**",
                                "/api/brands/*/toggle-active",  // ✅ Toggle brand active/inactive
                                "/api/models/*/toggle-active",  // ✅ NEW: Toggle model active/inactive
                                "/api/model-numbers/*/activate",
                                "/api/model-numbers/*/deactivate",
                                "/api/faults/*/delete",
                                "/api/device-conditions/*/delete",
                                "/api/processors/*/delete",
                                "/api/notifications/test"
                        ).hasRole("ADMIN")

                        // All authenticated users can access these
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/users/change-password",
                                "/api/notifications/**",
                                "/api/jobcards",
                                "/api/jobcards/**",
                                "/api/invoices/**",
                                "/api/inventory/**",
                                "/api/damages/**",
                                "/api/reports/**",
                                "/api/faults",
                                "/api/faults/**",
                                "/api/brands",
                                "/api/brands/**",
                                "/api/models",
                                "/api/models/**",
                                "/api/model-numbers",
                                "/api/model-numbers/**",
                                "/api/processors",
                                "/api/processors/**",
                                "/api/device-conditions",
                                "/api/device-conditions/**",
                                "/api/expense-categories",
                                "/api/expense-categories/**",
                                "/api/service-categories",
                                "/api/service-categories/**",
                                "/api/expenses",
                                "/api/expenses/**",
                                "/api/pdf/**",
                                "/api/customers/**"
                        ).authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                );

        http.headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ GOOD: Specific origins instead of wildcard
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",        // Local development
                "https://etechcare.online",       // Your new domain
                "https://www.etechcare.online"    // Your domain with www          // Add HTTPS when deployed
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Origin"
        ));

        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // ⚠️ Add timeout for preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}