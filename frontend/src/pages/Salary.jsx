import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Salary() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    month: new Date().toISOString().slice(0, 7),
    basicSalary: "",
    allowances: "",
    deductions: "",
  });

  /* =================================
     LOAD SALARY
  ================================= */

  useEffect(() => {
    loadSalaries();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [month]);

 const loadSalaries = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/salaries");

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    const filteredData = data.filter(
      (salary) =>
        !salary.salaryMonth ||
        salary.salaryMonth === month
    );

    setSalaries(filteredData);
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
        "Unable to load salary records."
    );

    setSalaries([]);
  } finally {
    setLoading(false);
  }
};

  const loadEmployees = async () => {
    try {
      const response = await api.get(
        "/employees"
      );

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : response.data?.content || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* =================================
     FILTER
  ================================= */

  const filteredSalaries = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return salaries;
    }

    return salaries.filter((salary) => {
      const employee =
        salary.employee || {};

      const name =
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.toLowerCase();

      return (
        name.includes(keyword) ||
        String(
          salary.employeeName || ""
        )
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [salaries, search]);

  /* =================================
     TOTALS
  ================================= */

  const totals = useMemo(() => {
    return salaries.reduce(
      (result, salary) => {
        const basic = Number(
          salary.basicSalary || 0
        );

        const allowances = Number(
          salary.allowances || 0
        );

        const deductions = Number(
          salary.deductions || 0
        );

        const net =
          salary.netSalary !== undefined
            ? Number(salary.netSalary)
            : basic +
              allowances -
              deductions;

        result.basic += basic;
        result.allowances += allowances;
        result.deductions += deductions;
        result.net += net;

        return result;
      },
      {
        basic: 0,
        allowances: 0,
        deductions: 0,
        net: 0,
      }
    );
  }, [salaries]);

  /* =================================
     FORM
  ================================= */

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
      month,
      basicSalary: "",
      allowances: "",
      deductions: "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
  };

  /* =================================
     CREATE SALARY
  ================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (
      form.basicSalary === "" ||
      Number(form.basicSalary) < 0
    ) {
      setError(
        "Please enter a valid basic salary."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const basicSalary = Number(
        form.basicSalary
      );

      const allowances = Number(
        form.allowances || 0
      );

      const deductions = Number(
        form.deductions || 0
      );

     const payload = {
  employeeId: Number(form.employeeId),
  salaryMonth: form.month,
  basicSalary,
  allowances,
  deductions,
  paymentStatus: "PENDING",
  paymentDate: null,
};

      await api.post(
      "/salaries",
      payload
      );

      setShowModal(false);

      setSuccess(
        "Salary record created successfully."
      );

      await loadSalaries();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create salary record."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =================================
     HELPERS
  ================================= */

  const getEmployeeName = (salary) => {
    if (salary.employee) {
      return `${salary.employee.firstName || ""} ${
        salary.employee.lastName || ""
      }`.trim();
    }

    return (
      salary.employeeName ||
      `Employee #${
        salary.employeeId || "-"
      }`
    );
  };

  const getNetSalary = (salary) => {
    if (
      salary.netSalary !== undefined &&
      salary.netSalary !== null
    ) {
      return Number(salary.netSalary);
    }

    return (
      Number(salary.basicSalary || 0) +
      Number(salary.allowances || 0) -
      Number(salary.deductions || 0)
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(Number(value || 0));
  };

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

        <main className="salary-content">

          {/* HEADER */}

          <section className="salary-header">
            <div>
              <span className="page-eyebrow">
                PAYROLL
              </span>

              <h1>Salary Management</h1>

              <p>
                Manage employee salaries,
                allowances and deductions.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={openModal}
            >
              <span>＋</span>
              Add Salary
            </button>
          </section>

          {/* ALERTS */}

          {error && (
            <div className="page-alert error-alert">
              <span>!</span>

              {error}

              <button
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

              {success}

              <button
                onClick={() =>
                  setSuccess("")
                }
              >
                ×
              </button>
            </div>
          )}

          {/* SUMMARY */}

          <section className="salary-summary">

            <div className="salary-summary-card">
              <span>
                Basic Salary
              </span>

              <strong>
                {formatCurrency(
                  totals.basic
                )}
              </strong>
            </div>

            <div className="salary-summary-card">
              <span>
                Allowances
              </span>

              <strong>
                {formatCurrency(
                  totals.allowances
                )}
              </strong>
            </div>

            <div className="salary-summary-card">
              <span>
                Deductions
              </span>

              <strong>
                {formatCurrency(
                  totals.deductions
                )}
              </strong>
            </div>

            <div className="salary-summary-card highlight">
              <span>
                Total Net Salary
              </span>

              <strong>
                {formatCurrency(
                  totals.net
                )}
              </strong>
            </div>

          </section>

          {/* FILTER */}

          <section className="salary-toolbar">

            <div className="salary-month">
              <label>
                Salary Month
              </label>

              <input
                type="month"
                value={month}
                onChange={(event) =>
                  setMonth(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="search-box salary-search">
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

            <span className="salary-record-count">
              {filteredSalaries.length}{" "}
              record
              {filteredSalaries.length !==
              1
                ? "s"
                : ""}
            </span>

          </section>

          {/* TABLE */}

          <section className="salary-panel">

            {loading ? (
              <div className="table-loading">
                <div className="loading-spinner" />

                <span>
                  Loading salary records...
                </span>
              </div>
            ) : filteredSalaries.length ===
              0 ? (
              <div className="salary-empty">

                <div className="salary-empty-icon">
                  ₹
                </div>

                <h3>
                  No salary records
                </h3>

                <p>
                  No salary data is available
                  for this month.
                </p>

                <button
                  className="primary-button small"
                  onClick={openModal}
                >
                  ＋ Add Salary
                </button>

              </div>
            ) : (
              <div className="salary-table-wrapper">

                <table className="salary-table">

                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Basic</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSalaries.map(
                      (salary) => (
                        <tr
                          key={
                            salary.id ||
                            `${salary.employeeId}-${salary.month}`
                          }
                        >

                          <td>
                            <div className="salary-employee">

                              <div className="employee-mini-avatar">
                                {getEmployeeName(
                                  salary
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {getEmployeeName(
                                    salary
                                  )}
                                </strong>

                                <span>
                                  ID:{" "}
                                  {salary.employeeId ||
                                    salary.employee?.id ||
                                    "-"}
                                </span>
                              </div>

                            </div>
                          </td>

                          <td>
                            {formatCurrency(
                              salary.basicSalary
                            )}
                          </td>

                          <td className="salary-positive">
                            +
                            {formatCurrency(
                              salary.allowances
                            )}
                          </td>

                          <td className="salary-negative">
                            -
                            {formatCurrency(
                              salary.deductions
                            )}
                          </td>

                          <td>
                            <strong className="net-salary">
                              {formatCurrency(
                                getNetSalary(
                                  salary
                                )
                              )}
                            </strong>
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

      {/* =================================
          ADD SALARY MODAL
      ================================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="salary-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  PAYROLL MANAGEMENT
                </span>

                <h2>
                  Add Salary Record
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
              className="salary-form"
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

              <div className="salary-form-row">

                <div className="field">
                  <label>
                    Month *
                  </label>

                  <input
                    type="month"
                    name="month"
                    value={form.month}
                    onChange={handleInput}
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Basic Salary *
                  </label>

                  <input
                    type="number"
                    name="basicSalary"
                    min="0"
                    step="0.01"
                    value={
                      form.basicSalary
                    }
                    onChange={handleInput}
                    placeholder="50000"
                    required
                  />
                </div>

              </div>

              <div className="salary-form-row">

                <div className="field">
                  <label>
                    Allowances
                  </label>

                  <input
                    type="number"
                    name="allowances"
                    min="0"
                    step="0.01"
                    value={
                      form.allowances
                    }
                    onChange={handleInput}
                    placeholder="5000"
                  />
                </div>

                <div className="field">
                  <label>
                    Deductions
                  </label>

                  <input
                    type="number"
                    name="deductions"
                    min="0"
                    step="0.01"
                    value={
                      form.deductions
                    }
                    onChange={handleInput}
                    placeholder="2000"
                  />
                </div>

              </div>

              {/* NET PREVIEW */}

              <div className="salary-preview">
                <span>
                  Estimated Net Salary
                </span>

                <strong>
                  {formatCurrency(
                    Number(
                      form.basicSalary ||
                        0
                    ) +
                      Number(
                        form.allowances ||
                          0
                      ) -
                      Number(
                        form.deductions ||
                          0
                      )
                  )}
                </strong>
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
                    : "Create Salary"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salary;
