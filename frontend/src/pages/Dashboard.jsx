import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =====================================================
     MANAGEMENT DATA
  ===================================================== */

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);

  /* =====================================================
     EMPLOYEE PERSONAL DATA
  ===================================================== */

  const [myEmployee, setMyEmployee] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [mySalaries, setMySalaries] = useState([]);

  /* =====================================================
     EMPLOYEE ATTENDANCE MONTH
  ===================================================== */

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  /* =====================================================
     LOADING / ERROR
  ===================================================== */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     ROLE
  ===================================================== */

  const isManagementUser =
    user?.role === "ADMIN" ||
    user?.role === "HR";

  const isEmployee =
    user?.role === "EMPLOYEE";

  /* =====================================================
     TODAY
  ===================================================== */

  const today = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      /* =================================================
         ADMIN / HR DASHBOARD
      ================================================= */

      if (isManagementUser) {
        const results =
          await Promise.allSettled([
            api.get("/employees"),
            api.get("/attendance"),
            api.get("/salaries"),
          ]);

        /* EMPLOYEES */

        if (
          results[0]?.status ===
          "fulfilled"
        ) {
          const data =
            results[0].value.data;

          setEmployees(
            Array.isArray(data)
              ? data
              : data?.content || []
          );
        } else {
          setEmployees([]);
        }

        /* ATTENDANCE */

        if (
          results[1]?.status ===
          "fulfilled"
        ) {
          const data =
            results[1].value.data;

          setAttendance(
            Array.isArray(data)
              ? data
              : data?.content || []
          );
        } else {
          setAttendance([]);
        }

        /* SALARIES */

        if (
          results[2]?.status ===
          "fulfilled"
        ) {
          const data =
            results[2].value.data;

          setSalaries(
            Array.isArray(data)
              ? data
              : data?.content || []
          );
        } else {
          setSalaries([]);
        }

        const failed =
          results.some(
            (item) =>
              item.status === "rejected"
          );

        if (failed) {
          setError(
            "Some dashboard information could not be loaded."
          );
        }

        return;
      }

      /* =================================================
         EMPLOYEE DASHBOARD
      ================================================= */

      if (isEmployee) {
        let employeeResponse;

        try {
          employeeResponse =
            await api.get(
              "/employees/me"
            );
        } catch (profileError) {
          console.error(
            "Employee profile loading error:",
            profileError
          );

          setMyEmployee(null);
          setMyAttendance([]);
          setMySalaries([]);

          setError(
            profileError.response?.data?.message ||
              "Unable to load your employee profile."
          );

          return;
        }

        const employeeData =
          employeeResponse?.data;

        if (
          !employeeData ||
          !employeeData.id
        ) {
          setMyEmployee(null);
          setMyAttendance([]);
          setMySalaries([]);

          setError(
            "Your employee profile could not be found."
          );

          return;
        }

        setMyEmployee(
          employeeData
        );

        /* -----------------------------------------------
           PERSONAL ATTENDANCE + SALARY
        ------------------------------------------------ */

        const personalResults =
          await Promise.allSettled([
            api.get(
              `/attendance/employee/${employeeData.id}`
            ),
            api.get(
              `/salaries/employee/${employeeData.id}`
            ),
          ]);

        /* ATTENDANCE */

        if (
          personalResults[0]?.status ===
          "fulfilled"
        ) {
          const data =
            personalResults[0].value.data;

          setMyAttendance(
            Array.isArray(data)
              ? data
              : data?.content || []
          );
        } else {
          setMyAttendance([]);
        }

        /* SALARY */

        if (
          personalResults[1]?.status ===
          "fulfilled"
        ) {
          const data =
            personalResults[1].value.data;

          setMySalaries(
            Array.isArray(data)
              ? data
              : data?.content || []
          );
        } else {
          setMySalaries([]);
        }

        const personalFailed =
          personalResults.some(
            (item) =>
              item.status === "rejected"
          );

        if (personalFailed) {
          setError(
            "Profile loaded, but some personal information could not be loaded."
          );
        }

        return;
      }
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     MANAGEMENT EMPLOYEE STATISTICS
  ===================================================== */

  const employeeStats = useMemo(() => {
    const total =
      employees.length;

    const active =
      employees.filter(
        (employee) =>
          employee.active === true
      ).length;

    const inactive =
      employees.filter(
        (employee) =>
          employee.active === false
      ).length;

    return {
      total,
      active,
      inactive,
    };
  }, [employees]);

  /* =====================================================
     TODAY'S MANAGEMENT ATTENDANCE
  ===================================================== */

  const todaysAttendance =
    useMemo(() => {
      return attendance.filter(
        (item) => {
          const attendanceDate =
            item.attendanceDate ||
            item.date;

          if (!attendanceDate) {
            return false;
          }

          return (
            String(
              attendanceDate
            ).substring(0, 10) ===
            today
          );
        }
      );
    }, [attendance, today]);

  /* =====================================================
     MANAGEMENT ATTENDANCE STATISTICS
  ===================================================== */

  const attendanceStats =
    useMemo(() => {
      const present =
        todaysAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "PRESENT"
        ).length;

      const absent =
        todaysAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "ABSENT"
        ).length;

      const leave =
        todaysAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "LEAVE"
        ).length;

      const total =
        todaysAttendance.length;

      return {
        total,
        present,
        absent,
        leave,
      };
    }, [todaysAttendance]);

  /* =====================================================
     PAYROLL
  ===================================================== */

  const payrollTotal =
    useMemo(() => {
      return salaries.reduce(
        (total, salary) =>
          total +
          Number(
            salary.netSalary || 0
          ),
        0
      );
    }, [salaries]);

  /* =====================================================
     RECENT EMPLOYEES
  ===================================================== */

  const recentEmployees =
    useMemo(() => {
      return [...employees]
        .reverse()
        .slice(0, 5);
    }, [employees]);

  /* =====================================================
     EMPLOYEE TODAY ATTENDANCE
  ===================================================== */

  const myTodaysAttendance =
    useMemo(() => {
      return myAttendance.filter(
        (item) => {
          const attendanceDate =
            item.attendanceDate ||
            item.date;

          if (!attendanceDate) {
            return false;
          }

          return (
            String(
              attendanceDate
            ).substring(0, 10) ===
            today
          );
        }
      );
    }, [
      myAttendance,
      today,
    ]);

  /* =====================================================
     EMPLOYEE TODAY STATUS
  ===================================================== */

  const myAttendanceStatus =
    useMemo(() => {
      if (
        myTodaysAttendance.length ===
        0
      ) {
        return "Not Marked";
      }

      return String(
        myTodaysAttendance[0].status ||
          "Not Marked"
      );
    }, [
      myTodaysAttendance,
    ]);

  /* =====================================================
     SELECTED MONTH ATTENDANCE
  ===================================================== */

  const myMonthlyAttendance =
    useMemo(() => {
      return [...myAttendance]
        .filter((item) => {
          const attendanceDate =
            item.attendanceDate ||
            item.date;

          if (!attendanceDate) {
            return false;
          }

          return String(
            attendanceDate
          )
            .substring(0, 7) ===
            selectedMonth;
        })
        .sort((a, b) => {
          const dateA = String(
            a.attendanceDate ||
              a.date ||
              ""
          );

          const dateB = String(
            b.attendanceDate ||
              b.date ||
              ""
          );

          return dateB.localeCompare(
            dateA
          );
        });
    }, [
      myAttendance,
      selectedMonth,
    ]);

  /* =====================================================
     MONTHLY ATTENDANCE STATISTICS
  ===================================================== */

  const myMonthlyStats =
    useMemo(() => {
      const present =
        myMonthlyAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "PRESENT"
        ).length;

      const absent =
        myMonthlyAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "ABSENT"
        ).length;

      const leave =
        myMonthlyAttendance.filter(
          (item) =>
            String(
              item.status
            ).toUpperCase() ===
            "LEAVE"
        ).length;

      return {
        present,
        absent,
        leave,
        total:
          myMonthlyAttendance.length,
      };
    }, [
      myMonthlyAttendance,
    ]);

  /* =====================================================
     LATEST SALARY
  ===================================================== */

  const latestSalary =
    useMemo(() => {
      if (
        mySalaries.length ===
        0
      ) {
        return null;
      }

      return [
        ...mySalaries,
      ].sort((a, b) =>
        String(
          b.salaryMonth || ""
        ).localeCompare(
          String(
            a.salaryMonth || ""
          )
        )
      )[0];
    }, [mySalaries]);

  /* =====================================================
     EMPLOYEE NAME
  ===================================================== */

  const getEmployeeName = (
    employee
  ) => {
    if (!employee) {
      return "Employee";
    }

    const fullName =
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim();

    return (
      fullName ||
      employee.username ||
      "Employee"
    );
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value || 0)
    );
  };

  /* =====================================================
     DATE
  ===================================================== */

  const formattedDate =
    useMemo(() => {
      return new Date().toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );
    }, []);

  /* =====================================================
     FORMAT ATTENDANCE DATE
  ===================================================== */

  const formatAttendanceDate = (
    record
  ) => {
    const value =
      record.attendanceDate ||
      record.date;

    if (!value) {
      return "—";
    }

    return new Date(
      `${String(value).substring(
        0,
        10
      )}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getAttendanceStatusClass = (
    status
  ) => {
    switch (
      String(status).toUpperCase()
    ) {
      case "PRESENT":
        return "attendance-present";

      case "ABSENT":
        return "attendance-absent";

      case "LEAVE":
        return "attendance-leave";

      default:
        return "attendance-default";
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="main-area">

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="dashboard-content">

          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="dashboard-welcome">

            <div>

              <span className="page-eyebrow">
                OVERVIEW
              </span>

              <h1>
                Welcome back,
                <br />

                <span>
                  {isEmployee
                    ? getEmployeeName(
                        myEmployee
                      )
                    : user?.username ||
                      "User"}
                </span>
              </h1>

              <p>
                {isEmployee
                  ? "Here is your personal attendance and salary information."
                  : "Here's what's happening with your organization today."}
              </p>

            </div>

            <div className="dashboard-date">

              <span>
                TODAY
              </span>

              <strong>
                {formattedDate}
              </strong>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="page-alert error-alert">

              <span>
                !
              </span>

              {error}

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              MANAGEMENT DASHBOARD
          ================================================= */}

          {isManagementUser ? (
            <>

              <section className="dashboard-stats">

                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-top">
                    <span>
                      TOTAL EMPLOYEES
                    </span>

                    <div className="dashboard-stat-icon">
                      ♙
                    </div>
                  </div>

                  <strong>
                    {loading
                      ? "—"
                      : employeeStats.total}
                  </strong>

                  <span className="dashboard-stat-meta">
                    Employees in system
                  </span>

                </div>

                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-top">
                    <span>
                      ACTIVE EMPLOYEES
                    </span>

                    <div className="dashboard-stat-icon">
                      ✓
                    </div>
                  </div>

                  <strong>
                    {loading
                      ? "—"
                      : employeeStats.active}
                  </strong>

                  <span className="dashboard-stat-meta">
                    Currently active
                  </span>

                </div>

                <div className="dashboard-stat-card">

                  <div className="dashboard-stat-top">
                    <span>
                      TODAY'S ATTENDANCE
                    </span>

                    <div className="dashboard-stat-icon">
                      ◷
                    </div>
                  </div>

                  <strong>
                    {loading
                      ? "—"
                      : attendanceStats.total}
                  </strong>

                  <span className="dashboard-stat-meta">
                    Records marked today
                  </span>

                </div>

                <div className="dashboard-stat-card highlight">

                  <div className="dashboard-stat-top">
                    <span>
                      PAYROLL
                    </span>

                    <div className="dashboard-stat-icon">
                      ₹
                    </div>
                  </div>

                  <strong>
                    {loading
                      ? "—"
                      : formatCurrency(
                          payrollTotal
                        )}
                  </strong>

                  <span className="dashboard-stat-meta">
                    Total recorded net salary
                  </span>

                </div>

              </section>

              <section className="dashboard-grid">

                {/* ATTENDANCE */}

                <div className="dashboard-panel">

                  <div className="dashboard-panel-header">

                    <div>
                      <span>
                        TODAY'S ATTENDANCE
                      </span>

                      <h2>
                        Attendance Overview
                      </h2>
                    </div>

                    <Link to="/attendance">
                      View all
                    </Link>

                  </div>

                  <div className="attendance-overview">

                    <div className="overview-item">

                      <div className="overview-icon present">
                        ✓
                      </div>

                      <div>
                        <strong>
                          {
                            attendanceStats.present
                          }
                        </strong>

                        <span>
                          Present
                        </span>
                      </div>

                    </div>

                    <div className="overview-item">

                      <div className="overview-icon absent">
                        ×
                      </div>

                      <div>
                        <strong>
                          {
                            attendanceStats.absent
                          }
                        </strong>

                        <span>
                          Absent
                        </span>
                      </div>

                    </div>

                    <div className="overview-item">

                      <div className="overview-icon leave">
                        ◷
                      </div>

                      <div>
                        <strong>
                          {
                            attendanceStats.leave
                          }
                        </strong>

                        <span>
                          Leave
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

                {/* RECENT EMPLOYEES */}

                <div className="dashboard-panel">

                  <div className="dashboard-panel-header">

                    <div>
                      <span>
                        TEAM
                      </span>

                      <h2>
                        Recent Employees
                      </h2>
                    </div>

                    <Link to="/employees">
                      View all
                    </Link>

                  </div>

                  <div className="recent-employees">

                    {recentEmployees.length ===
                    0 ? (
                      <div className="dashboard-empty">
                        No employees found.
                      </div>
                    ) : (
                      recentEmployees.map(
                        (employee) => {
                          const name =
                            getEmployeeName(
                              employee
                            );

                          return (
                            <div
                              className="recent-employee"
                              key={
                                employee.id
                              }
                            >

                              <div className="recent-avatar">
                                {name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="recent-info">

                                <strong>
                                  {name}
                                </strong>

                                <span>
                                  {employee.role ||
                                    "EMPLOYEE"}
                                </span>

                              </div>

                              <span
                                className={
                                  employee.active
                                    ? "employee-status active"
                                    : "employee-status inactive"
                                }
                              >
                                {employee.active
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </div>
                          );
                        }
                      )
                    )}

                  </div>

                </div>

              </section>

              <section className="quick-actions">

                <div className="quick-actions-heading">

                  <span>
                    SHORTCUTS
                  </span>

                  <h2>
                    Quick Actions
                  </h2>

                </div>

                <div className="quick-action-grid">

                  <Link
                    to="/employees"
                    className="quick-action"
                  >
                    <div className="quick-action-icon">
                      ♙
                    </div>

                    <div>
                      <strong>
                        Employees
                      </strong>

                      <span>
                        Manage employee records
                      </span>
                    </div>

                    <b>
                      →
                    </b>
                  </Link>

                  <Link
                    to="/departments"
                    className="quick-action"
                  >
                    <div className="quick-action-icon">
                      ▦
                    </div>

                    <div>
                      <strong>
                        Departments
                      </strong>

                      <span>
                        Manage departments
                      </span>
                    </div>

                    <b>
                      →
                    </b>
                  </Link>

                  <Link
                    to="/attendance"
                    className="quick-action"
                  >
                    <div className="quick-action-icon">
                      ◷
                    </div>

                    <div>
                      <strong>
                        Attendance
                      </strong>

                      <span>
                        Track daily attendance
                      </span>
                    </div>

                    <b>
                      →
                    </b>
                  </Link>

                  <Link
                    to="/salary"
                    className="quick-action"
                  >
                    <div className="quick-action-icon">
                      ₹
                    </div>

                    <div>
                      <strong>
                        Salary
                      </strong>

                      <span>
                        Manage payroll records
                      </span>
                    </div>

                    <b>
                      →
                    </b>
                  </Link>

                </div>

              </section>

            </>
          ) : (

            /* =================================================
               EMPLOYEE DASHBOARD
            ================================================= */

            <>

              {/* =================================================
                  EMPLOYEE STAT CARDS
              ================================================= */}

              <section className="employee-dashboard-stats">

                <div className="employee-dashboard-stat">

                  <span>
                    MY ATTENDANCE TODAY
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : myAttendanceStatus}
                  </strong>

                </div>

                <div className="employee-dashboard-stat">

                  <span>
                    DESIGNATION
                  </span>

                  <strong>
                    {myEmployee?.designation ||
                      "Employee"}
                  </strong>

                </div>

                <div className="employee-dashboard-stat">

                  <span>
                    MONTHLY LEAVE
                  </span>

                  <strong>
                    {myMonthlyStats.leave}
                  </strong>

                </div>

                <div className="employee-dashboard-stat">

                  <span>
                    NET SALARY
                  </span>

                  <strong>
                    {latestSalary
                      ? formatCurrency(
                          latestSalary.netSalary
                        )
                      : "No record"}
                  </strong>

                </div>

              </section>

              {/* =================================================
                  PROFILE
              ================================================= */}

              <section className="employee-dashboard-card">

                <div className="employee-dashboard-icon">

                  {getEmployeeName(
                    myEmployee
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="employee-dashboard-profile">

                  <span>
                    MY PROFILE
                  </span>

                  <h2>
                    {getEmployeeName(
                      myEmployee
                    )}
                  </h2>

                  <p>
                    {myEmployee?.designation ||
                      "Employee"}
                  </p>

                  <div className="employee-profile-details">

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {myEmployee?.email ||
                          user?.email ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {myEmployee?.phoneNumber ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Joining Date
                      </span>

                      <strong>
                        {myEmployee?.joiningDate ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Department
                      </span>

                      <strong>
                        {myEmployee?.departmentName ||
                          "—"}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  PERSONAL ATTENDANCE + SALARY
              ================================================= */}

              <section className="dashboard-grid employee-personal-grid">

                {/* =================================================
                    MY ATTENDANCE
                ================================================= */}

                <div className="dashboard-panel">

                  <div className="dashboard-panel-header">

                    <div>

                      <span>
                        MY ATTENDANCE
                      </span>

                      <h2>
                        Attendance History
                      </h2>

                    </div>

                  </div>

                  {/* TODAY */}

                  <div className="employee-attendance-today">

                    <span>
                      TODAY
                    </span>

                    <strong
                      className={
                        getAttendanceStatusClass(
                          myAttendanceStatus
                        )
                      }
                    >
                      {myAttendanceStatus}
                    </strong>

                  </div>

                  {/* MONTH SELECTOR */}

                  <div className="employee-month-selector">

                    <label>
                      Select Month
                    </label>

                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) =>
                        setSelectedMonth(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  {/* MONTH STATISTICS */}

                  <div className="employee-month-stats">

                    <div>
                      <span>
                        Present
                      </span>

                      <strong>
                        {
                          myMonthlyStats.present
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Absent
                      </span>

                      <strong>
                        {
                          myMonthlyStats.absent
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Leave
                      </span>

                      <strong>
                        {
                          myMonthlyStats.leave
                        }
                      </strong>
                    </div>

                  </div>

                  {/* MONTH ATTENDANCE TABLE */}

                  <div className="employee-attendance-history">

                    {myMonthlyAttendance.length ===
                    0 ? (
                      <div className="dashboard-empty">
                        No attendance records found for this month.
                      </div>
                    ) : (
                      <div className="employee-attendance-list">

                        {myMonthlyAttendance.map(
                          (record) => (
                            <div
                              className="employee-attendance-row"
                              key={
                                record.id ||
                                `${
                                  record.employeeId
                                }-${
                                  record.attendanceDate
                                }`
                              }
                            >

                              <div>

                                <strong>
                                  {formatAttendanceDate(
                                    record
                                  )}
                                </strong>

                                <span>
                                  Attendance
                                </span>

                              </div>

                              <span
                                className={`attendance-status ${getAttendanceStatusClass(
                                  record.status
                                )}`}
                              >
                                {record.status ||
                                  "UNKNOWN"}
                              </span>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  <p className="employee-attendance-note">
                    Attendance is managed by Admin/HR.
                    You can only view your records.
                  </p>

                </div>

                {/* =================================================
                    MY SALARY
                ================================================= */}

                <div className="dashboard-panel">

                  <div className="dashboard-panel-header">

                    <div>

                      <span>
                        MY SALARY
                      </span>

                      <h2>
                        Salary Information
                      </h2>

                    </div>

                  </div>

                  {latestSalary ? (

                    <div className="employee-salary-summary">

                      <div>

                        <span>
                          Month
                        </span>

                        <strong>
                          {
                            latestSalary.salaryMonth
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          Basic
                        </span>

                        <strong>
                          {formatCurrency(
                            latestSalary.basicSalary
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Allowances
                        </span>

                        <strong>
                          {formatCurrency(
                            latestSalary.allowances
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Deductions
                        </span>

                        <strong>
                          {formatCurrency(
                            latestSalary.deductions
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Net Salary
                        </span>

                        <strong>
                          {formatCurrency(
                            latestSalary.netSalary
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Payment
                        </span>

                        <strong>
                          {String(
                            latestSalary.paymentStatus ||
                              "—"
                          )}
                        </strong>

                      </div>

                    </div>

                  ) : (

                    <div className="dashboard-empty">
                      No salary record found.
                    </div>

                  )}

                  <p className="employee-salary-note">
                    Salary information is managed by
                    Admin/HR. You can only view your
                    salary records.
                  </p>

                </div>

              </section>

            </>
          )}

        </main>

      </div>

    </div>
  );
}

export default Dashboard;