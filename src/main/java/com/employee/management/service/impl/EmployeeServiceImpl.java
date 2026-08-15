package com.employee.management.service.impl;

import com.employee.management.dto.request.EmployeeRequest;
import com.employee.management.repository.SalaryRepository;
import com.employee.management.repository.AttendanceRepository;
import com.employee.management.dto.response.EmployeeResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.Role;
import com.employee.management.entity.User;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.employee.management.entity.Salary;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRepository salaryRepository;

    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    @Override
    public EmployeeResponse createEmployee(
            EmployeeRequest request) {

        // -----------------------------------------------------
        // Validate department
        // -----------------------------------------------------

        Department department =
                getDepartment(request.getDepartmentId());


        // -----------------------------------------------------
        // Validate password
        // -----------------------------------------------------

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required for new employee"
            );
        }


        // -----------------------------------------------------
        // Check username
        // -----------------------------------------------------

        String username =
                request.getUsername().trim();

        if (userRepository.existsByUsername(username)) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }


        // -----------------------------------------------------
        // Check employee email
        // -----------------------------------------------------

        String email =
                request.getEmail().trim();

        if (employeeRepository.findByEmail(email).isPresent()) {

            throw new RuntimeException(
                    "Employee with this email already exists"
            );
        }


        // -----------------------------------------------------
        // Check ADMIN restriction
        // -----------------------------------------------------

        if (request.getRole() == Role.ADMIN &&
                userRepository.existsByRole(Role.ADMIN)) {

            throw new RuntimeException(
                    "An ADMIN account already exists. " +
                            "Only one ADMIN is allowed."
            );
        }


        // -----------------------------------------------------
        // Find User by email
        //
        // Normally a new employee gets a new User.
        // But if User already exists with this email,
        // we can link that User to Employee.
        // -----------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user != null) {

            // User already has Employee profile
            if (employeeRepository.existsByUserId(
                    user.getId())) {

                throw new RuntimeException(
                        "Employee profile already exists for this user"
                );
            }

            /*
             * Existing User found.
             *
             * Username cannot be changed to another
             * existing username.
             */
            if (!user.getUsername()
                    .equalsIgnoreCase(username) &&
                    userRepository.existsByUsername(username)) {

                throw new RuntimeException(
                        "Username already exists"
                );
            }

            user.setUsername(username);
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setEmail(email);
            user.setRole(request.getRole());

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );

            user =
                    userRepository.save(user);

        } else {

            // -------------------------------------------------
            // CREATE NEW USER
            // -------------------------------------------------

            user = User.builder()
                    .firstName(
                            request.getFirstName().trim()
                    )
                    .lastName(
                            request.getLastName().trim()
                    )
                    .username(username)
                    .email(email)
                    .password(
                            passwordEncoder.encode(
                                    request.getPassword()
                            )
                    )
                    .role(request.getRole())
                    .build();

            user =
                    userRepository.save(user);
        }


        // =====================================================
        // CREATE EMPLOYEE
        // =====================================================

        Employee employee =
                Employee.builder()
                        .firstName(
                                request.getFirstName().trim()
                        )
                        .lastName(
                                request.getLastName().trim()
                        )
                        .email(email)
                        .phoneNumber(
                                request.getPhoneNumber()
                        )
                        .joiningDate(
                                request.getJoiningDate()
                        )
                        .designation(
                                request.getDesignation().trim()
                        )
                        .role(
                                request.getRole()
                        )
                        .active(
                                request.getActive()
                        )
                        .department(
                                department
                        )
                        .user(
                                user
                        )
                        .build();


        Employee savedEmployee =
                employeeRepository.save(employee);

        return mapToResponse(savedEmployee);
    }


    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(
            Long id) {

        Employee employee =
                getEmployee(id);

        return mapToResponse(employee);
    }


    // =========================================================
    // UPDATE EMPLOYEE
    // =========================================================

    @Override
    public EmployeeResponse updateEmployee(
            Long id,
            EmployeeRequest request) {

        Employee employee =
                getEmployee(id);

        Department department =
                getDepartment(
                        request.getDepartmentId()
                );


        // -----------------------------------------------------
        // Current User
        // -----------------------------------------------------

        User user =
                employee.getUser();


        if (user == null) {

            throw new RuntimeException(
                    "Employee is not linked with a User account"
            );
        }


        // -----------------------------------------------------
        // Check username change
        // -----------------------------------------------------

        String newUsername =
                request.getUsername().trim();

        if (!user.getUsername()
                .equalsIgnoreCase(newUsername)) {

            if (userRepository.existsByUsername(
                    newUsername)) {

                throw new RuntimeException(
                        "Username already exists"
                );
            }
        }


        // -----------------------------------------------------
        // Check email change
        // -----------------------------------------------------

        String newEmail =
                request.getEmail().trim();

        if (!employee.getEmail()
                .equalsIgnoreCase(newEmail)) {

            employeeRepository
                    .findByEmail(newEmail)
                    .ifPresent(existing -> {

                        if (!existing.getId()
                                .equals(id)) {

                            throw new RuntimeException(
                                    "Another employee already uses this email"
                            );
                        }
                    });

            userRepository
                    .findByEmail(newEmail)
                    .ifPresent(existingUser -> {

                        if (!existingUser.getId()
                                .equals(user.getId())) {

                            throw new RuntimeException(
                                    "Another user already uses this email"
                            );
                        }
                    });
        }


        // -----------------------------------------------------
        // ADMIN restriction
        // -----------------------------------------------------

        if (request.getRole() == Role.ADMIN &&
                user.getRole() != Role.ADMIN &&
                userRepository.existsByRole(Role.ADMIN)) {

            throw new RuntimeException(
                    "An ADMIN account already exists. " +
                            "Only one ADMIN is allowed."
            );
        }


        // =====================================================
        // UPDATE USER
        // =====================================================

        user.setFirstName(
                request.getFirstName().trim()
        );

        user.setLastName(
                request.getLastName().trim()
        );

        user.setUsername(
                newUsername
        );

        user.setEmail(
                newEmail
        );

        user.setRole(
                request.getRole()
        );


        /*
         * Password only changes when a new password
         * is actually provided.
         */
        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }


        userRepository.save(user);


        // =====================================================
        // UPDATE EMPLOYEE
        // =====================================================

        employee.setFirstName(
                request.getFirstName().trim()
        );

        employee.setLastName(
                request.getLastName().trim()
        );

        employee.setEmail(
                newEmail
        );

        employee.setPhoneNumber(
                request.getPhoneNumber()
        );

        employee.setJoiningDate(
                request.getJoiningDate()
        );

        employee.setDesignation(
                request.getDesignation().trim()
        );

        employee.setRole(
                request.getRole()
        );

        employee.setActive(
                request.getActive()
        );

        employee.setDepartment(
                department
        );


        Employee updatedEmployee =
                employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }




    // =========================================================
