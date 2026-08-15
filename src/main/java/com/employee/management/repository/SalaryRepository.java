package com.employee.management.repository;

import com.employee.management.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    List<Salary> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndSalaryMonth(
            Long employeeId,
            String salaryMonth
    );

    void deleteByEmployeeId(Long employeeId);
}