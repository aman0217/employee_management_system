import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./Attendance.css";

function Attendance() {
  const today = new Date().toISOString().split("T")[0];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(
    today.substring(0, 7)
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    date: today,
    status: "PRESENT",
  });

  /* =========================================================
     LOAD ATTENDANCE
  ========================================================= */

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attendance");

      setAttendance(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Attendance load error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load attendance."
      );

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  const loadEmployees = async () => {
    try {
      const response = await api.get("/employees");

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : response.data?.content || []
      );
    } catch (err) {
      console.error("Employee load error:", err);
    }
  };

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  /* =========================================================
     SELECTED DATE ATTENDANCE
  ========================================================= */

  const selectedDateAttendance = useMemo(() => {
    return attendance.filter(
      (record) =>
        record.attendanceDate === selectedDate
    );
  }, [attendance, selectedDate]);

  /* =========================================================
     TODAY / SELECTED DATE STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const totalEmployees = employees.length;

    const present = selectedDateAttendance.filter(
      (record) =>
        String(record.status).toUpperCase() ===
        "PRESENT"
    ).length;

    const absent = selectedDateAttendance.filter(
      (record) =>
        String(record.status).toUpperCase() ===
        "ABSENT"
    ).length;

    const leave = selectedDateAttendance.filter(
      (record) =>
        String(record.status).toUpperCase() ===
        "LEAVE"
    ).length;

    const marked = present + absent + leave;

    const notMarked = Math.max(
      totalEmployees - marked,
      0
    );

    return {
      totalEmployees,
      present,
      absent,
      leave,
      notMarked,
      marked,
    };
  }, [employees, selectedDateAttendance]);

  /* =========================================================
     PERCENTAGES
  ========================================================= */

  const percentages = useMemo(() => {
    const total = employees.length || 1;

    return {
      present: Math.round(
        (statistics.present / total) * 100
      ),
      absent: Math.round(
        (statistics.absent / total) * 100
      ),
      leave: Math.round(
        (statistics.leave / total) * 100
      ),
      notMarked: Math.round(
        (statistics.notMarked / total) * 100
      ),
    };
  }, [employees, statistics]);

  /* =========================================================
     MONTHLY LEAVE SUMMARY
  ========================================================= */

  const monthlyLeaveSummary = useMemo(() => {
    const monthRecords = attendance.filter(
      (record) =>
        record.attendanceDate?.startsWith(
          selectedMonth
        ) &&
        String(record.status).toUpperCase() ===
          "LEAVE"
    );

    const leaveMap = {};

    monthRecords.forEach((record) => {
      const employeeId = record.employeeId;

      if (!leaveMap[employeeId]) {
        leaveMap[employeeId] = {
          employeeId,
          employeeName:
            record.employeeName ||
            `Employee #${employeeId}`,
          leaveCount: 0,
        };
      }

      leaveMap[employeeId].leaveCount++;
    });

    return Object.values(leaveMap).sort(
      (a, b) => b.leaveCount - a.leaveCount
    );
  }, [attendance, selectedMonth]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredDateAttendance = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return selectedDateAttendance;
    }

    return selectedDateAttendance.filter(
      (record) =>
        String(
          record.employeeName || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(record.employeeId || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [
    selectedDateAttendance,
    search,
  ]);

  /* =========================================================
     FORM
  ========================================================= */

  const handleInput = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openModal = () => {
    setForm({
      employeeId: "",
      date: selectedDate,
      status: "PRESENT",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
  };

  /* =========================================================
     MARK ATTENDANCE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        employeeId: Number(form.employeeId),
        attendanceDate: form.date,
        status: form.status,
      };

      await api.post(
        "/attendance",
        payload
      );

      setShowModal(false);

      setSelectedDate(form.date);
      setSelectedMonth(
        form.date.substring(0, 7)
      );

      setSuccess(
        "Attendance marked successfully."
      );

      await loadAttendance();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Attendance save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to mark attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusClass = (status) => {
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

  return (
    <div className="app-layout">

      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* MAIN AREA */}

      <div className="main-area">

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="attendance-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="attendance-header">

            <div>
              <span className="page-eyebrow">
                WORKFORCE
              </span>

              <h1>Attendance</h1>

              <p>
                Track daily attendance,
                leaves and employee
                attendance history.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openModal}
            >
              <span>＋</span>
              Mark Attendance
            </button>

          </section>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="page-alert error-alert">

              <span>!</span>

              <div>{error}</div>

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

          {success && (
            <div className="page-alert success-alert">

              <span>✓</span>

              <div>{success}</div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
              >
                ×
              </button>

            </div>
          )}

          {/* =================================================
              DATE CONTROL
          ================================================= */}

          <section className="attendance-date-panel">

            <div>
              <span className="section-label">
                ATTENDANCE DATE
              </span>

              <h2>
                {selectedDate === today
                  ? "Today's Attendance"
                  : "Attendance Overview"}
              </h2>
            </div>

            <div className="attendance-date-control">

              <label>
                Select Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(
                    event.target.value
                  );

                  setSelectedMonth(
                    event.target.value.substring(
                      0,
                      7
                    )
                  );
                }}
              />

            </div>

          </section>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="attendance-stats">

            <div className="attendance-stat-card">

              <div className="attendance-stat-icon total">
                ◫
              </div>

              <div>
                <span>Total Employees</span>

                <strong>
                  {statistics.totalEmployees}
                </strong>
              </div>

            </div>

            <div className="attendance-stat-card">

              <div className="attendance-stat-icon present">
                ✓
              </div>

              <div>
                <span>Present</span>

                <strong>
                  {statistics.present}
                </strong>
              </div>

            </div>

            <div className="attendance-stat-card">

              <div className="attendance-stat-icon absent">
                ×
              </div>

              <div>
                <span>Absent</span>

                <strong>
                  {statistics.absent}
                </strong>
              </div>

            </div>

            <div className="attendance-stat-card">

              <div className="attendance-stat-icon leave">
                ◷
              </div>

              <div>
                <span>On Leave</span>

                <strong>
                  {statistics.leave}
                </strong>
              </div>

            </div>

            <div className="attendance-stat-card">

              <div className="attendance-stat-icon pending">
                !
              </div>

              <div>
                <span>Not Marked</span>

                <strong>
                  {statistics.notMarked}
                </strong>
              </div>

            </div>

          </section>

          {/* =================================================
              ATTENDANCE CHART
          ================================================= */}

          <section className="attendance-chart-panel">

            <div className="panel-heading">

              <div>
                <span className="section-label">
                  DAILY SUMMARY
                </span>

                <h2>
                  Attendance Breakdown
                </h2>
              </div>

              <strong>
                {statistics.marked}/
                {statistics.totalEmployees} Marked
              </strong>

            </div>

            <div className="attendance-chart">

              <div className="chart-row">

                <div className="chart-label">
                  <span className="chart-dot present-dot" />
                  <span>Present</span>
                  <strong>
                    {statistics.present}
                  </strong>
                </div>

                <div className="chart-track">
                  <div
                    className="chart-bar present-bar"
                    style={{
                      width: `${percentages.present}%`,
                    }}
                  />
                </div>

                <span className="chart-percent">
                  {percentages.present}%
                </span>

              </div>

              <div className="chart-row">

                <div className="chart-label">
                  <span className="chart-dot absent-dot" />
                  <span>Absent</span>
                  <strong>
                    {statistics.absent}
                  </strong>
                </div>

                <div className="chart-track">
                  <div
                    className="chart-bar absent-bar"
                    style={{
                      width: `${percentages.absent}%`,
                    }}
                  />
                </div>

                <span className="chart-percent">
                  {percentages.absent}%
                </span>

              </div>

              <div className="chart-row">

                <div className="chart-label">
                  <span className="chart-dot leave-dot" />
                  <span>Leave</span>
                  <strong>
                    {statistics.leave}
                  </strong>
                </div>

                <div className="chart-track">
                  <div
                    className="chart-bar leave-bar"
                    style={{
                      width: `${percentages.leave}%`,
                    }}
                  />
                </div>

                <span className="chart-percent">
                  {percentages.leave}%
                </span>

              </div>

              <div className="chart-row">

                <div className="chart-label">
                  <span className="chart-dot pending-dot" />
                  <span>Not Marked</span>
                  <strong>
                    {statistics.notMarked}
                  </strong>
                </div>

                <div className="chart-track">
                  <div
                    className="chart-bar pending-bar"
                    style={{
                      width: `${percentages.notMarked}%`,
                    }}
                  />
                </div>

                <span className="chart-percent">
                  {percentages.notMarked}%
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              TWO COLUMN SECTION
          ================================================= */}

          <section className="attendance-grid">

            {/* =================================================
                SELECTED DATE RECORDS
            ================================================= */}

            <div className="attendance-panel">

              <div className="panel-heading">

                <div>
                  <span className="section-label">
                    DATE RECORDS
                  </span>

                  <h2>
                    {selectedDate}
                  </h2>
                </div>

                <button
                  className="primary-button small"
                  onClick={openModal}
                >
                  ＋ Mark
                </button>

              </div>

              <div className="attendance-search-wrapper">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

              {loading ? (
                <div className="table-loading">

                  <div className="loading-spinner" />

                  <span>
                    Loading attendance...
                  </span>

                </div>
              ) : filteredDateAttendance.length ===
                0 ? (

                <div className="attendance-empty">

                  <div className="attendance-empty-icon">
                    ◷
                  </div>

                  <h3>
                    No attendance records
                  </h3>

                  <p>
                    No attendance has been
                    marked for this date.
                  </p>

                  <button
                    className="primary-button small"
                    onClick={openModal}
                  >
                    ＋ Mark Attendance
                  </button>

                </div>

              ) : (

                <div className="attendance-table-wrapper">

                  <table className="attendance-table">

                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredDateAttendance.map(
                        (record) => (
                          <tr key={record.id}>

                            <td>
                              <div className="attendance-employee">

                                <div className="employee-mini-avatar">
                                  {(
                                    record.employeeName ||
                                    "E"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      record.employeeName
                                    }
                                  </strong>

                                  <span>
                                    ID:{" "}
                                    {
                                      record.employeeId
                                    }
                                  </span>
                                </div>

                              </div>
                            </td>

                            <td>
                              <span
                                className={`attendance-status ${getStatusClass(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>
                            </td>

                            <td>
                              {
                                record.attendanceDate
                              }
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* =================================================
                MONTHLY LEAVE SUMMARY
            ================================================= */}

            <div className="attendance-panel">

              <div className="panel-heading">

                <div>
                  <span className="section-label">
                    MONTHLY LEAVES
                  </span>

                  <h2>
                    Leave Summary
                  </h2>
                </div>

                <div className="month-control">

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

              </div>

              {monthlyLeaveSummary.length ===
              0 ? (

                <div className="attendance-empty compact">

                  <div className="attendance-empty-icon">
                    ✓
                  </div>

                  <h3>
                    No leaves recorded
                  </h3>

                  <p>
                    No employee has taken leave
                    in this month.
                  </p>

                </div>

              ) : (

                <div className="leave-summary-list">

                  {monthlyLeaveSummary.map(
                    (employee) => (
                      <div
                        className="leave-summary-item"
                        key={employee.employeeId}
                      >

                        <div className="leave-employee">

                          <div className="employee-mini-avatar">
                            {employee.employeeName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                employee.employeeName
                              }
                            </strong>

                            <span>
                              ID:{" "}
                              {
                                employee.employeeId
                              }
                            </span>
                          </div>

                        </div>

                        <div className="leave-count">

                          <strong>
                            {
                              employee.leaveCount
                            }
                          </strong>

                          <span>
                            {employee.leaveCount ===
                            1
                              ? "Leave"
                              : "Leaves"}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          MARK ATTENDANCE MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >

          <div
            className="attendance-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span className="modal-eyebrow">
                  ATTENDANCE MANAGEMENT
                </span>

                <h2>
                  Mark Attendance
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="attendance-form"
              onSubmit={handleSubmit}
            >

              <div className="field">

                <label>
                  Employee *
                </label>

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleInput}
                  required
                >

                  <option value="">
                    Select employee
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.firstName}{" "}
                        {employee.lastName}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="attendance-form-row">

                <div className="field">

                  <label>
                    Date *
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleInput}
                    required
                  />

                </div>

                <div className="field">

                  <label>
                    Status *
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInput}
                    required
                  >

                    <option value="PRESENT">
                      Present
                    </option>

                    <option value="ABSENT">
                      Absent
                    </option>

                    <option value="LEAVE">
                      Leave
                    </option>

                  </select>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Mark Attendance"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Attendance;