package com.employee.management.config;

import com.employee.management.entity.Department;
import com.employee.management.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;

    @Override
    public void run(String... args) {

        List<Department> departments = List.of(

                Department.builder()
                        .name("Human Resources")
                        .description("Manages recruitment, employees and HR activities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Information Technology")
                        .description("Manages software, systems and technology infrastructure.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Finance & Accounting")
                        .description("Manages financial records, accounts and payroll.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Sales")
                        .description("Handles sales activities and customer acquisition.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Marketing")
                        .description("Handles marketing, branding and promotional activities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Operations")
                        .description("Manages daily business operations and processes.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Customer Support")
                        .description("Provides customer assistance and support services.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Research & Development")
                        .description("Focuses on research, innovation and product development.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Administration")
                        .description("Manages administrative and organizational activities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Legal & Compliance")
                        .description("Handles legal matters and regulatory compliance.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Procurement")
                        .description("Manages purchasing, vendors and procurement activities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Quality Assurance")
                        .description("Ensures quality standards and testing processes.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Product Management")
                        .description("Manages product planning, development and strategy.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Business Development")
                        .description("Handles business growth, partnerships and opportunities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Security")
                        .description("Manages organizational security and safety activities.")
                        .active(true)
                        .build(),

                Department.builder()
                        .name("Management")
                        .description("Handles organizational leadership and management.")
                        .active(true)
                        .build()
        );

        for (Department department : departments) {

            if (!departmentRepository.existsByName(department.getName())) {
                departmentRepository.save(department);
            }
        }
    }
}