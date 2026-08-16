import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Employees() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

 const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  phoneNumber: "",
  joiningDate: "",
  designation: "",
  role: "EMPLOYEE",
  active: true,
  departmentId: "",
});

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employees");

      if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Employee loading error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load employees.";

      setError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      const response = await api.get("/departments");

      if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Department loading error:", err);

      /*
       * Department loading failure should not hide
       * employee data.
       */
    }
  };

  // =========================================================
  // FILTER EMPLOYEES
  // =========================================================

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const fullName =
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.toLowerCase();

      const email =
        employee.email?.toLowerCase() || "";

      const phone =
        employee.phoneNumber?.toLowerCase() || "";

      const designation =
        employee.designation?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        designation.includes(keyword);

      const matchesRole =
        roleFilter === "ALL" ||
        employee.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          employee.active === true) ||
        (statusFilter === "INACTIVE" &&
          employee.active === false);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleInput = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

 const resetForm = () => {
  setForm({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    joiningDate: "",
    designation: "",
    role: "EMPLOYEE",
    active: true,
    departmentId: "",
  });

  setEditingId(null);
};
  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

 const openEditModal = (employee) => {
  setEditingId(employee.id);

  setForm({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    email: employee.email || "",
    username: employee.username || "",
    password: "",
    phoneNumber: employee.phoneNumber || "",
    joiningDate: employee.joiningDate || "",
    designation: employee.designation || "",
    role: employee.role || "EMPLOYEE",
    active: employee.active !== false,
    departmentId:
      employee.department?.id ||
      employee.departmentId ||
      "",
  });

  setError("");
  setSuccess("");
  setShowModal(true);
};
  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!form.firstName.trim()) {
      setError("First name is required.");
      return false;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!form.phoneNumber.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (!form.joiningDate) {
      setError("Joining date is required.");
      return false;
    }

    if (!form.designation.trim()) {
      setError("Designation is required.");
      return false;
    }

    if (!form.role) {
      setError("Role is required.");
      return false;
    }

    if (!form.departmentId) {
      setError("Please select a department.");
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE / UPDATE EMPLOYEE
  // =========================================================

  const handleSubmit = async (event) => {
  event.preventDefault();

  setSaving(true);
  setError("");
  setSuccess("");

  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    username: form.username.trim(),
    phoneNumber: form.phoneNumber.trim(),
    joiningDate: form.joiningDate,
    designation: form.designation.trim(),
    role: form.role,
    active: form.active,
    departmentId: form.departmentId
      ? Number(form.departmentId)
      : null,
  };

  // Password only send when entered.
  if (form.password.trim()) {
    payload.password = form.password;
  }

  // Password required for new employee.
  if (!editingId && !form.password.trim()) {
    setError("Password is required for a new employee.");
    setSaving(false);
    return;
  }

  try {
    if (editingId) {
      await api.put(
        `/employees/${editingId}`,
        payload
      );

      setSuccess(
        "Employee updated successfully."
      );
    } else {
      await api.post(
        "/employees",
        payload
      );

      setSuccess(
        "Employee added successfully."
      );
    }

    await loadEmployees();

    setShowModal(false);
    resetForm();

    setTimeout(() => {
      setSuccess("");
    }, 3000);

  } catch (err) {
    console.error(err);

    const message =
      err.response?.data?.message ||
      err.response?.data ||
      "Unable to save employee.";

    setError(
      typeof message === "string"
        ? message
        : "Unable to save employee."
    );

  } finally {
    setSaving(false);
  }
};

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  const handleDelete = async () => {
    if (deleteId === null) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/employees/${deleteId}`
      );

      setEmployees((previous) =>
        previous.filter(
          (employee) =>
            employee.id !== deleteId
        )
      );

      setDeleteId(null);

      setSuccess(
        "Employee deleted successfully."
      );
    } catch (err) {
      console.error(
        "Employee delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete employee."
      );

      setDeleteId(null);
    }
  };

  // =========================================================
  // DEPARTMENT NAME
  // =========================================================

  const getDepartmentName = (employee) => {
    if (employee.departmentName) {
      return employee.departmentName;
    }

    if (employee.department?.name) {
      return employee.department.name;
    }

    if (employee.departmentId) {
      const department = departments.find(
        (item) =>
          Number(item.id) ===
          Number(employee.departmentId)
      );

      if (department) {
        return department.name;
      }
    }

    return "Not assigned";
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

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

        <main className="employees-content">

          {/* =========================================
              HEADER
          ========================================= */}

          <section className="employees-header">

            <div>
              <span className="page-eyebrow">
                PEOPLE MANAGEMENT
              </span>

              <h1>Employees</h1>

              <p>
                Manage employee records,
                roles and organization details.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={openAddModal}
            >
              <span>＋</span>
              Add Employee
            </button>

          </section>

          {/* =========================================
              ERROR
          ========================================= */}

          {error && (
            <div className="page-alert error-alert">

              <span>!</span>

              <div>
                {error}
              </div>

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

          {/* =========================================
              SUCCESS
          ========================================= */}

          {success && (
            <div className="page-alert success-alert">

              <span>✓</span>

              <div>
                {success}
              </div>

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

          {/* =========================================
              TOOLBAR
          ========================================= */}

          <section className="employee-toolbar">

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <div className="filter-group">

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Roles
                </option>

                <option value="ADMIN">
                  Admin
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="EMPLOYEE">
                  Employee
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

              <button
                type="button"
                className="reset-filter"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                Reset
              </button>

            </div>

          </section>

          {/* =========================================
              RESULT INFO
          ========================================= */}

          <div className="results-info">

            <span>
              Showing{" "}
              <strong>
                {filteredEmployees.length}
              </strong>{" "}
              of{" "}
              <strong>
                {employees.length}
              </strong>{" "}
              employees
            </span>

          </div>

          {/* =========================================
              EMPLOYEE TABLE
          ========================================= */}

          <section className="employees-panel">

            {loading ? (
              <div className="table-loading">

                <div className="loading-spinner" />

                <span>
                  Loading employees...
                </span>

              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="employee-empty">

                <div className="empty-large-icon">
                  ♙
                </div>

                <h3>
                  No employees found
                </h3>

                <p>
                  Try changing your search
                  or filter, or add a new
                  employee.
                </p>

                <button
                  type="button"
                  className="primary-button small"
                  onClick={openAddModal}
                >
                  ＋ Add Employee
                </button>

              </div>
            ) : (
              <div className="employee-table-wrapper">

                <table className="employee-table">

                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>CONTACT</th>
                      <th>DEPARTMENT</th>
                      <th>ROLE</th>
                      <th>JOINED</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredEmployees.map(
                      (employee) => (
                        <tr
                          key={employee.id}
                        >

                          {/* EMPLOYEE */}

                          <td>

                            <div className="employee-cell">

                              <div className="table-avatar">
                                {employee.firstName
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="table-employee-info">

                                <strong>
                                  {employee.firstName}{" "}
                                  {employee.lastName}
                                </strong>

                                <span>
                                  {employee.designation ||
                                    "Employee"}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td>

                            <div className="contact-cell">

                              <span>
                                {employee.email ||
                                  "—"}
                              </span>

                              <small>
                                {employee.phoneNumber ||
                                  "No phone"}
                              </small>

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          <td>

                            <span className="department-badge">
                              {getDepartmentName(
                                employee
                              )}
                            </span>

                          </td>

                          {/* ROLE */}

                          <td>

                            <span
                              className={`role-badge role-${
                                employee.role
                                  ?.toLowerCase() ||
                                "employee"
                              }`}
                            >
                              {employee.role ||
                                "EMPLOYEE"}
                            </span>

                          </td>

                          {/* JOINED */}

                          <td>

                            <span className="date-cell">
                              {formatDate(
                                employee.joiningDate
                              )}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${
                                employee.active
                                  ? "status-active"
                                  : "status-inactive"
                              }`}
                            >

                              <span />

                              {employee.active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  openEditModal(
                                    employee
                                  )
                                }
                                title="Edit employee"
                              >
                                ✎
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  setDeleteId(
                                    employee.id
                                  )
                                }
                                title="Delete employee"
                              >
                                ♲
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </main>

      </div>

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className="employee-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span className="modal-eyebrow">
                  {editingId !== null
                    ? "EMPLOYEE MANAGEMENT"
                    : "NEW RECORD"}
                </span>

                <h2>
                  {editingId !== null
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >

              {/* PERSONAL INFORMATION */}

              <div className="form-section-title">
                Personal Information
              </div>

              <div className="form-grid">

                <div className="field">

                  <label>
                    First Name *
                  </label>

                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInput}
                    required
                    disabled={saving}
                    placeholder="Enter first name"
                  />

                </div>

                <div className="field">

                  <label>
                    Last Name *
                  </label>

                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInput}
                    required
                    disabled={saving}
                    placeholder="Enter last name"
                  />

                </div>
                <div className="field">
  <label>
    Username *
  </label>

  <input
    name="username"
    value={form.username}
    onChange={handleInput}
    required
    placeholder="Enter username"
    autoComplete="off"
  />
