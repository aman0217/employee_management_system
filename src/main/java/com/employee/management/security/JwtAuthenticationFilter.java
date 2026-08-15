package com.employee.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        /*
         * No JWT token
         */
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        /*
         * Validate JWT
         */
        if (token.isEmpty() ||
                !jwtService.isTokenValid(token)) {

            filterChain.doFilter(request, response);
            return;
        }

        String username =
                jwtService.extractUsername(token);

        String role =
                jwtService.extractRole(token);

        /*
         * Role must exist
         */
        if (username == null ||
                username.isBlank() ||
                role == null ||
                role.isBlank()) {

            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Normalize role.
         *
         * ADMIN      -> ROLE_ADMIN
         * HR         -> ROLE_HR
         * EMPLOYEE   -> ROLE_EMPLOYEE
         *
         * ROLE_ADMIN -> ROLE_ADMIN
         *
         * This prevents:
         * ROLE_ROLE_ADMIN
         */
        role = role.trim().toUpperCase();

        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(
                        "ROLE_" + role
                );

        /*
         * Create authenticated user
         */
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        List.of(authority)
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}