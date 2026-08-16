import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Departments() {
  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =====================================================
     DATA
  ===================================================== */

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =====================================================
     SEARCH / ALERTS
  ===================================================== */

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     MODALS
  ===================================================== */

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /* =====================================================
     FORM
  ===================================================== */

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, []);

  /* =====================================================
     LOAD DEPARTMENTS
  ===================================================== */

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/departments");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      setDepartments(data);
    } catch (err) {
      console.error("Department loading failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load departments."
      );

      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD EMPLOYEES
  ===================================================== */

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);

      const response = await api.get("/employees");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      setEmployees(data);
    } catch (err) {
      console.error("Employee loading failed:", err);

      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredDepartments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter((department) => {
      const name = department.name || "";
      const description = department.description || "";

      return `${name} ${description}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [departments, search]);

  /* =====================================================
     GET EMPLOYEES OF DEPARTMENT
  ===================================================== */

  const getDepartmentEmployees = (departmentId) => {
    return employees.filter((employee) => {
      const employeeDepartmentId =
        employee.departmentId ??
        employee.department?.id;

      return (
        Number(employeeDepartmentId) ===
        Number(departmentId)
      );
    });
  };

  /* =====================================================
     FORM INPUT
  ===================================================== */

  const handleInput = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
    });

    setEditingId(null);
  };

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    resetForm();

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (department) => {
    setEditingId(department.id);

    setForm({
      name: department.name || "",
      description: department.description || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  /* =====================================================
     CREATE / UPDATE DEPARTMENT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      /* =================================================
         UPDATE
      ================================================= */

      if (editingId) {
        await api.put(
          `/departments/${editingId}`,
          payload
        );

        setSuccess(
          "Department updated successfully."
        );
      }

      /* =================================================
         CREATE
      ================================================= */

      else {
        await api.post(
          "/departments",
          {
            ...payload,
            active: true,
          }
        );

        setSuccess(
          "Department created successfully."
        );
      }

      await loadDepartments();

      setShowModal(false);
      resetForm();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Department save failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE DEPARTMENT
  ===================================================== */

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/departments/${deleteId}`
      );

      setDepartments((previous) =>
        previous.filter(
          (department) =>
            department.id !== deleteId
        )
      );

      setDeleteId(null);

      setSuccess(
        "Department deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Department delete failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete department."
      );

      setDeleteId(null);
    }
  };

  /* =====================================================
     SIDEBAR CLOSE
  ===================================================== */

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="main-area">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="departments-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="departments-header">

            <div>
              <span className="page-eyebrow">
                ORGANIZATION
              </span>

              <h1>
                Departments
              </h1>

              <p>
                Create and manage departments
                across your organization.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={openAddModal}
            >
              <span>＋</span>
              Add Department
            </button>

          </section>

          {/* =================================================
              ERROR ALERT
          ================================================= */}

          {error && (
            <div className="page-alert error-alert">

              <span>!</span>

              <span>{error}</span>

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
              SUCCESS ALERT
          ================================================= */}

          {success && (
            <div className="page-alert success-alert">

              <span>✓</span>

              <span>{success}</span>

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
              SEARCH
          ================================================= */}

          <section className="department-toolbar">

            <div className="search-box department-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
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

            <span className="department-count">
              {filteredDepartments.length}{" "}
              department
              {filteredDepartments.length !== 1
                ? "s"
                : ""}
            </span>

          </section>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <section className="departments-panel">

              <div className="table-loading">

                <div className="loading-spinner" />

                <span>
                  Loading departments...
                </span>

              </div>

            </section>

          ) : filteredDepartments.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <section className="departments-panel">

              <div className="department-empty">

                <div className="department-empty-icon">
                  ◫
                </div>

                <h3>
                  No departments found
                </h3>

                <p>
                  Add a department to organize
                  your employees.
                </p>

                <button
                  type="button"
                  className="primary-button small"
                  onClick={openAddModal}
                >
                  ＋ Add Department
                </button>

              </div>

            </section>

          ) : (

            /* =================================================
               DEPARTMENT GRID
            ================================================= */

            <section className="department-grid">

              {filteredDepartments.map(
                (department, index) => {

                  const departmentEmployees =
                    getDepartmentEmployees(
                      department.id
                    );

                  return (
                    <article
                      className="department-card"
                      key={department.id}
                    >

                      {/* =================================================
                          CARD TOP
                      ================================================= */}

                      <div className="department-card-top">

                        <div className="department-icon">
                          {department.name
                            ?.charAt(0)
                            .toUpperCase() || "D"}
                        </div>

                        <div className="department-actions">

                          <button
                            type="button"
                            className="edit-button"
                            title="Edit department"
                            onClick={() =>
                              openEditModal(
                                department
                              )
                            }
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            title="Delete department"
                            onClick={() =>
                              setDeleteId(
                                department.id
                              )
                            }
                          >
                            ♲
                          </button>

                        </div>

                      </div>

                      {/* =================================================
                          CARD BODY
                      ================================================= */}

                      <div className="department-card-body">

                        <h3>
                          {department.name}
                        </h3>

                        <p>
                          {department.description ||
                            "No description available."}
                        </p>

                      </div>

                      {/* =================================================
                          EMPLOYEES
                      ================================================= */}

                      <div className="department-employees">

                        <div className="department-employees-header">

                          <div>

                            <span>
                              TEAM
                            </span>

                            <strong>
                              {departmentEmployees.length}{" "}
                              {departmentEmployees.length === 1
                                ? "Employee"
                                : "Employees"}
                            </strong>

                          </div>

                        </div>

                        {employeesLoading ? (

                          <div className="no-department-employees">
                            <span>
                              Loading employees...
                            </span>
                          </div>

                        ) : departmentEmployees.length === 0 ? (

                          <div className="no-department-employees">

                            <span>
                              No employees assigned
                            </span>

                          </div>

                        ) : (

                          <div className="department-employee-list">

                            {departmentEmployees
                              .slice(0, 4)
                              .map((employee) => {

                                const employeeName =
                                  `${employee.firstName || ""} ${
                                    employee.lastName || ""
                                  }`.trim() ||
                                  "Employee";

                                const employeeInitial =
                                  employee.firstName
                                    ?.charAt(0)
                                    .toUpperCase() ||
                                  employeeName
                                    .charAt(0)
                                    .toUpperCase() ||
                                  "E";

                                return (
                                  <div
                                    className="department-employee"
                                    key={employee.id}
                                  >

                                    <div className="department-employee-avatar">
                                      {employeeInitial}
                                    </div>

                                    <div className="department-employee-info">

                                      <strong>
                                        {employeeName}
                                      </strong>

                                      <span>
                                        {employee.designation ||
                                          employee.role ||
                                          "Employee"}
                                      </span>

                                    </div>

                                  </div>
                                );
                              })}

                          </div>
                        )}

                        {/* =================================================
                            MORE EMPLOYEES
                        ================================================= */}

                        {!employeesLoading &&
                          departmentEmployees.length > 4 && (

                            <div className="more-employees">

                              +
                              {departmentEmployees.length - 4}{" "}
                              more employees

                            </div>

                          )}

                      </div>

                      {/* =================================================
                          CARD FOOTER
                      ================================================= */}

                      <div className="department-card-footer">

                        <div>

                          <strong>
                            {departmentEmployees.length}
                          </strong>

                          <span>
                            Employees
                          </span>

                        </div>

                        <span className="department-number">

                          #
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}

                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </main>

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >

          <div
            className="department-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="modal-eyebrow">
                  ORGANIZATION MANAGEMENT
                </span>

                <h2>
                  {editingId
                    ? "Edit Department"
                    : "Add Department"}
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

            <form
              className="department-form"
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  NAME
              ================================================= */}

              <div className="field">

                <label>
                  Department Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  placeholder="e.g. Human Resources"
                  required
                />

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Enter department description..."
                  rows="5"
                />

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

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
                    : editingId
                    ? "Update Department"
                    : "Create Department"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      {deleteId && (

        <div
          className="modal-overlay"
          onMouseDown={() =>
            setDeleteId(null)
          }
        >

          <div
            className="delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="delete-icon">
              !
            </div>

            <h2>
              Delete department?
            </h2>

            <p>
              This action will permanently
              remove this department.
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
                Delete Department
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Departments;