package com.employee.management.service.impl;

import com.employee.management.dto.request.SalaryRequest;
import com.employee.management.dto.response.SalaryResponse;
import com.employee.management.entity.Employee;
import com.employee.management.entity.Salary;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.SalaryRepository;
import com.employee.management.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl
        implements SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;

    // =========================================================
    // CREATE SALARY
    // =========================================================

    @Override
    public SalaryResponse createSalary(
            SalaryRequest request) {

        if (
                salaryRepository
                        .existsByEmployeeIdAndSalaryMonth(
                                request.getEmployeeId(),
                                request.getSalaryMonth()
                        )
        ) {
            throw new RuntimeException(
                    "Salary already exists for this employee and month"
            );
        }

        Employee employee =
                getEmployee(
                        request.getEmployeeId()
                );

        BigDecimal netSalary =
                calculateNetSalary(request);

        Salary salary =
                Salary.builder()
                        .employee(employee)
                        .salaryMonth(
                                request.getSalaryMonth()
                        )
                        .basicSalary(
                                request.getBasicSalary()
                        )
                        .allowances(
                                request.getAllowances()
                        )
                        .deductions(
                                request.getDeductions()
                        )
                        .netSalary(
                                netSalary
                        )
                        .paymentStatus(
                                request.getPaymentStatus()
                        )
                        .paymentDate(
                                request.getPaymentDate()
                        )
                        .build();

        Salary savedSalary =
                salaryRepository.save(
                        salary
                );

        return mapToResponse(
                savedSalary
        );
    }

    // =========================================================
    // GET ALL SALARIES
    // =========================================================

    @Override
    public List<SalaryResponse>
    getAllSalaries() {

        return salaryRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    public SalaryResponse
    getSalaryById(Long id) {

        return mapToResponse(
                getSalary(id)
        );
    }

    // =========================================================
    // GET EMPLOYEE SALARIES
    // =========================================================

    @Override
    public List<SalaryResponse>
    getEmployeeSalaries(
            Long employeeId) {

        if (
                !employeeRepository
                        .existsById(employeeId)
        ) {
            throw new RuntimeException(
                    "Employee not found"
            );
        }

        return salaryRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public SalaryResponse updateSalary(
            Long id,
            SalaryRequest request) {

        Salary salary =
                getSalary(id);

        Employee employee =
                getEmployee(
                        request.getEmployeeId()
                );

        BigDecimal netSalary =
                calculateNetSalary(request);

        salary.setEmployee(employee);

        salary.setSalaryMonth(
                request.getSalaryMonth()
        );

        salary.setBasicSalary(
                request.getBasicSalary()
        );

        salary.setAllowances(
                request.getAllowances()
        );

        salary.setDeductions(
                request.getDeductions()
        );

        salary.setNetSalary(
                netSalary
        );

        salary.setPaymentStatus(
                request.getPaymentStatus()
        );

        salary.setPaymentDate(
                request.getPaymentDate()
        );

        Salary updatedSalary =
                salaryRepository.save(
                        salary
                );

        return mapToResponse(
                updatedSalary
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteSalary(Long id) {

        if (
                !salaryRepository
                        .existsById(id)
        ) {
            throw new RuntimeException(
                    "Salary not found"
            );
        }

        salaryRepository.deleteById(id);
    }

    // =========================================================
    // CALCULATE NET SALARY
    // =========================================================

    private BigDecimal calculateNetSalary(
            SalaryRequest request) {

        return request.getBasicSalary()
                .add(
                        request.getAllowances()
                )
                .subtract(
                        request.getDeductions()
                );
    }

    // =========================================================
    // GET EMPLOYEE
    // =========================================================

    private Employee getEmployee(
            Long employeeId) {

        return employeeRepository
                .findById(employeeId)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                );
    }

    // =========================================================
    // GET SALARY
    // =========================================================

    private Salary getSalary(
            Long id) {

        return salaryRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Salary not found"
                                )
                );
    }

    // =========================================================
    // MAP ENTITY -> RESPONSE
    // =========================================================

    private SalaryResponse mapToResponse(
            Salary salary) {

        Employee employee =
                salary.getEmployee();

        return SalaryResponse.builder()

                .id(
                        salary.getId()
                )

                .employeeId(
                        employee != null
                                ? employee.getId()
                                : null
                )

                .employeeName(
                        employee != null
                                ? employee.getFirstName()
                                + " "
                                + employee.getLastName()
                                : null
                )

                .salaryMonth(
                        salary.getSalaryMonth()
                )

                .basicSalary(
                        salary.getBasicSalary()
                )

                .allowances(
                        salary.getAllowances()
                )

                .deductions(
                        salary.getDeductions()
                )

                .netSalary(
                        salary.getNetSalary()
                )

                .paymentStatus(
                        salary.getPaymentStatus()
                )

                .paymentDate(
                        salary.getPaymentDate()
                )

                .build();
    }
}