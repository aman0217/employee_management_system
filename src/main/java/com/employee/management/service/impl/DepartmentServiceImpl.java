package com.employee.management.service.impl;

import com.employee.management.dto.request.DepartmentRequest;
import com.employee.management.dto.response.DepartmentResponse;
import com.employee.management.dto.response.EmployeeResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    // ==========================================
    // CREATE DEPARTMENT
    // ==========================================

    @Override
    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException(
                    "Department already exists"
            );
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive())
                .build();

        Department savedDepartment =
                departmentRepository.save(department);

        return mapToResponse(savedDepartment);
    }

    // ==========================================
    // GET ALL DEPARTMENTS
    // ==========================================

    @Override
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ==========================================
    // GET DEPARTMENT BY ID
    // ==========================================

    @Override
    public DepartmentResponse getDepartmentById(Long id) {

        Department department =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                )
                        );

        return mapToResponse(department);
    }

    // ==========================================
    // UPDATE DEPARTMENT
    // ==========================================

    @Override
    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        Department department =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                )
                        );

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setActive(request.getActive());

        Department updatedDepartment =
                departmentRepository.save(department);

        return mapToResponse(updatedDepartment);
    }

    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    @Override
    public void deleteDepartment(Long id) {

        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Department not found"
            );
        }

        departmentRepository.deleteById(id);
    }

    // ==========================================
    // MAP DEPARTMENT TO RESPONSE
    // ==========================================

    private DepartmentResponse mapToResponse(
            Department department) {

        List<EmployeeResponse> employees =
                employeeRepository
                        .findByDepartmentId(department.getId())
                        .stream()
                        .map(this::mapEmployeeToResponse)
                        .toList();

        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .active(department.getActive())
                .employees(employees)
                .employeeCount(employees.size())
                .build();
    }

    // ==========================================
    // MAP EMPLOYEE TO RESPONSE
    // ==========================================

    private EmployeeResponse mapEmployeeToResponse(
            Employee employee) {

        Department department =
                employee.getDepartment();

        return EmployeeResponse.builder()
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
                        department != null
                                ? department.getId()
                                : null
                )
                .departmentName(
                        department != null
                                ? department.getName()
                                : null
                )
                .build();
    }
}