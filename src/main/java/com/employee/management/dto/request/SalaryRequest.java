package com.employee.management.dto.request;

import com.employee.management.entity.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class SalaryRequest {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    @NotBlank(message = "Salary month is required")
    private String salaryMonth;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0", message = "Basic salary cannot be negative")
    private BigDecimal basicSalary;

    @NotNull(message = "Allowances are required")
    @DecimalMin(value = "0.0", message = "Allowances cannot be negative")
    private BigDecimal allowances;

    @NotNull(message = "Deductions are required")
    @DecimalMin(value = "0.0", message = "Deductions cannot be negative")
    private BigDecimal deductions;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private LocalDate paymentDate;
}