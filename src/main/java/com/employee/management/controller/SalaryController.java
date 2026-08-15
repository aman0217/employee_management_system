package com.employee.management.controller;

import com.employee.management.dto.request.SalaryRequest;
import com.employee.management.dto.response.SalaryResponse;
import com.employee.management.service.SalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    // =========================================================
    // CREATE SALARY
    // ADMIN + HR ONLY
    // =========================================================

    @PostMapping
    public ResponseEntity<SalaryResponse> createSalary(
            @Valid @RequestBody SalaryRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        salaryService.createSalary(
                                request
                        )
                );
    }

    // =========================================================
    // GET ALL SALARIES
    // ADMIN + HR ONLY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<SalaryResponse>>
    getAllSalaries() {

        return ResponseEntity.ok(
                salaryService.getAllSalaries()
        );
    }

    // =========================================================
    // GET SALARY BY ID
    // ADMIN + HR ONLY
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<SalaryResponse>
    getSalaryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                salaryService.getSalaryById(id)
        );
    }

    // =========================================================
    // GET EMPLOYEE SALARIES
    // ADMIN + HR + EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SalaryResponse>>
    getEmployeeSalaries(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                salaryService.getEmployeeSalaries(
                        employeeId
                )
        );
    }

    // =========================================================
    // UPDATE SALARY
    // ADMIN + HR ONLY
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<SalaryResponse>
    updateSalary(
            @PathVariable Long id,
            @Valid @RequestBody SalaryRequest request) {

        return ResponseEntity.ok(
                salaryService.updateSalary(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // DELETE SALARY
    // ADMIN + HR ONLY
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalary(
            @PathVariable Long id) {

        salaryService.deleteSalary(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}