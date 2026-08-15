package com.employee.management.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean active;

    // Employees belonging to this department
    private List<EmployeeResponse> employees;

    // Total employees in this department
    private Integer employeeCount;
}