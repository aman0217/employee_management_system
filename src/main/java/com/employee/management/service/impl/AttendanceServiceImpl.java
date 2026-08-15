package com.employee.management.service.impl;

import com.employee.management.dto.request.AttendanceRequest;
import com.employee.management.dto.response.AttendanceResponse;
import com.employee.management.entity.Attendance;
import com.employee.management.entity.Employee;
import com.employee.management.repository.AttendanceRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl
        implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // =========================================================
    // MARK ATTENDANCE
    // =========================================================

    @Override
    public AttendanceResponse markAttendance(
            AttendanceRequest request) {

        if (
                attendanceRepository
                        .existsByEmployeeIdAndAttendanceDate(
                                request.getEmployeeId(),
                                request.getAttendanceDate()
                        )
        ) {
            throw new RuntimeException(
                    "Attendance already exists for this employee and date"
            );
        }

        Employee employee =
                getEmployee(
                        request.getEmployeeId()
                );

        Attendance attendance =
                Attendance.builder()
                        .employee(employee)
                        .attendanceDate(
                                request.getAttendanceDate()
                        )
                        .checkIn(
                                request.getCheckIn()
                        )
                        .checkOut(
                                request.getCheckOut()
                        )
                        .status(
                                request.getStatus()
                        )
                        .remarks(
                                request.getRemarks()
                        )
                        .build();

        return mapToResponse(
                attendanceRepository.save(
                        attendance
                )
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    public List<AttendanceResponse>
    getAllAttendance() {

        return attendanceRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    public AttendanceResponse
    getAttendanceById(Long id) {

        return mapToResponse(
                getAttendance(id)
        );
    }

    // =========================================================
    // GET EMPLOYEE ATTENDANCE
    // =========================================================

    @Override
    public List<AttendanceResponse>
    getEmployeeAttendance(
            Long employeeId) {

        if (
                !employeeRepository
                        .existsById(employeeId)
        ) {
            throw new RuntimeException(
                    "Employee not found"
            );
        }

        return attendanceRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY DATE
    // =========================================================

    @Override
    public List<AttendanceResponse>
    getAttendanceByDate(
            LocalDate date) {

        return attendanceRepository
                .findByAttendanceDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public AttendanceResponse updateAttendance(
            Long id,
            AttendanceRequest request) {

        Attendance attendance =
                getAttendance(id);

        Employee employee =
                getEmployee(
                        request.getEmployeeId()
                );

        attendance.setEmployee(employee);

        attendance.setAttendanceDate(
                request.getAttendanceDate()
        );

        attendance.setCheckIn(
                request.getCheckIn()
        );

        attendance.setCheckOut(
                request.getCheckOut()
        );

        attendance.setStatus(
                request.getStatus()
        );

        attendance.setRemarks(
                request.getRemarks()
        );

        return mapToResponse(
                attendanceRepository.save(
                        attendance
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteAttendance(Long id) {

        if (
                !attendanceRepository
                        .existsById(id)
        ) {
            throw new RuntimeException(
                    "Attendance not found"
            );
        }

        attendanceRepository.deleteById(id);
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
    // GET ATTENDANCE
    // =========================================================

    private Attendance getAttendance(
            Long id) {

        return attendanceRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Attendance not found"
                                )
                );
    }

    // =========================================================
    // MAP ENTITY -> RESPONSE
    // =========================================================

    private AttendanceResponse mapToResponse(
            Attendance attendance) {

        Employee employee =
                attendance.getEmployee();

        return AttendanceResponse.builder()
                .id(
                        attendance.getId()
                )
                .employeeId(
                        employee.getId()
                )
                .employeeName(
                        employee.getFirstName()
                                + " "
                                + employee.getLastName()
                )
                .attendanceDate(
                        attendance.getAttendanceDate()
                )
                .checkIn(
                        attendance.getCheckIn()
                )
                .checkOut(
                        attendance.getCheckOut()
                )
                .status(
                        attendance.getStatus()
                )
                .remarks(
                        attendance.getRemarks()
                )
                .build();
    }
}