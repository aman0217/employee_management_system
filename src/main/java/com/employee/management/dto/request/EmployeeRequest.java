package com.employee.management.dto.request;

import com.employee.management.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Email is required")
    private String email;

    /*
     * Password is checked manually in service.
     * This keeps update working even when password is left blank.
     */
    private String password;

    private String phoneNumber;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Active status is required")
    private Boolean active;

    @NotNull(message = "Department is required")
    private Long departmentId;
}