package com.employee.management.service.impl;

import com.employee.management.dto.request.LoginRequest;
import com.employee.management.dto.request.UserRegistrationRequest;
import com.employee.management.dto.response.LoginResponse;
import com.employee.management.dto.response.UserResponse;
import com.employee.management.entity.Role;
import com.employee.management.entity.User;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.JwtService;
import com.employee.management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ==========================================
    // REGISTER USER
    // ==========================================

    @Override
    public UserResponse register(
            UserRegistrationRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        // ONLY ONE ADMIN ALLOWED
        if (request.getRole() == Role.ADMIN
                && userRepository.existsByRole(Role.ADMIN)) {

            throw new RuntimeException(
                    "An ADMIN account already exists. " +
                            "Only one ADMIN is allowed."
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(request.getRole())
                .build();

        User savedUser =
                userRepository.save(user);

        return convertToResponse(savedUser);
    }

    // ==========================================
    // LOGIN USER
    // ==========================================

    @Override
    public LoginResponse login(
            LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid username or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid username or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getUsername(),
                        user.getRole().name()
                );

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    // ==========================================
    // GET ALL USERS
    // ==========================================

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET ALL HR USERS
    // ==========================================

    @Override
    public List<UserResponse> getAllHRUsers() {

        return userRepository
                .findByRole(Role.HR)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // GET USER BY ID
    // ==========================================

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        return convertToResponse(user);
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    @Override
    public UserResponse createUser(
            UserRegistrationRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        // ONLY ONE ADMIN ALLOWED
        if (request.getRole() == Role.ADMIN
                && userRepository.existsByRole(Role.ADMIN)) {

            throw new RuntimeException(
                    "An ADMIN account already exists. " +
                            "Only one ADMIN is allowed."
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(request.getRole())
                .build();

        User savedUser =
                userRepository.save(user);

        return convertToResponse(savedUser);
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    @Override
    public void deleteUser(Long id) {

        User user = userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        // PROTECT ADMIN ACCOUNT
        if (user.getRole() == Role.ADMIN) {

            throw new RuntimeException(
                    "ADMIN account cannot be deleted."
            );
        }

        userRepository.delete(user);
    }

    // ==========================================
    // CONVERT USER -> USER RESPONSE
    // ==========================================

    private UserResponse convertToResponse(
            User user) {

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}