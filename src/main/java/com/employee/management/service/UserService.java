package com.employee.management.service;

import com.employee.management.dto.request.LoginRequest;
import com.employee.management.dto.request.UserRegistrationRequest;
import com.employee.management.dto.response.LoginResponse;
import com.employee.management.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    UserResponse register(
            UserRegistrationRequest request
    );

    LoginResponse login(
            LoginRequest request
    );

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    List<UserResponse> getAllUsers();

    // ==========================================
    // GET ALL HR USERS
    // ==========================================

    List<UserResponse> getAllHRUsers();

    UserResponse getUserById(Long id);

    UserResponse createUser(
            UserRegistrationRequest request
    );

    void deleteUser(Long id);
}