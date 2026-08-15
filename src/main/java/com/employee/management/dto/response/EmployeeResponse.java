package com.employee.management.dto.response;

import com.employee.management.entity.Role;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phoneNumber;
    private LocalDate joiningDate;
    private String designation;
    private Role role;
    private Boolean active;

    private Long departmentId;
    private String departmentName;
}