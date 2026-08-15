package com.employee.management.controller;

import com.employee.management.dto.request.EmployeeRequest;
import com.employee.management.dto.response.EmployeeResponse;
import com.employee.management.entity.Role;
import com.employee.management.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // ==========================================
    // GET LOGGED-IN EMPLOYEE
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<EmployeeResponse> getMyEmployee(
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                employeeService.getMyEmployee(username)
        );
    }

    // ==========================================
    // CREATE EMPLOYEE
    // ==========================================

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employeeService.createEmployee(request));
    }

    // ==========================================
    // GET ALL EMPLOYEES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {

        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    // ==========================================
    // SEARCH / FILTER
    // ==========================================

    @GetMapping("/search")
    public ResponseEntity<List<EmployeeResponse>> searchEmployees(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Role role,

            @RequestParam(required = false)
            Boolean active,

            @RequestParam(required = false)
            Long departmentId) {

        return ResponseEntity.ok(
                employeeService.searchEmployees(
                        keyword,
                        role,
                        active,
                        departmentId
                )
        );
    }

    // ==========================================
    // GET EMPLOYEE BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                employeeService.getEmployeeById(id)
        );
    }

    // ==========================================
    // UPDATE EMPLOYEE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(
                        id,
                        request
                )
        );
    }

    // ==========================================
    // DELETE EMPLOYEE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}