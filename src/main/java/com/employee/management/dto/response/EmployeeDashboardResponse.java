package com.employee.management.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardResponse {

    private EmployeeResponse employee;

    private List<AttendanceResponse> attendance;

    private List<SalaryResponse> salaries;
}