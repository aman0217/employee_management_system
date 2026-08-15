package com.employee.management.service;

import com.employee.management.dto.request.AttendanceRequest;
import com.employee.management.dto.response.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponse markAttendance(
            AttendanceRequest request
    );

    List<AttendanceResponse> getAllAttendance();

    AttendanceResponse getAttendanceById(
            Long id
    );

    List<AttendanceResponse> getEmployeeAttendance(
            Long employeeId
    );

    List<AttendanceResponse> getAttendanceByDate(
            LocalDate date
    );

    AttendanceResponse updateAttendance(
            Long id,
            AttendanceRequest request
    );

    void deleteAttendance(
            Long id
    );
}