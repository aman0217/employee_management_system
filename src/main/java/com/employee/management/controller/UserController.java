package com.employee.management.controller;

import com.employee.management.dto.request.LoginRequest;
import com.employee.management.dto.request.UserRegistrationRequest;
import com.employee.management.dto.response.LoginResponse;
import com.employee.management.dto.response.UserResponse;
import com.employee.management.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ==========================================
    // REGISTER USER
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody UserRegistrationRequest request) {

        UserResponse response =
                userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // LOGIN USER
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                userService.login(request);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // GET ALL USERS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    // ==========================================
    // GET ALL HR USERS
    // ==========================================

    @GetMapping("/hr")
    public ResponseEntity<List<UserResponse>> getAllHRUsers() {

        return ResponseEntity.ok(
                userService.getAllHRUsers()
        );
    }

    // ==========================================
    // GET USER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    @PostMapping("/create")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRegistrationRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}