// DELETE EMPLOYEE
// =============================================================
    @Override
    @Transactional
    public void deleteEmployee(Long id) {

        // ---------------------------------------------------------
        // Find employee
        // ---------------------------------------------------------

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );

        // ---------------------------------------------------------
        // Store linked User before deleting Employee
        // ---------------------------------------------------------

        User user = employee.getUser();

        // ---------------------------------------------------------
        // 1. Delete Attendance records
        // ---------------------------------------------------------

        attendanceRepository.deleteByEmployeeId(id);

        // ---------------------------------------------------------
        // 2. Delete Salary records
        // ---------------------------------------------------------

        salaryRepository.deleteByEmployeeId(id);

        // ---------------------------------------------------------
        // 3. Delete Employee
        // ---------------------------------------------------------

        employeeRepository.delete(employee);

        // ---------------------------------------------------------
        // 4. Permanently delete linked User
        // ---------------------------------------------------------

        if (user != null) {
            userRepository.delete(user);
        }
    }


    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchEmployees(
            String keyword,
            Role role,
            Boolean active,
            Long departmentId) {

        Specification<Employee> specification =
                (root, query, cb) ->
                        cb.conjunction();


        // -----------------------------------------------------
        // KEYWORD
        // -----------------------------------------------------

        if (keyword != null &&
                !keyword.isBlank()) {

            String search =
                    "%" +
                            keyword.trim().toLowerCase() +
                            "%";

            specification =
                    specification.and(
                            (root, query, cb) ->
                                    cb.or(

                                            cb.like(
                                                    cb.lower(
                                                            root.get(
                                                                    "firstName"
                                                            )
                                                    ),
                                                    search
                                            ),

                                            cb.like(
                                                    cb.lower(
                                                            root.get(
                                                                    "lastName"
                                                            )
                                                    ),
                                                    search
                                            ),

                                            cb.like(
                                                    cb.lower(
                                                            root.get(
                                                                    "email"
                                                            )
                                                    ),
                                                    search
                                            ),

                                            cb.like(
                                                    cb.lower(
                                                            root.get(
                                                                    "phoneNumber"
                                                            )
                                                    ),
                                                    search
                                            ),

                                            cb.like(
                                                    cb.lower(
                                                            root.get(
                                                                    "designation"
                                                            )
                                                    ),
                                                    search
                                            )
                                    )
                    );
        }


        // -----------------------------------------------------
        // ROLE
        // -----------------------------------------------------

        if (role != null) {

            specification =
                    specification.and(
                            (root, query, cb) ->
                                    cb.equal(
                                            root.get("role"),
                                            role
                                    )
                    );
        }


        // -----------------------------------------------------
        // ACTIVE
        // -----------------------------------------------------

        if (active != null) {

            specification =
                    specification.and(
                            (root, query, cb) ->
                                    cb.equal(
                                            root.get("active"),
                                            active
                                    )
                    );
        }


        // -----------------------------------------------------
        // DEPARTMENT
        // -----------------------------------------------------

        if (departmentId != null) {

            specification =
                    specification.and(
                            (root, query, cb) ->
                                    cb.equal(
                                            root.get("department")
                                                    .get("id"),
                                            departmentId
                                    )
                    );
        }


        return employeeRepository
                .findAll(specification)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET LOGGED-IN EMPLOYEE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getMyEmployee(
            String username) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );


        Employee employee =
                employeeRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee profile not found for logged-in user"
                                )
                        );


        return mapToResponse(employee);
    }


    // =========================================================
    // GET EMPLOYEE
    // =========================================================

    private Employee getEmployee(Long id) {

        return employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );
    }


    // =========================================================
    // GET DEPARTMENT
    // =========================================================

    private Department getDepartment(
            Long departmentId) {

        if (departmentId == null) {

            throw new RuntimeException(
                    "Department is required"
            );
        }

        return departmentRepository
                .findById(departmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with id: " +
                                        departmentId
                        )
                );
    }


    // =========================================================
    // MAP EMPLOYEE -> RESPONSE
    // =========================================================

    private EmployeeResponse mapToResponse(
            Employee employee) {

        Department department =
                employee.getDepartment();

        return EmployeeResponse.builder()

                .id(
                        employee.getId()
                )

                .firstName(
                        employee.getFirstName()
                )

                .lastName(
                        employee.getLastName()
                )

                .email(
                        employee.getEmail()
                )

                .phoneNumber(
                        employee.getPhoneNumber()
                )

                .joiningDate(
                        employee.getJoiningDate()
                )

                .designation(
                        employee.getDesignation()
                )

                .role(
                        employee.getRole()
                )

                .active(
                        employee.getActive()
                )

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