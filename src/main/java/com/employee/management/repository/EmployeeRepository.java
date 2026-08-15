package com.employee.management.repository;

import com.employee.management.entity.Employee;
import com.employee.management.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
        JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Employee> findByDepartmentId(Long departmentId);

    List<Employee> findByRole(Role role);

    List<Employee> findByActive(Boolean active);

    List<Employee>
    findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName,
            String lastName
    );
}