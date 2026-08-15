package com.employee.management.service;

import com.employee.management.dto.request.SalaryRequest;
import com.employee.management.dto.response.SalaryResponse;

import java.util.List;

public interface SalaryService {

    SalaryResponse createSalary(
            SalaryRequest request
    );

    List<SalaryResponse> getAllSalaries();

    SalaryResponse getSalaryById(
            Long id
    );

    List<SalaryResponse> getEmployeeSalaries(
            Long employeeId
    );

    SalaryResponse updateSalary(
            Long id,
            SalaryRequest request
    );

    void deleteSalary(
            Long id
    );
}