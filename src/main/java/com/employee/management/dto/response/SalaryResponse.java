package com.employee.management.dto.response;

import com.employee.management.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String salaryMonth;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private PaymentStatus paymentStatus;
    private LocalDate paymentDate;
}