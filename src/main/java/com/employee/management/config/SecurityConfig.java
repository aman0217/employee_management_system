package com.employee.management.config;

import com.employee.management.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "https://employee-management-frontend-5nbn.onrender.com"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                .csrf(AbstractHttpConfigurer::disable)

                // =================================================
                // CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // =================================================
                // SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // CORS PREFLIGHT
                        // =================================================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // =================================================
                        // LOGIN
                        // =================================================

                        .requestMatchers(
                                "/api/users/login"
                        ).permitAll()

                        // =================================================
                        // REGISTRATION
                        // =================================================

                        .requestMatchers(
                                "/api/users/register"
                        ).permitAll()

                        // =================================================
                        // USER MANAGEMENT
                        // ADMIN ONLY
                        // =================================================

                        .requestMatchers(
                                "/api/users",
                                "/api/users/",
                                "/api/users/{id}",
                                "/api/users/create"
                        ).hasAuthority("ROLE_ADMIN")

                        // =================================================
                        // LOGGED-IN EMPLOYEE PROFILE
                        // =================================================

                        .requestMatchers(
                                "/api/employees/me"
                        ).authenticated()

                        // =================================================
                        // EMPLOYEE MANAGEMENT
                        // ADMIN + HR
                        // =================================================

                        .requestMatchers(
                                "/api/employees/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR"
                        )

                        // =================================================
                        // DEPARTMENT MANAGEMENT
                        // ADMIN + HR
                        // =================================================

                        .requestMatchers(
                                "/api/departments/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR"
                        )

                        // =================================================
                        // PERSONAL ATTENDANCE
                        // ADMIN + HR + EMPLOYEE
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/attendance/employee/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR",
                                "ROLE_EMPLOYEE"
                        )

                        // =================================================
                        // OTHER ATTENDANCE
                        // ADMIN + HR
                        // =================================================

                        .requestMatchers(
                                "/api/attendance/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR"
                        )

                        // =================================================
                        // PERSONAL SALARY
                        // ADMIN + HR + EMPLOYEE
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/salaries/employee/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR",
                                "ROLE_EMPLOYEE"
                        )

                        // =================================================
                        // OTHER SALARY
                        // ADMIN + HR
                        // =================================================

                        .requestMatchers(
                                "/api/salaries/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_HR"
                        )

                        // =================================================
                        // EMPLOYEE DASHBOARD
                        // =================================================

                        .requestMatchers(
                                "/api/employee-dashboard"
                        ).authenticated()

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest().authenticated()
                )

                // =================================================
                // JWT FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}