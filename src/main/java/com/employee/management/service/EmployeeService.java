package com.employee.management.service;

import com.employee.management.dto.request.EmployeeRequest;
import com.employee.management.dto.response.EmployeeResponse;
import com.employee.management.entity.Role;

import java.util.List;

public interface EmployeeService {

    // ==========================================
    // CREATE EMPLOYEE
    // ==========================================

    EmployeeResponse createEmployee(
            EmployeeRequest request
    );

    // ==========================================
    // GET ALL EMPLOYEES
    // ==========================================

    List<EmployeeResponse> getAllEmployees();

    // ==========================================
    // GET EMPLOYEE BY ID
    // ==========================================

    EmployeeResponse getEmployeeById(
            Long id
    );

    // ==========================================
    // UPDATE EMPLOYEE
    // ==========================================

    EmployeeResponse updateEmployee(
            Long id,
            EmployeeRequest request
    );

    // ==========================================
    // DELETE EMPLOYEE
    // ==========================================

    void deleteEmployee(
            Long id
    );

    // ==========================================
    // SEARCH / FILTER
    // ==========================================

    List<EmployeeResponse> searchEmployees(
            String keyword,
            Role role,
            Boolean active,
            Long departmentId
    );

    // ==========================================
    // GET LOGGED-IN EMPLOYEE
    // ==========================================

    EmployeeResponse getMyEmployee(
            String username
    );
}