</div>
<div className="field">
  <label>
    {editingId
      ? "New Password"
      : "Password *"}
  </label>

  <input
    type="password"
    name="password"
    value={form.password}
    onChange={handleInput}
    required={!editingId}
    placeholder={
      editingId
        ? "Leave blank to keep current password"
        : "Enter login password"
    }
    autoComplete="new-password"
  />
</div>

                <div className="field">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInput}
                    required
                    disabled={saving}
                    placeholder="employee@example.com"
                  />

                </div>

                <div className="field">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInput}
                    required
                    disabled={saving}
                    placeholder="Enter phone number"
                  />

                </div>

              </div>

              {/* EMPLOYMENT INFORMATION */}

              <div className="form-section-title">
                Employment Information
              </div>

              <div className="form-grid">

                <div className="field">

                  <label>
                    Designation *
                  </label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleInput}
                    required
                    disabled={saving}
                    placeholder="e.g. Software Developer"
                  />

                </div>

                <div className="field">

                  <label>
                    Joining Date *
                  </label>

                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleInput}
                    required
                    disabled={saving}
                  />

                </div>

                <div className="field">

                  <label>
                    Role *
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInput}
                    required
                    disabled={saving}
                  >

                    <option value="EMPLOYEE">
                      Employee
                    </option>

                    <option value="HR">
                      HR
                    </option>

                    <option value="ADMIN">
                      Admin
                    </option>

                  </select>

                </div>

                <div className="field">

                  <label>
                    Department *
                  </label>

                  <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleInput}
                    required
                    disabled={
                      saving ||
                      departments.length === 0
                    }
                  >

                    <option value="">
                      {departments.length === 0
                        ? "No departments available"
                        : "Select department"}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* ACTIVE */}

              <label className="active-toggle">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleInput}
                  disabled={saving}
                />

                <span className="toggle-ui" />

                <span>
                  Employee is active
                </span>

              </label>

              {/* FOOTER */}

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
                  disabled={
                    saving ||
                    departments.length === 0
                  }
                >

                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Employee"
                    : "Create Employee"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================================
          DELETE CONFIRMATION
      ========================================= */}

      {deleteId !== null && (
        <div className="modal-overlay">

          <div className="delete-modal">

            <div className="delete-icon">
              !
            </div>

            <h2>
              Delete employee?
            </h2>

            <p>
              This action will permanently
              remove this employee record.
            </p>

            <div className="delete-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={handleDelete}
              >
                Delete Employee
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Employees;

