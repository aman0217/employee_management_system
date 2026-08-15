package com.employee.management.controller;

import com.employee.management.dto.response.EmployeeDashboardResponse;
import com.employee.management.dto.response.EmployeeResponse;
import com.employee.management.dto.response.AttendanceResponse;
import com.employee.management.dto.response.SalaryResponse;
import com.employee.management.entity.Employee;
import com.employee.management.entity.User;
import com.employee.management.repository.AttendanceRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.SalaryRepository;
import com.employee.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-dashboard")
@RequiredArgsConstructor
public class EmployeeDashboardController {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRepository salaryRepository;

    @GetMapping
    public ResponseEntity<EmployeeDashboardResponse> getDashboard(
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Employee employee = employeeRepository
                .findByEmail(user.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee profile not found for this user"
                        ));

        EmployeeResponse employeeResponse =
                EmployeeResponse.builder()
                        .id(employee.getId())
                        .firstName(employee.getFirstName())
                        .lastName(employee.getLastName())
                        .email(employee.getEmail())
                        .phoneNumber(employee.getPhoneNumber())
                        .joiningDate(employee.getJoiningDate())
                        .designation(employee.getDesignation())
                        .role(employee.getRole())
                        .active(employee.getActive())
                        .departmentId(
                                employee.getDepartment() != null
                                        ? employee.getDepartment().getId()
                                        : null
                        )
                        .departmentName(
                                employee.getDepartment() != null
                                        ? employee.getDepartment().getName()
                                        : null
                        )
                        .build();

        List<AttendanceResponse> attendance =
                attendanceRepository
                        .findByEmployeeId(employee.getId())
                        .stream()
                        .map(item -> AttendanceResponse.builder()
                                .id(item.getId())
                                .employeeId(employee.getId())
                                .employeeName(
                                        employee.getFirstName()
                                                + " "
                                                + employee.getLastName()
                                )
                                .attendanceDate(
                                        item.getAttendanceDate()
                                )
                                .checkIn(item.getCheckIn())
                                .checkOut(item.getCheckOut())
                                .status(item.getStatus())
                                .remarks(item.getRemarks())
                                .build()
                        )
                        .toList();

        List<SalaryResponse> salaries =
                salaryRepository
                        .findByEmployeeId(employee.getId())
                        .stream()
                        .map(item -> SalaryResponse.builder()
                                .id(item.getId())
                                .employeeId(employee.getId())
                                .employeeName(
                                        employee.getFirstName()
                                                + " "
                                                + employee.getLastName()
                                )
                                .salaryMonth(item.getSalaryMonth())
                                .basicSalary(item.getBasicSalary())
                                .allowances(item.getAllowances())
                                .deductions(item.getDeductions())
                                .netSalary(item.getNetSalary())
                                .paymentStatus(item.getPaymentStatus())
                                .paymentDate(item.getPaymentDate())
                                .build()
                        )
                        .toList();

        EmployeeDashboardResponse response =
                EmployeeDashboardResponse.builder()
                        .employee(employeeResponse)
                        .attendance(attendance)
                        .salaries(salaries)
                        .build();

        return ResponseEntity.ok(response);
    }
}