package com.employee.management.controller;

import com.employee.management.dto.request.AttendanceRequest;
import com.employee.management.dto.response.AttendanceResponse;
import com.employee.management.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // =========================================================
    // MARK ATTENDANCE
    // ADMIN + HR ONLY
    // =========================================================

    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        attendanceService.markAttendance(request)
                );
    }

    // =========================================================
    // GET ALL ATTENDANCE
    // ADMIN + HR ONLY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>>
    getAllAttendance() {

        return ResponseEntity.ok(
                attendanceService.getAllAttendance()
        );
    }

    // =========================================================
    // GET ATTENDANCE BY ID
    // ADMIN + HR ONLY
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse>
    getAttendanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceById(id)
        );
    }

    // =========================================================
    // GET EMPLOYEE ATTENDANCE
    // EMPLOYEE CAN VIEW PERSONAL RECORD
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceResponse>>
    getEmployeeAttendance(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                attendanceService.getEmployeeAttendance(
                        employeeId
                )
        );
    }

    // =========================================================
    // GET ATTENDANCE BY DATE
    // ADMIN + HR ONLY
    // =========================================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceResponse>>
    getAttendanceByDate(
            @PathVariable
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceByDate(
                        date
                )
        );
    }

    // =========================================================
    // UPDATE ATTENDANCE
    // ADMIN + HR ONLY
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse>
    updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {

        return ResponseEntity.ok(
                attendanceService.updateAttendance(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // DELETE ATTENDANCE
    // ADMIN + HR ONLY
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(
            @PathVariable Long id) {

        attendanceService.deleteAttendance(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}